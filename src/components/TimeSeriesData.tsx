
import React from 'react';
import { 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  type?: string;
}

export interface TimeSeriesDataProps {
  data: TimeSeriesDataPoint[];
  timeRange?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  chartType?: 'bar' | 'line';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  barColor?: string;
  lineColor?: string;
  className?: string;
}

const TimeSeriesData: React.FC<TimeSeriesDataProps> = ({
  data,
  timeRange = 'daily',
  chartType = 'bar',
  title = 'Activity Data',
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  barColor = '#8b5cf6',
  lineColor = '#8b5cf6',
  className
}) => {
  // Group data by time period
  const groupedData = React.useMemo(() => {
    const grouped: Record<string, { date: Date, value: number }> = {};
    
    data.forEach(point => {
      const date = point.timestamp;
      let key = '';
      
      // Create a key based on the timeRange
      switch(timeRange) {
        case 'hourly':
          key = `${date.getFullYear()}-${padNumber(date.getMonth()+1)}-${padNumber(date.getDate())}-${padNumber(date.getHours())}`;
          break;
        case 'daily':
          key = `${date.getFullYear()}-${padNumber(date.getMonth()+1)}-${padNumber(date.getDate())}`;
          break;
        case 'weekly': {
          const weekNumber = getWeekNumber(date);
          key = `${date.getFullYear()}-W${padNumber(weekNumber)}`;
          break;
        }
        case 'monthly':
          key = `${date.getFullYear()}-${padNumber(date.getMonth()+1)}`;
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = { date, value: 0 };
      }
      
      grouped[key].value += point.value;
    });
    
    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([_, data]) => data)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, timeRange]);

  // Format date for display on chart
  const formatDate = (date: Date) => {
    switch(timeRange) {
      case 'hourly':
        return `${date.getHours()}:00`;
      case 'daily':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case 'weekly':
        return `W${getWeekNumber(date)}`;
      case 'monthly':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[date.getMonth()];
      default:
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  };

  // Helper functions
  const padNumber = (num: number): string => {
    return String(num).padStart(2, '0');
  };

  const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  return (
    <div className={`time-series-data ${className || ''}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => formatDate(date as Date)} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(label) => {
                  const date = label as Date;
                  return `${date.toLocaleDateString()} ${timeRange === 'hourly' ? date.getHours() + ':00' : ''}`;
                }}
              />
              <Legend />
              <Bar dataKey="value" fill={barColor} name="Activity Count" />
            </BarChart>
          ) : (
            <LineChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => formatDate(date as Date)} 
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(label) => {
                  const date = label as Date;
                  return `${date.toLocaleDateString()} ${timeRange === 'hourly' ? date.getHours() + ':00' : ''}`;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={lineColor} 
                activeDot={{ r: 8 }} 
                name="Activity Count" 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeSeriesData;
