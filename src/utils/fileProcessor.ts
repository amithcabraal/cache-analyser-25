import JSZip from 'jszip';
import { NetworkRequest, DataFile } from '../types';
import { parseCacheControl, determineCacheUsed } from './cacheParser';

export async function processHarData(harData: any): Promise<NetworkRequest[]> {
  const entries = harData.log.entries;
  return entries.map((entry: any) => {
    const cacheControl = entry.response.headers.find((h: any) => h.name.toLowerCase() === "cache-control")?.value || null;
    const xCache = entry.response.headers.find((h: any) => h.name.toLowerCase() === "x-cache")?.value || null;
    const parsedCacheControl = parseCacheControl(cacheControl);
    const fulfilledBy = entry.response._fulfilledBy || null;
    const status = entry.response.status;

    let timestamp: number;
    try {
      timestamp = Date.parse(entry.startedDateTime);
      if (isNaN(timestamp)) {
        console.warn('Invalid date format:', entry.startedDateTime);
        timestamp = Date.now();
      }
    } catch (error) {
      console.warn('Error parsing date:', error);
      timestamp = Date.now();
    }

    return {
      "1.method": entry.request.method,
      "2.url": entry.request.url,
      "3.cache-control": cacheControl,
      "4.x-cache": xCache,
      "5.x-amz-cf-pop": entry.response.headers.find((h: any) => h.name.toLowerCase() === "x-amz-cf-pop")?.value || null,
      "5.time": entry.time,
      "6.size": entry.response.content.size,
      "7.status": status,
      "8.fulfilledBy": fulfilledBy,
      "9.timestamp": timestamp,
      "parsed.cache-control": parsedCacheControl,
      "parsed.cache-used": determineCacheUsed(fulfilledBy, parsedCacheControl, xCache, status)
    };
  });
}

export async function processJsonData(jsonData: any[]): Promise<NetworkRequest[]> {
  return jsonData.map(entry => {
    const parsedCacheControl = parseCacheControl(entry["3.cache-control"]);
    return {
      ...entry,
      "9.timestamp": entry["9.timestamp"] || Date.now(),
      "parsed.cache-control": parsedCacheControl,
      "parsed.cache-used": determineCacheUsed(
        entry["8.fulfilledBy"],
        parsedCacheControl,
        entry["4.x-cache"],
        entry["7.status"]
      )
    };
  });
}

export async function processZipFile(file: File): Promise<DataFile[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  const results: DataFile[] = [];

  for (const [filename, zipEntry] of Object.entries(contents.files)) {
    if (zipEntry.dir) continue;

    const content = await zipEntry.async('string');
    try {
      const json = JSON.parse(content);
      const processedData = json.log && json.log.entries 
        ? await processHarData(json)
        : await processJsonData(json);

      results.push({
        name: filename,
        data: processedData
      });
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }

  return results;
}

export async function createDataZip(files: DataFile[]): Promise<Blob> {
  const zip = new JSZip();

  files.forEach(file => {
    const jsonContent = JSON.stringify(file.data, null, 2);
    const filename = file.name.endsWith('.json') ? file.name : `${file.name}.json`;
    zip.file(filename, jsonContent);
  });

  return await zip.generateAsync({ type: 'blob' });
}