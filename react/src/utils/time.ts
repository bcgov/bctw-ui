import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm:ss';

const getToday = (): string => dayjs().format(formatDay)
const getNow = (): string => dayjs().format(formatTime)
const isDayjs = (d: unknown): boolean => d instanceof dayjs
const dateObjectToTimeStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatTime) : 'never';
} 

export {
  dateObjectToTimeStr,
  formatDay,
  formatTime,
  getNow,
  getToday,
  isDayjs,
}