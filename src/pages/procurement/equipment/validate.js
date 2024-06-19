import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  date,
  organization,
  storage,
  good,
  totalPrice,
  goods,
) {
  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning")
  }
  if (!organization) {
    return showToast("Поле Организации не может быть пустым", "warning")
  }
  if (!storage) {
    return showToast("Поле Склад не может быть пустым", "warning")
  }
  if (!good) {
    return showToast("Поле Товар не может быть пустым", "warning")
  }
  if (totalPrice.length === 0) {
    return showToast("Поле Цена не может быть пустым", "warning")
  }
  if (goods.length === 1 && goods[0][0]?.good_id === null || goods[0]?.good_id === null) {
    return showToast("Нельзя сохранить без товара", "warning")
  }

  return true
}