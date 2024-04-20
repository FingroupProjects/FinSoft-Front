import showToast from "../../../composables/toast/index.js";
export default function validate(
  sum,
  base,
  date,
  organization,
  cash,
  counterparty,
  cpAgreement
) {
  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning");
  }
  if (!organization) {
    return showToast("Поле Организация не может быть пустым", "warning");
  }
  if (!cash) {
    return showToast("Поле Касса не может быть пустым", "warning");
  }
  if (!sum) {
    return showToast("Поле Сумма не может быть пустым", "warning");
  }
  if (!counterparty) {
    return showToast("Поле Поставщик не может быть пустым", "warning");
  }
  if (!cpAgreement) {
    return showToast("Поле Договор не может быть пустым", "warning");
  }
  if (!base) {
    return showToast("Поле Основание не может быть пустым", "warning");
  }

  return true;
}


