import { NetworkRequest, Filter } from '../types';
import { SimpleBarChart } from './charts/SimpleBarChart';
import { DomainCacheChart } from './charts/DomainCacheChart';
import { DomainRequestChart } from './charts/DomainRequestChart';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { DataTable } from './DataTable';
import { getFileType } from '../utils/fileTypes';
import { Paper } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface StatisticsPanelProps {
  type: 'size-by-cache' | 'requests-by-cache' | 'size-by-pop' | 'requests-by-pop' | 
        'size-by-type' | 'requests-by-type' | 'domain-cache' | 'domain-requests' | 
        'time-series-requests' | 'time-series-bytes' | 'data-table';
  data: NetworkRequest[];
  onFilterChange?: (filters: Partial<Filter>) => void;
}

export function StatisticsPanel({ type, data, onFilterChange }: StatisticsPanelProps) {
  const content = (() => {
    switch (type) {
      case 'size-by-cache':
        return (
          <SimpleBarChart
            data={data}
            title="Total Size by Cache Status (KB)"
            groupByKey="4.x-cache"
            valueType="size"
            onFilterChange={onFilterChange}
          />
        );
      case 'requests-by-cache':
        return (
          <SimpleBarChart
            data={data}
            title="Request Count by Cache Status"
            groupByKey="4.x-cache"
            valueType="count"
            onFilterChange={onFilterChange}
          />
        );
      case 'size-by-pop':
        return (
          <SimpleBarChart
            data={data}
            title="Total Size by PoP (KB)"
            groupByKey="5.x-amz-cf-pop"
            valueType="size"
            onFilterChange={onFilterChange}
          />
        );
      case 'requests-by-pop':
        return (
          <SimpleBarChart
            data={data}
            title="Request Count by PoP"
            groupByKey="5.x-amz-cf-pop"
            valueType="count"
            onFilterChange={onFilterChange}
          />
        );
      case 'size-by-type':
        return (
          <SimpleBarChart
            data={data}
            title="Total Size by File Type (KB)"
            groupByKey={(req) => getFileType(req['2.url'])}
            valueType="size"
            onFilterChange={onFilterChange}
          />
        );
      case 'requests-by-type':
        return (
          <SimpleBarChart
            data={data}
            title="Request Count by File Type"
            groupByKey={(req) => getFileType(req['2.url'])}
            valueType="count"
            onFilterChange={onFilterChange}
          />
        );
      case 'domain-cache':
        return (
          <DomainCacheChart
            data={data}
            title="Top 10 Domains Cache Performance (KB)"
            onFilterChange={onFilterChange}
          />
        );
      case 'domain-requests':
        return (
          <DomainRequestChart
            data={data}
            title="Top 10 Domains Cache Performance (Requests)"
            onFilterChange={onFilterChange}
          />
        );
      case 'time-series-requests':
        return (
          <TimeSeriesChart
            data={data}
            title="Requests per Minute by Cache Status"
            valueType="requests"
          />
        );
      case 'time-series-bytes':
        return (
          <TimeSeriesChart
            data={data}
            title="KB per Minute by Cache Status"
            valueType="bytes"
          />
        );
      case 'data-table':
        return (
          <div style={{ height: 'calc(100% - 40px)', width: '100%', overflow: 'hidden' }}>
            <DataTable data={data} />
          </div>
        );
    }
  })();

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="drag-handle" style={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        cursor: 'move',
        zIndex: 1000
      }}>
        <DragIndicatorIcon />
      </div>
      {content}
    </Paper>
  );
}