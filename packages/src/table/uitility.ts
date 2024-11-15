import { format } from 'date-fns';

export const formatDateRange = (range: [Date, Date]) => {
    const [startDate, endDate] = range;
    const formattedStartDate = format(startDate, 'MMMM do, yyyy');
    const formattedEndDate = format(endDate, 'MMMM do, yyyy');
    return `${formattedStartDate} - ${formattedEndDate}`;
  };
  
export const formatDate = (date: Date) => {
    const formattedDate = format(date, 'MMMM do, yyyy');
    return `${formattedDate}`;
};
  