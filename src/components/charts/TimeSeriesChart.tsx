import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NetworkRequest } from '../../types';
import { cacheRankings } from '../../types/cacheRanking';
import { groupBy } from 'lodash';

interface TimeSeriesChartProps {
  data: NetworkRequest[];
  title: string;
  valueType: 'requests' | 'bytes';
}

interface TimePoint {
  timestamp: string;
  [key: string]: string | number;
}

export function TimeSeriesChart({ data, title, valueType }: TimeSeriesChartProps) {
  const prepareData = (): TimePoint[] => {
    // Group requests by minute
    const timePoints = groupBy(data, (request) => {
      const date = new Date(request['9.timestamp']);
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes()
      ).getTime();
    });

    // Convert grouped data to chart format
    return Object.entries(timePoints)
      .map(([timestamp, requests]) => {
        const point: TimePoint = {
          timestamp: new Date(parseInt(timestamp)).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        // Initialize all ranks with 0
        cacheRankings.forEach(rank => {
          point[rank.rank] = 0;
        });

        // Count requests or sum bytes for each cache rank
        requests.forEach(request => {
          const rank = cacheRankings.find(r => r.matches(request));
          if (rank) {
            point[rank.rank] = (point[rank.rank] as number) + 
              (valueType === 'requests' ? 1 : request['6.size'] / 1024); // Convert to KB for bytes
          }
        });

        return point;
      })
      .sort((a, b) => {
        // Sort by timestamp
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB;
      });
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
            dataKey="timestamp"
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
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}