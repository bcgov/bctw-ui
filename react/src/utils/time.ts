import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm:ss';

const getToday = () => dayjs().format(formatDay);
const getNow = () => dayjs().format(formatTime);
const isDayjs = (d: any): boolean => d instanceof dayjs;
const dateObjectToTimeStr = (d: Date): string => dayjs(d).format(formatTime);

export {
  dateObjectToTimeStr,
  formatDay,
  formatTime,
  getNow,
  getToday,
  isDayjs,
}