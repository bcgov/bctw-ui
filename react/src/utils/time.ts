import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const formatTime = 'DD-MM-YYYY HH:mm:ss';

const getToday = () => dayjs().format(formatDay);
const getNow = () => dayjs().format(formatTime);

export {
  formatDay,
  formatTime,
  getNow,
  getToday
}