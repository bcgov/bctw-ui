import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm:ss';

const getToday = (): string => dayjs().format(formatDay)
const getNow = (): string => dayjs().format(formatTime)
const isDayjs = (d: unknown): boolean => d instanceof dayjs
const dateObjectToTimeStr = (d: Date): string => dayjs(d).format(formatTime)

export {
  dateObjectToTimeStr,
  formatDay,
  formatTime,
  getNow,
  getToday,
  isDayjs,
}