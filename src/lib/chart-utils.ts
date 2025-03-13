
/**********************************************
 * chart-utils.ts
 * Helper functions for chart/time-range logic
 **********************************************/

export type TimeRange = 'hourly' | 'daily' | 'weekly' | 'monthly';

// getPeriodKey returns a "bucket" based on the timeRange
export function getPeriodKey(date: Date, timeRange: TimeRange): string {
  switch(timeRange) {
    case 'hourly':
      return `${date.getFullYear()}-${padNumber(date.getMonth()+1)}-${padNumber(date.getDate())}-${padNumber(date.getHours())}`;
    case 'daily':
      return `${date.getFullYear()}-${padNumber(date.getMonth()+1)}-${padNumber(date.getDate())}`;
    case 'weekly': {
      const weekNumber = getWeekNumber(date);
      return `${date.getFullYear()}-W${padNumber(weekNumber)}`;
    }
    case 'monthly':
      return `${date.getFullYear()}-${padNumber(date.getMonth()+1)}`;
    default:
      return `${date.getFullYear()}-${padNumber(date.getMonth()+1)}-${padNumber(date.getDate())}`;
  }
}

// getPeriodDate reconstructs a Date from a "periodKey"
export function getPeriodDate(periodKey: string, timeRange: TimeRange): Date {
  const parts = periodKey.split('-');
  switch(timeRange) {
    case 'hourly':
      return new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]), Number(parts[3]));
    case 'daily':
      return new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
    case 'weekly': {
      const [year, weekPart] = parts[1].split('W');
      return getDateOfWeek(parseInt(weekPart, 10), parseInt(year, 10));
    }
    case 'monthly':
      return new Date(Number(parts[0]), Number(parts[1])-1, 1);
    default:
      return new Date(Number(parts[0]), Number(parts[1])-1, parts[2] ? Number(parts[2]) : 1);
  }
}

// getAllPeriods returns a sorted array of all "period" keys from start -> end
export function getAllPeriods(start: Date, end: Date, timeRange: TimeRange): string[] {
  const periods: string[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    periods.push(getPeriodKey(current, timeRange));
    
    switch(timeRange) {
      case 'hourly':
        current.setHours(current.getHours() + 1);
        break;
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }
  
  return periods;
}

// Utility: pad a number to 2 digits
export function padNumber(num: number): string {
  return String(num).padStart(2, '0');
}

// getWeekNumber returns ISO week number
export function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// getDateOfWeek returns date for the "year-weekNumber" at Monday
export function getDateOfWeek(weekNumber: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = new Date(simple);
  
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  
  return ISOweekStart;
}

// Format a period key to a readable label based on time range
export function formatPeriodLabel(periodKey: string, timeRange: TimeRange): string {
  const date = getPeriodDate(periodKey, timeRange);
  
  switch(timeRange) {
    case 'hourly':
      return `${date.getHours()}:00`;
    case 'daily':
      return `${date.getDate()}/${date.getMonth() + 1}`;
    case 'weekly': {
      const weekNum = periodKey.split('-W')[1];
      return `Week ${weekNum}`;
    }
    case 'monthly': {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[date.getMonth()];
    }
    default:
      return periodKey;
  }
}
