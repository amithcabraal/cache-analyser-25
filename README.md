# Cache Analyzer

A powerful web application for analyzing HTTP cache performance and network traffic patterns. This tool helps developers and performance engineers understand and optimize their website's caching behavior.

## Features

- **Comprehensive Cache Analysis**: Visualize cache hit/miss rates, sizes, and patterns
- **Interactive Dashboard**: Customizable grid layout with resizable and draggable charts
- **Advanced Filtering**: Filter requests by method, URL pattern, cache status, and more
- **Domain Analysis**: Analyze cache performance by domain with detailed breakdowns
- **File Type Analysis**: Understand caching patterns across different file types
- **CloudFront Integration**: Special support for AWS CloudFront caching analysis
- **Data Import**: Import HAR files or JSON data for analysis
- **Shareable Analysis**: Share your analysis via URL with preserved filters and layout

## Getting Started

1. Visit the application
2. Click "New" to start a new analysis
3. Import your HAR file or JSON data
4. Use the filter panel to analyze specific aspects of your traffic
5. Interact with charts to drill down into specific patterns

## Data Format

The tool accepts HAR files or JSON data in the following format:

```json
[
  {
    "1.method": "GET",
    "2.url": "https://example.com/asset.js",
    "3.cache-control": "max-age=3600",
    "4.x-cache": "Hit from cloudfront",
    "5.x-amz-cf-pop": "LAX50-C2",
    "5.time": 100,
    "6.size": 1024,
    "7.status": 200,
    "8.fulfilledBy": null
  }
]
```

[Edit in StackBlitz ⚡️](https://stackblitz.com/~/github.com/amithcabraal/cache-analyser)