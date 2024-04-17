import showToast from "../../../composables/toast/index.js";

export default function validate(
  date,
  organization,
  storage,
) {

  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning")
  }
  if (!organization) {
    return showToast("Поле Организации не может быть пустым", "warning")
  }
  if (!storage || storage.id === null) {
    return showToast("Поле Склад не может быть пустым", "warning")
  }

  return true
}