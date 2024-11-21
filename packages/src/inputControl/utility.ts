// Importing the 'format' function from the 'date-fns' library.
// The 'date-fns' library provides utility functions for working with dates, including formatting.
import { format } from 'date-fns';

// Function to format a date range (i.e., an array containing a start date and an end date).
// The input is expected to be an array of two Date objects, representing the start and end dates of the range.
export const formatDateRange = (range: [Date, Date]) => {
  // Destructuring the range array to get the start and end dates.
  const [startDate, endDate] = range;

  // Validate the start and end dates
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    console.error('Invalid start date');
    return ''; // Return empty string or some fallback
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    console.error('Invalid end date');
    return ''; // Return empty string or some fallback
  }
  // Using 'format' from 'date-fns' to format the start date in the format 'Month day, year' (e.g., 'October 12, 2024').
  const formattedStartDate = format(startDate, 'MMMM do, yyyy');

  // Formatting the end date in the same format as the start date.
  const formattedEndDate = format(endDate, 'MMMM do, yyyy');

  // Returning a string that combines the formatted start and end dates, separated by a dash.
  // Example: 'October 12, 2024 - October 15, 2024'
  return `${formattedStartDate} - ${formattedEndDate}`;
};

// Function to format a single date (not a range).
// The input is expected to be a single Date object, and the output is the formatted date.
export const formatDate = (date: Date) => {
  // Validate the date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date');
    return ''; // Return empty string or some fallback
  }

  // Formatting the single date in the format 'Month day, year' (e.g., 'October 12, 2024').
  const formattedDate = format(date, 'MMMM do, yyyy');

  // Returning the formatted date as a string.
  return `${formattedDate}`;
};
