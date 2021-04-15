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
const dateObjectToDateStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatDay) : '';
}

const formatDateStr = (s:string): string => {
  return dayjs(s).format(formatTime);
}

const formatWithUTCOffset = (d: Date):string => {
  const djs = dayjs(d);
  const offset = djs.format('ZZ');
  let tz = '';
  if (offset.includes('-0800')) {
    tz = 'PST';
  }
  else if (offset.includes('-0700')) {
    tz = 'PDT';
  }
  return `${djs.format('YYYY-MM-DD H:mm:ss')} ${tz}`;
} 

export {
  asLocalTime,
  dateObjectToTimeStr,
  dateObjectToDateStr,
  formatDay,
  formatLocal,
  formatTime,
  getNow,
  getToday,
  isDayjs,
  formatDateStr,
  formatWithUTCOffset,
}