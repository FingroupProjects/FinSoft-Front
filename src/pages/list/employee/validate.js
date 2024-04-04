import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  nameRef,
  phoneRef,
  emailRef,
  addressRef,
  group,
) {
  if (!nameRef.value) {
    return showToast("Поле ФИО не может быть пустым", "warning")
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
  if (!addressRef.value) {
    return showToast("Поле Адрес не может быть пустым", "warning")
  }
  if (!group.value || group.value.length === 0) {
    return showToast("Поле Группа не может быть пустым", "warning")
  }
  return true
}