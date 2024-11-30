export function getFileType(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'js':
      case 'mjs':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'JavaScript';
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return 'CSS';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
      case 'ico':
        return 'Images';
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot':
      case 'otf':
        return 'Fonts';
      case 'json':
        return 'JSON';
      case 'html':
      case 'htm':
        return 'HTML';
      case 'mp4':
      case 'webm':
      case 'ogg':
        return 'Video';
      case 'mp3':
      case 'wav':
        return 'Audio';
      default:
        // Check for API calls or other dynamic resources
        if (pathname.includes('/api/') || !ext) {
          return 'API/Dynamic';
        }
        return 'Other';
    }
  } catch {
    return 'Invalid URL';
  }
}