import showToast from "../../../composables/toast/index.js";
export default function validate(
  nameRef,
  digitalRef,
  symbolRef,
) {
  if (!nameRef.value || nameRef.value.length < 3) {
    return showToast("Поле Название не должно быть менее 3 символов", "warning")
  }
  if (!symbolRef.value || symbolRef.value.length < 3) {
    return showToast("Поле Символный код не должен быть менее 3 символов", "warning")
  }
  if (!digitalRef.value || digitalRef.value.length < 3) {
    return showToast("Поле Цифровой код не должен быть менее 3 символов", "warning")
  }
  return true
}