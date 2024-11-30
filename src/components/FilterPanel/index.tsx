import { Grid, Box, IconButton, Tooltip } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { NetworkRequest, Filter } from '../../types';
import { uniq } from 'lodash';
import { FilterAutocomplete } from './FilterAutocomplete';
import { cacheRankings } from '../../types/cacheRanking';

interface FilterPanelProps {
  filters: Filter;
  onFilterChange: (filters: Filter) => void;
  onResetFilters: () => void;
  data: NetworkRequest[];
}

function sortDomains(domains: string[]): string[] {
  return domains.sort((a, b) => {
    const partsA = a.split('.').reverse();
    const partsB = b.split('.').reverse();
    
    for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
      if (partsA[i] !== partsB[i]) {
        return partsA[i].localeCompare(partsB[i]);
      }
    }
    
    if (partsA.length !== partsB.length) {
      return partsA.length - partsB.length;
    }
    
    return a.localeCompare(b);
  });
}

export function FilterPanel({ filters, onFilterChange, onResetFilters, data }: FilterPanelProps) {
  const methods = uniq(data.map(item => item['1.method']));
  const cacheControls = ['None', ...uniq(data.map(item => item['3.cache-control']).filter(Boolean))];
  const xCaches = ['None', ...uniq(data.map(item => item['4.x-cache']).filter(Boolean))];
  const domains = sortDomains(uniq(data.map(item => {
    try {
      return new URL(item['2.url']).hostname;
    } catch {
      return '';
    }
  }).filter(Boolean)));

  const handleFilterChange = (key: keyof Filter) => (value: string | string[] | null) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {hasActiveFilters && (
        <Tooltip title="Reset Filters">
          <IconButton 
            onClick={onResetFilters}
            sx={{ 
              position: 'absolute',
              top: -12,
              right: -12,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.method || []}
            onChange={handleFilterChange('method')}
            options={methods}
            label="Method"
            multiple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.domains || []}
            onChange={handleFilterChange('domains')}
            options={domains}
            label="Domains"
            multiple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.urlPattern || null}
            onChange={handleFilterChange('urlPattern')}
            options={domains}
            label="URL Pattern"
            placeholder="Pattern with *"
            freeSolo
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.cacheControl || []}
            onChange={handleFilterChange('cacheControl')}
            options={cacheControls}
            label="Cache Control"
            multiple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.xCache || []}
            onChange={handleFilterChange('xCache')}
            options={xCaches}
            label="X-Cache"
            multiple
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FilterAutocomplete
            value={filters.cacheRank || []}
            onChange={handleFilterChange('cacheRank')}
            options={cacheRankings.map(rank => rank.rank)}
            label="Cache Rank"
            multiple
          />
        </Grid>
      </Grid>
    </Box>
  );
}