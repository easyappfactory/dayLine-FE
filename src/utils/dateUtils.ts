export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const getToday = () => {
  return new Date();
};

export const formatDate = (date: Date, separator: string = '.') => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${separator}${month}${separator}${day}`;
};

export const parseDate = (dateStr: string) => {
  return new Date(dateStr);
};

export const isSameMonth = (dateStr: string, year: number, month: number) => {
  const date = new Date(dateStr);
  return date.getFullYear() === year && date.getMonth() === month;
};
