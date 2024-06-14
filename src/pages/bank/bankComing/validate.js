import showToast from "../../../composables/toast/index.js";
export default function validate(
  sum,
  base,
  date,
  organization,
  organization_bill,
) {
  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning");
  }
  if (!organization) {
    return showToast("Поле Организация не может быть пустым", "warning");
  }
  if (!organization_bill) {
    return showToast("Поле Рассчётный Счёт не может быть пустым", "warning");
  }
  if (!sum) {
    return showToast("Поле Сумма не может быть пустым", "warning");
  }
  if (!base) {
    return showToast("Поле Основание не может быть пустым", "warning");
  }
  return true;
}


