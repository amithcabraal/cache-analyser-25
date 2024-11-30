import { Grid } from '@mui/material';
import { NetworkRequest, Filter } from '../types';
import { uniq } from 'lodash';
import { FilterAutocomplete } from './FilterAutocomplete';

interface FilterPanelProps {
  filters: Filter;
  onFilterChange: (filters: Filter) => void;
  data: NetworkRequest[];
}

export function FilterPanel({ filters, onFilterChange, data }: FilterPanelProps) {
  const methods = uniq(data.map(item => item['1.method']));
  const cacheControls = uniq(data.map(item => item['3.cache-control']));
  const xCaches = uniq(data.map(item => item['4.x-cache']));
  const domains = uniq(data.map(item => {
    try {
      return new URL(item['2.url']).hostname;
    } catch {
      return '';
    }
  }).filter(Boolean));

  const handleFilterChange = (key: keyof Filter) => (value: string | string[] | null) => {
    if (key === 'urlPattern') {
      onFilterChange({
        ...filters,
        [key]: value as string || undefined
      });
    } else {
      onFilterChange({
        ...filters,
        [key]: (value as string[]) || undefined
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <FilterAutocomplete
          value={filters.method || []}
          onChange={handleFilterChange('method')}
          options={methods}
          label="Method"
          multiple
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FilterAutocomplete
          value={filters.urlPattern || null}
          onChange={handleFilterChange('urlPattern')}
          options={domains}
          label="URL Pattern"
          placeholder="Domain or pattern with *"
          freeSolo
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FilterAutocomplete
          value={filters.cacheControl || []}
          onChange={handleFilterChange('cacheControl')}
          options={cacheControls.filter(Boolean)}
          label="Cache Control"
          multiple
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FilterAutocomplete
          value={filters.xCache || []}
          onChange={handleFilterChange('xCache')}
          options={xCaches.filter(Boolean)}
          label="X-Cache"
          multiple
        />
      </Grid>
    </Grid>
  );
}