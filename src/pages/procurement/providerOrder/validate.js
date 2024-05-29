import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  date,
  counterparty,
  cpAgreement,
  currency,
) {

  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning")
  }
  if (!counterparty) {
    return showToast("Поле Поставщик не может быть пустым", "warning")
  }
  if (!cpAgreement) {
    return showToast("Поле Договор не может быть пустым", "warning")
  }
  if (!currency || currency.id === null) {
    return showToast("Поле Валюта не может быть пустым", "warning")
  }

  return true
}