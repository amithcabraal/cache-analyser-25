import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NetworkRequest } from '../../types';
import { groupBy, sumBy } from 'lodash';
import { cacheRankings, getCacheRank } from '../../types/cacheRanking';
import { Filter } from '../../types';

interface SimpleBarChartProps {
  data: NetworkRequest[];
  title: string;
  groupByKey: keyof NetworkRequest | ((req: NetworkRequest) => string);
  valueType: 'size' | 'count';
  onFilterChange?: (filters: Partial<Filter>) => void;
}

interface ChartData {
  name: string;
  [key: string]: string | number;
}

export function SimpleBarChart({ data, title, groupByKey, valueType, onFilterChange }: SimpleBarChartProps) {
  const prepareData = (): ChartData[] => {
    const grouped = groupBy(data, typeof groupByKey === 'function' ? groupByKey : (item) => item[groupByKey] || 'Unknown');
    
    return Object.entries(grouped).map(([key, values]) => {
      const baseData: ChartData = { name: key || 'Unknown' };
      
      // Add data for each cache rank
      cacheRankings.forEach(rank => {
        const rankValues = values.filter(req => getCacheRank(req).rank === rank.rank);
        baseData[rank.rank] = valueType === 'size' 
          ? sumBy(rankValues, '6.size') / 1024 
          : rankValues.length;
      });
      
      return baseData;
    }).sort((a, b) => {
      // Calculate total value for sorting
      const totalA = cacheRankings.reduce((sum, rank) => sum + (a[rank.rank] as number), 0);
      const totalB = cacheRankings.reduce((sum, rank) => sum + (b[rank.rank] as number), 0);
      return totalB - totalA;
    });
  };

  const handleClick = (data: any, rank: string) => {
    if (!onFilterChange) return;

    const filters: Partial<Filter> = {};
    
    // Set filter based on the clicked bar's category
    if (typeof groupByKey === 'string') {
      switch (groupByKey) {
        case '4.x-cache':
          filters.xCache = [data.name];
          break;
        case '5.x-amz-cf-pop':
          filters.cfPop = data.name;
          break;
      }
    } else if (groupByKey.toString().includes('getFileType')) {
      // Handle file type filtering by setting URL pattern
      filters.urlPattern = `*.${data.name.toLowerCase()}`;
    }

    // Add cache rank filter
    filters.cacheRank = [rank];

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
          margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
        >
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            style={{ fontSize: '0.7rem' }}
          />
          <YAxis style={{ fontSize: '0.7rem' }} />
          <Tooltip />
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
              isAnimationActive={false}
              onClick={(data) => handleClick(data, rank.rank)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}