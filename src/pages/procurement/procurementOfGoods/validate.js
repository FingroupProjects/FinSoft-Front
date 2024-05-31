import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  date,
  organization,
  counterparty,
  cpAgreement,
  storage,
  currency,
  goods,
) {
  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning")
  }
  if (!organization) {
    return showToast("Поле Организации не может быть пустым", "warning")
  }
  if (!counterparty) {
    return showToast("Поле Поставщик не может быть пустым", "warning")
  }
  if (!cpAgreement) {
    return showToast("Поле Договор не может быть пустым", "warning")
  }
  if (!storage) {
    return showToast("Поле Склад не может быть пустым", "warning")
  }
  if (!currency || currency.id === null) {
    return showToast("Поле Валюта не может быть пустым", "warning")
  }
  if (goods.length === 1 && goods[0][0]?.good_id === null || goods[0]?.good_id === null) {
    return showToast("Нельзя сохранить без товара", "warning")
  }

  return true
}