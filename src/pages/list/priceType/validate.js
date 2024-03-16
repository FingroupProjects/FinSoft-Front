import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  currency_id,
  descriptionRef,
) {
  if (!nameRef.value) {
    return showToast("Поле Название не может быть пустым", "warning")
  }
  if (!currency_id.value) {
    return showToast("Поле валюты не может быть пустым", "warning")
  }
  if (!descriptionRef.value) {
    return showToast("Поле описания не может быть пустым", "warning")
  }
  return true
}