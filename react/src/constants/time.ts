import dayjs from 'dayjs';

const formatDay = 'YYYY-MM-DD';
const getToday = () => dayjs().format(formatDay);

export {
  formatDay,
  getToday
}