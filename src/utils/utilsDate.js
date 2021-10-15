import { format } from 'date-fns';

function formatDate(date, formatStr = 'yyyy-MM-dd HH:mm') {
  return format(date, formatStr);
}

export default {
  format,
  formatDate,
};
