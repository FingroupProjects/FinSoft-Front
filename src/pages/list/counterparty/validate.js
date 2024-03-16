import showToast from "../../../composables/toast/index.js";

export default function validate(
  name,
  phone,
  address,
  email,
  roles
) {
  if (!name.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }
  if (!phone.value) {
    return showToast("Поле тел номер не может быть пустым", "warning")
  }
  if (!address.value) {
    return showToast("Поле адрес не может быть пустым", "warning")
  }
  if (!email.value) {
    return showToast("Поле почта не может быть пустым", "warning")
  }
  if (!roles.value) {
    return showToast("Выберите хотя бы одну роль!", "warning")
  }
  return true
}