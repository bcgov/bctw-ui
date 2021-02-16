import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm:ss';
const formatLocal = 'dddd, MMMM D, YYYY h:mm A';

const getToday = (): string => dayjs().format(formatDay)
const asLocalTime = (dateStr: string): string => dayjs(dateStr).format('LLLL');
const getNow = (): string => dayjs().format(formatTime)
const isDayjs = (d: unknown): boolean => d instanceof dayjs
const dateObjectToTimeStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatTime) : 'never';
} 

export {
  asLocalTime,
  dateObjectToTimeStr,
  formatDay,
  formatLocal,
  formatTime,
  getNow,
  getToday,
  isDayjs,
}