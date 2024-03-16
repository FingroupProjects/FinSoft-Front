import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  digitalRef,
  symbolRef,
) {
  if (!nameRef.value) {
    return showToast("Поле название не может быть пустым", "warning")
  }
  if (!digitalRef.value) {
    return showToast("Поле Символный код не может быть пустым", "warning")
  }
  if (!symbolRef.value) {
    return showToast("Поле Цифровой код не может быть пустым", "warning")
  }
  return true
}