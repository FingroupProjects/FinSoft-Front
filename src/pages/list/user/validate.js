import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  fioRef,
  organization,
  loginRef,
  passwordRef,
  phoneRef,
  emailRef,
  group
) {
  if (!fioRef.value) {
    return showToast("Поле ФИО не может быть пустым", "warning")
  }
  if (organization.value.length === 0) {
    return showToast("Поле Организации не может быть пустым", "warning")
  }
  if (!loginRef.value) {
    return showToast("Поле Логин не может быть пустым", "warning")
  }
  if (!passwordRef.value) {
    return showToast("Поле Пароль не может быть пустым", "warning")
  }
  if (!group.value || group.value.length === 0) {
    return showToast("Поле Группа не может быть пустым", "warning")
  }
  if (!phoneRef.value) {
    return showToast("Поле Номер телефона не может быть пустым", "warning")
  }
  if (phoneRef.value && !rules.phone(phoneRef.value)) {
    return showToast("Поле Номер телефона имеет ошибочный формат", "warning");
  }
  if (!emailRef.value) {
    return showToast("Поле Почта не может быть пустым", "warning")
  }
  if (emailRef.value && !rules.email(emailRef.value)) {
    return showToast("Поле Почта имеет ошибочный формат", "warning");
  }


  return true
}