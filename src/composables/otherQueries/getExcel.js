export default async function getExcel(api, name = 'Отчёт')  {
  try {
    const response = await api.excel();
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/vnd.ms-excel" })
    );
    const date = formatDate(response.headers['last-modified']);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${name}_${date}.xls`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error(e);
  }
};

function formatDate(dateString) {
  // Парсим строку в объект Date
  const date = new Date(dateString);

  // Преобразуем в время GMT+5
  const gmtPlus5Offset = 5 * 60; // Смещение GMT+5 от UTC в минутах
  const utcOffset = date.getTimezoneOffset();
  const gmtPlus5Time = new Date(date.getTime() + (gmtPlus5Offset + utcOffset) * 60000);

  // Форматируем дату и время
  const day = String(gmtPlus5Time.getDate()).padStart(2, '0');
  const month = String(gmtPlus5Time.getMonth() + 1).padStart(2, '0'); // месяцы начинаются с 0
  const year = gmtPlus5Time.getFullYear();
  const hours = String(gmtPlus5Time.getHours()).padStart(2, '0');
  const minutes = String(gmtPlus5Time.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year}_${hours}:${minutes}`;
}