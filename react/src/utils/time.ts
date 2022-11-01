import dayjs, { Dayjs } from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'YYYY-MM-DD HH:mm';
const format24Hour = 'HH:mm:ss';
const formatLocal = 'dddd, MMMM D, YYYY h:mm A';

// if a valid dayjs is object is provided, format it normally. or return null
const formatT = (d: Dayjs | null): string | null => d?.format(formatTime) ?? null;

//
const isInvalidDate = (d: Date): boolean => typeof d?.getFullYear === 'function' && d.getFullYear() <= 1900;

const isToday = (d: Dayjs | null): boolean => (!d ? false : d.isSame(dayjs()));
const getToday = (): string => dayjs().format(formatDay);
const getNow = (): string => dayjs().format(formatTime);
const asLocalTime = (dateStr: string): string => dayjs(dateStr).format('LLLL');

// converts a Date object to a formatted Dayjs time
const dateObjectToTimeStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatTime) : 'never';
};

// converts a Date object to a formatted Dayjs date
const dateObjectToDateStr = (d: Date): string => {
  const djs = dayjs(d);
  return djs.isValid() ? djs.format(formatDay) : '';
};

// parses a date string to a Dayjs instance and formats it
const formatDateStr = (s: string): string => {
  return dayjs(s).format(formatTime);
};

//1W === 1 Week / 1M === 1 Month
export type StartDateKey = '1W' | '2W' | '1M' | '3M' | '6M';
//Gets a preset start date. Used in Map page for search panel.
const getStartDate = (d: string, key: StartDateKey): string => {
  const endDate = new Date(d);
  const [num, unit] = key.split('');
  if (unit === 'W') {
    return dateObjectToDateStr(new Date(endDate.setDate(endDate.getDate() - parseInt(num) * 7 + 1)));
  }
  if (unit === 'M') {
    return dateObjectToDateStr(new Date(endDate.setMonth(endDate.getMonth() - parseInt(num))));
  }
};
//
const formatWithUTCOffset = (d: Date): string => {
  const djs = dayjs(d);
  const offset = djs.format('ZZ');
  let tz = '';
  if (offset.includes('-0800')) {
    tz = 'PST';
  } else if (offset.includes('-0700')) {
    tz = 'PDT';
  }
  return `${djs.format('YYYY-MM-DD H:mm:ss')} ${tz}`;
};

//
const getEndOfPreviousDay = (): Dayjs => {
  let y = dayjs().subtract(1, 'day');
  y = y.set('hour', 23);
  y = y.set('minute', 59);
  y = y.set('second', 59);
  return y;
};

export {
  asLocalTime,
  dateObjectToTimeStr,
  dateObjectToDateStr,
  formatDay,
  formatLocal,
  formatTime,
  format24Hour,
  getEndOfPreviousDay,
  formatT,
  getNow,
  getToday,
  formatDateStr,
  formatWithUTCOffset,
  isInvalidDate,
  getStartDate,
  isToday
};
