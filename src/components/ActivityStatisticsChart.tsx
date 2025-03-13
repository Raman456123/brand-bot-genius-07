
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TimeSeriesData, { TimeSeriesDataPoint } from './TimeSeriesData';
import { TimeRange } from '@/lib/chart-utils';

// Mock data for demonstration
const generateMockData = (days: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate 0-3 activities per day
    const activitiesCount = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < activitiesCount; j++) {
      // Create activities at different hours
      const activityTime = new Date(date);
      activityTime.setHours(Math.floor(Math.random() * 24));
      
      data.push({
        timestamp: activityTime,
        value: 1,
        type: ['draw', 'post', 'analyze', 'think'][Math.floor(Math.random() * 4)]
      });
    }
  }
  
  return data;
};

const mockData = generateMockData(30); // 30 days of data

interface ActivityStatisticsChartProps {
  data?: TimeSeriesDataPoint[];
  title?: string;
  className?: string;
}

const ActivityStatisticsChart: React.FC<ActivityStatisticsChartProps> = ({ 
  data = mockData,
  title = "Activity Frequency", 
  className
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  return (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'line')}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <TimeSeriesData
        data={data}
        timeRange={timeRange}
        chartType={chartType}
        title=""
        yAxisLabel="Activities"
        xAxisLabel="Time"
        barColor="#8b5cf6"
        lineColor="#8b5cf6"
      />
    </div>
  );
};

export default ActivityStatisticsChart;
