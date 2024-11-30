import { Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { NetworkRequest } from '../types';
import { groupBy, sumBy } from 'lodash';

interface DomainChartProps {
  data: NetworkRequest[];
}

interface ChartData {
  domain: string;
  hit: number;
  miss: number;
}

export function DomainChart({ data }: DomainChartProps) {
  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  const isHit = (xCache: string) => {
    return xCache.includes('Hit from cloudfront');
  };

  const prepareData = (): ChartData[] => {
    const domainGroups = groupBy(data, item => extractDomain(item['2.url']));
    
    return Object.entries(domainGroups).map(([domain, requests]) => {
      const hitBytes = sumBy(
        requests.filter(r => isHit(r['4.x-cache'])),
        '6.size'
      ) / 1024; // KB

      const missBytes = sumBy(
        requests.filter(r => !isHit(r['4.x-cache'])),
        '6.size'
      ) / 1024; // KB

      return {
        domain,
        hit: hitBytes,
        miss: -missBytes // Negative for visual distinction
      };
    });
  };

  const chartData = prepareData();

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Cache Performance by Domain (KB)
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="domain" width={150} />
          <Tooltip />
          <Bar dataKey="hit" fill="#82ca9d" name="Cache Hit" />
          <Bar dataKey="miss" fill="#ff8042" name="Cache Miss" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}