import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NetworkRequest, Filter } from '../../types';
import { cacheRankings, getCacheRank } from '../../types/cacheRanking';

interface DomainRequestChartProps {
  data: NetworkRequest[];
  title: string;
  onFilterChange?: (filters: Partial<Filter>) => void;
}

interface ChartData {
  domain: string;
  [key: string]: string | number;
}

export function DomainRequestChart({ data, title, onFilterChange }: DomainRequestChartProps) {
  const prepareData = (): ChartData[] => {
    const domainData: Record<string, ChartData> = {};
    
    data.forEach(request => {
      try {
        const domain = new URL(request['2.url']).hostname;
        if (!domainData[domain]) {
          domainData[domain] = { 
            domain,
            ...Object.fromEntries(cacheRankings.map(r => [r.rank, 0]))
          };
        }
        
        const rank = getCacheRank(request);
        domainData[domain][rank.rank] = (domainData[domain][rank.rank] as number) + 1;
      } catch {
        // Skip invalid URLs
      }
    });

    return Object.values(domainData)
      .sort((a, b) => {
        const totalA = cacheRankings.reduce((sum, r) => sum + (a[r.rank] as number), 0);
        const totalB = cacheRankings.reduce((sum, r) => sum + (b[r.rank] as number), 0);
        return totalB - totalA;
      })
      .slice(0, 10);
  };

  const handleClick = (data: any, rank: string) => {
    if (!onFilterChange) return;

    const filters: Partial<Filter> = {
      urlPattern: data.domain,
      cacheRank: [rank]
    };

    onFilterChange(filters);
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={prepareData()}
          layout="vertical"
          margin={{ top: 20, right: 80, left: 100, bottom: 5 }}
        >
          <XAxis type="number" style={{ fontSize: '0.7rem' }} />
          <YAxis 
            type="category" 
            dataKey="domain" 
            width={150} 
            style={{ fontSize: '0.7rem' }}
          />
          <Tooltip contentStyle={{ fontSize: '0.7rem' }} />
          <Legend 
            align="right"
            verticalAlign="bottom"
            layout="vertical"
            wrapperStyle={{ 
              fontSize: '0.7rem',
              right: 0,
              width: 'auto',
              paddingLeft: '10px'
            }}
          />
          {cacheRankings.map(rank => (
            <Bar
              key={rank.rank}
              dataKey={rank.rank}
              stackId="a"
              fill={rank.color}
              name={rank.rank}
              onClick={(data) => handleClick(data, rank.rank)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}