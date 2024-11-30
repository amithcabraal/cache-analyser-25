import { NetworkRequest } from '../types';

export interface CacheRanking {
  rank: string;
  color: string;
  priority: number;
  matches: (request: NetworkRequest) => boolean;
}

export const cacheRankings: CacheRanking[] = [
  {
    rank: 'Optimal',
    color: '#90EE90', // Slightly darker light green
    priority: 1,
    matches: (request) => request['8.fulfilledBy'] === '(memory cache)'
  },
  {
    rank: 'Excellent',
    color: '#3CB371', // Medium green
    priority: 2,
    matches: (request) => {
      return request['8.fulfilledBy'] === '(disk cache)' ||
             request['8.fulfilledBy'] === '(service worker)' ||
             request['8.fulfilledBy'] === '(prefetch cache)' ||
             request['8.fulfilledBy'] === '(preload cache)';
    }
  },
  {
    rank: 'Browser Cache',
    color: '#006400', // Dark green
    priority: 3,
    matches: (request) => request['parsed.cache-used'] === 'browser'
  },
  {
    rank: 'CDN Hit',
    color: '#4FB3E8', // Slightly darker light blue
    priority: 4,
    matches: (request) => {
      const xCache = request['4.x-cache']?.toLowerCase() || '';
      return xCache.includes('hit from cloudfront') ||
             xCache.includes('refreshhit from cloudfront') ||
             xCache.includes('lambdageneratedresponse from cloudfront');
    }
  },
  {
    rank: 'CDN Miss',
    color: '#00008B', // Dark blue
    priority: 5,
    matches: (request) => {
      const xCache = request['4.x-cache']?.toLowerCase() || '';
      const maxAge = request['parsed.cache-control']['max-age'];
      const sMaxAge = request['parsed.cache-control']['s-max-age'];
      
      return xCache.includes('miss from cloudfront') && 
             ((maxAge !== null && maxAge > 0) || (sMaxAge !== null && sMaxAge > 0));
    }
  },
  {
    rank: 'Error',
    color: '#FF0000', // Red
    priority: 6,
    matches: (request) => {
      const xCache = request['4.x-cache']?.toLowerCase() || '';
      const status = request['7.status'];
      
      return xCache.includes('error from cloudfront') ||
             status >= 400 ||
             status === 0; // Added condition for status code 0
    }
  },
  {
    rank: 'Uncached',
    color: '#8B0000', // Dark red
    priority: 7,
    matches: (request) => {
      const xCache = request['4.x-cache']?.toLowerCase() || '';
      return xCache.includes('miss from cloudfront') ||
             !xCache;
    }
  }
];

export function getCacheRank(request: NetworkRequest): CacheRanking {
  // Find the first matching rank based on priority
  for (const rank of cacheRankings) {
    if (rank.matches(request)) {
      return rank;
    }
  }
  // Return the last rank (Uncached) as default
  return cacheRankings[cacheRankings.length - 1];
}