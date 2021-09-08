import dayjs, { Dayjs } from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm';
const format24Hour = 'HH:mm:ss';
const formatLocal = 'dddd, MMMM D, YYYY h:mm A';

// used when creating new objects that have a date property. Use this as an arbitrary 'invalid date'
const getInvalidDate = (): Date => new Date('1900-01-01');

//
const isInvalidDate = (d: Date): boolean => typeof d?.getFullYear === 'function' && d.getFullYear() <= 1900;

const getToday = (): string => dayjs().format(formatDay)
const getNow = (): string => dayjs().format(formatTime)
const asLocalTime = (dateStr: string): string => dayjs(dateStr).format('LLLL');

// converts a Date object to a formatted Dayjs time
const dateObjectToTimeStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatTime) : 'never';
} 

// converts a Date object to a formatted Dayjs date
const dateObjectToDateStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatDay) : '';
}

// parses a date string to a Dayjs instance and formats it
const formatDateStr = (s:string): string => {
  return dayjs(s).format(formatTime);
}

// 
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

// 
const getEndOfPreviousDay = (): Dayjs => {
  let y = dayjs().subtract(1, 'day');
  y = y.set('hour', 23);
  y = y.set('minute', 59);
  y = y.set('second', 59);
  return y;
}

export {
  asLocalTime,
  dateObjectToTimeStr,
  dateObjectToDateStr,
  formatDay,
  formatLocal,
  formatTime,
  format24Hour,
  getEndOfPreviousDay,
  getNow,
  getToday,
  formatDateStr,
  formatWithUTCOffset,
  getInvalidDate,
  isInvalidDate,
}