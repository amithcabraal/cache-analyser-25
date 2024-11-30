import { Box, Button, TextField, Typography, Stack, LinearProgress } from '@mui/material';
import { NetworkRequest, DataFile } from '../types';
import { useState } from 'react';
import { processHarData, processJsonData, processZipFile } from '../utils/fileProcessor';

interface DataImportProps {
  onDataImport: (files: DataFile[]) => void;
  onClose: () => void;
  onFileNameUpdate: (name: string | null) => void;
}

export function DataImport({ onDataImport, onClose, onFileNameUpdate }: DataImportProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      if (file.name.endsWith('.zip')) {
        const files = await processZipFile(file);
        onDataImport(files);
        onFileNameUpdate(file.name);
        onClose();
        return;
      }

      const text = await file.text();
      const data = JSON.parse(text);
      
      onFileNameUpdate(file.name);
      
      let processedData: NetworkRequest[];
      if (data.log && data.log.entries) {
        processedData = await processHarData(data);
      } else if (Array.isArray(data)) {
        processedData = await processJsonData(data);
      } else {
        throw new Error('Invalid data format');
      }

      onDataImport([{ name: file.name, data: processedData }]);
      onClose();
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error parsing file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(urlInput);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const urlParts = urlInput.split('/');
        const filename = urlParts[urlParts.length - 1] || 'imported-data.json';
        onFileNameUpdate(filename);
        
        const processedData = await processJsonData(data);
        onDataImport([{ name: filename, data: processedData }]);
        onClose();
      } else {
        alert('Invalid data format. URL must return a JSON array.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data from URL. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Import Data</Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>Upload File:</Typography>
          <Stack direction="row" spacing={2}>
            <input
              accept=".har,.json,.zip,application/json,application/zip"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" disabled={isProcessing}>
                Upload HAR/JSON/ZIP File
              </Button>
            </label>
          </Stack>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Supported formats: HAR files (.har), JSON array (.json), or ZIP containing multiple HAR/JSON files
          </Typography>
        </Box>
        
        {isProcessing && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Processing file...
            </Typography>
          </Box>
        )}
        
        <Typography variant="h6">Or import from URL:</Typography>
        <TextField
          fullWidth
          label="Data URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/data.json"
          disabled={isProcessing}
        />
        <Button
          variant="contained"
          onClick={handleUrlImport}
          disabled={!urlInput || isProcessing}
        >
          Import from URL
        </Button>
      </Stack>
    </Box>
  );
}