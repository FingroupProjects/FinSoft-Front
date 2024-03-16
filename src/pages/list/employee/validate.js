import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  phoneRef,
  emailRef,
  addressRef,
) {
  if (!nameRef.value) {
    return showToast("Поле Фио не может быть пустым", "warning")
  }
  if (!phoneRef.value) {
    return showToast("Поле номер телефона не может быть пустым", "warning")
  }
  if (!emailRef.value) {
    return showToast("Поле Электронная почта не может быть пустым", "warning")
  }
  if (!addressRef.value) {
    return showToast("Поле Адрес не может быть пустым", "warning")
  }
  return true
}