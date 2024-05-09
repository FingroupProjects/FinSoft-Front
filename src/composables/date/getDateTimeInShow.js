export default function getDateTimeInShow(dateTimeString, sign = '.', reverse = false) {
  const dateTime = new Date(dateTimeString);
  const year = dateTime.getFullYear();
  const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
  const day = dateTime.getDate().toString().padStart(2, "0");
  const hours = dateTime.getHours().toString().padStart(2, "0");
  const minutes = dateTime.getMinutes().toString().padStart(2, "0");

  // Форматируем дату и время в зависимости от параметра reverse
  if (reverse) {
    return `${year}${sign}${month}${sign}${day} ${hours}:${minutes}`;
  } else {
    return `${day}${sign}${month}${sign}${year} ${hours}:${minutes}`;
  }
}
