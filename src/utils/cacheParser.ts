interface ParsedCacheControl {
  public: boolean;
  private: boolean;
  "max-age": number | null;
  "s-max-age": number | null;
  "no-cache": boolean;
  "no-store": boolean;
}

export function parseCacheControl(header: string | null): ParsedCacheControl {
  const result: ParsedCacheControl = {
    public: false,
    private: false,
    "max-age": null,
    "s-max-age": null,
    "no-cache": false,
    "no-store": false
  };

  if (!header) return result;

  const directives = header.split(',').map(d => d.trim().toLowerCase());

  for (const directive of directives) {
    if (directive === 'public') result.public = true;
    if (directive === 'private') result.private = true;
    if (directive === 'no-cache') result["no-cache"] = true;
    if (directive === 'no-store') result["no-store"] = true;

    if (directive.startsWith('max-age=')) {
      const value = parseInt(directive.split('=')[1]);
      result["max-age"] = isNaN(value) ? 0 : value;
    }

    if (directive.startsWith('s-maxage=') || directive.startsWith('s-max-age=')) {
      const value = parseInt(directive.split('=')[1]);
      result["s-max-age"] = isNaN(value) ? 0 : value;
    }
  }

  return result;
}

export function determineCacheUsed(fulfilledBy: string | null, cacheControl: ParsedCacheControl, xCache: string | null, status: number): string {
  // If status is 0, treat as error
  if (status === 0) {
    return 'error';
  }

  // If fulfilled by specific cache mechanism, use that
  if (fulfilledBy && (fulfilledBy === 'disk' || fulfilledBy === 'memory')) {
    return fulfilledBy;
  }

  // Check for CloudFront cache hit
  if (!fulfilledBy && xCache?.toLowerCase().includes('hit from cloudfront')) {
    return 'CDN';
  }

  if (cacheControl["no-cache"] || cacheControl["no-store"]) {
    return 'uncached';
  }

  const maxAge = cacheControl["max-age"];
  const sMaxAge = cacheControl["s-max-age"];

  if (maxAge !== null && maxAge > 0) {
    return 'browser';
  }

  if ((maxAge === null || maxAge === 0) && sMaxAge !== null && sMaxAge > 0) {
    return 'CDN';
  }

  return 'uncached';
}