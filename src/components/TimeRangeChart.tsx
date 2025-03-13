
import React, { useMemo } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { TimeRange, getAllPeriods, getPeriodDate, formatPeriodLabel } from '@/lib/chart-utils';

export type TimeSeriesData = {
  timestamp: Date;
  value: number;
  [key: string]: any;
};

export type ChartType = 'bar' | 'line';

export interface TimeRangeChartProps {
  data: TimeSeriesData[];
  timeRange: TimeRange;
  chartType?: ChartType;
  startDate?: Date;
  endDate?: Date;
  valueKey?: string;
  title?: string;
  subtitle?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  barColor?: string;
  lineColor?: string;
  className?: string;
}

const TimeRangeChart: React.FC<TimeRangeChartProps> = ({
  data,
  timeRange,
  chartType = 'bar',
  startDate: propStartDate,
  endDate: propEndDate,
  valueKey = 'value',
  title,
  subtitle,
  yAxisLabel,
  xAxisLabel,
  barColor = '#3b82f6',
  lineColor = '#3b82f6',
  className
}) => {
  // Determine start and end dates if not provided
  const startDate = useMemo(() => {
    if (propStartDate) return propStartDate;
    if (data.length === 0) return new Date();
    return new Date(Math.min(...data.map(d => d.timestamp.getTime())));
  }, [data, propStartDate]);

  const endDate = useMemo(() => {
    if (propEndDate) return propEndDate;
    if (data.length === 0) return new Date();
    return new Date(Math.max(...data.map(d => d.timestamp.getTime())));
  }, [data, propEndDate]);

  // Prepare chart data with all periods in range
  const chartData = useMemo(() => {
    // Get all period keys for the time range
    const allPeriodKeys = getAllPeriods(startDate, endDate, timeRange);
    
    // Index the data by period key for faster lookup
    const dataByPeriod: Record<string, TimeSeriesData[]> = {};
    data.forEach(item => {
      const periodKey = timeRange === 'hourly' 
        ? `${item.timestamp.getFullYear()}-${String(item.timestamp.getMonth() + 1).padStart(2, '0')}-${String(item.timestamp.getDate()).padStart(2, '0')}-${String(item.timestamp.getHours()).padStart(2, '0')}`
        : timeRange === 'daily'
        ? `${item.timestamp.getFullYear()}-${String(item.timestamp.getMonth() + 1).padStart(2, '0')}-${String(item.timestamp.getDate()).padStart(2, '0')}`
        : timeRange === 'weekly'
        ? `${item.timestamp.getFullYear()}-W${String(Math.ceil((item.timestamp.getDate() / 7))).padStart(2, '0')}`
        : `${item.timestamp.getFullYear()}-${String(item.timestamp.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dataByPeriod[periodKey]) {
        dataByPeriod[periodKey] = [];
      }
      dataByPeriod[periodKey].push(item);
    });
    
    // Create the formatted chart data with all periods
    return allPeriodKeys.map(periodKey => {
      const periodData = dataByPeriod[periodKey] || [];
      const periodDate = getPeriodDate(periodKey, timeRange);
      
      // Calculate value for the period (sum of values or take the first value)
      const periodValue = periodData.length > 0 
        ? periodData.reduce((sum, item) => sum + (item[valueKey] || 0), 0) 
        : 0;
      
      return {
        period: periodKey,
        date: periodDate,
        label: formatPeriodLabel(periodKey, timeRange),
        [valueKey]: periodValue,
        count: periodData.length
      };
    });
  }, [data, timeRange, startDate, endDate, valueKey]);

  const chartConfig = {
    value: { 
      label: "Value",
      theme: {
        light: barColor,
        dark: barColor
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      
      <div className="mt-4 h-[300px]">
        <ChartContainer 
          config={chartConfig}
          className="h-full"
        >
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip 
                content={<ChartTooltipContent />} 
              />
              <Legend content={<ChartLegendContent />} />
              <Bar dataKey={valueKey} name="Value" fill={barColor} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="label" 
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
              />
              <YAxis 
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip 
                content={<ChartTooltipContent />} 
              />
              <Legend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey={valueKey} name="Value" stroke={lineColor} />
            </LineChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};

export default TimeRangeChart;
