export default async function getExcel(api)  {
  try {
    const { data } = await api.excel();
    const url = window.URL.createObjectURL(
      new Blob([data], { type: "application/vnd.ms-excel" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Отчет.xls");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error(e);
  }
};