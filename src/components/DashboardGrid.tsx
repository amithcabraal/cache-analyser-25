import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { NetworkRequest, PanelConfig, Filter } from '../types';
import { StatisticsPanel } from './StatisticsPanel';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  data: NetworkRequest[];
  panels: PanelConfig[];
  onLayoutChange: (panels: PanelConfig[]) => void;
  onFilterChange?: (filters: Partial<Filter>) => void;
}

export function DashboardGrid({ data, panels, onLayoutChange, onFilterChange }: DashboardGridProps) {
  const handleLayoutChange = (layout: Layout[]) => {
    const updatedPanels = panels.map(panel => {
      const layoutItem = layout.find(item => item.i === panel.i);
      if (!layoutItem) return panel;
      return {
        ...panel,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
      };
    });
    onLayoutChange(updatedPanels);
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={{ lg: panels }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={150}
      onLayoutChange={handleLayoutChange}
      isResizable
      draggableHandle=".drag-handle"
    >
      {panels.map((panel) => (
        <div key={panel.i}>
          <StatisticsPanel 
            type={panel.type} 
            data={data} 
            onFilterChange={onFilterChange}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}