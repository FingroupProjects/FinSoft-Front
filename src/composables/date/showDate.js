export default function showDate(dateTimeString, sign = '.', reverse= false) {
  const dateTime = new Date(dateTimeString);
  const year = dateTime.getFullYear();
  const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
  const day = dateTime.getDate().toString().padStart(2, "0");
  return reverse ? `${year}${sign}${month}${sign}${day}` :`${day}${sign}${month}${sign}${year}`;
}
