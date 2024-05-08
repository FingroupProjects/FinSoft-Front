import showToast from "../../../composables/toast/index.js";

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}
export default function validate(
  date,
  organization,
  sender_storage,
  recipient_storage,
) {

  if (!date) {
    return showToast("Поле Дата не может быть пустым", "warning")
  }
  if (!organization) {
    return showToast("Поле Организации не может быть пустым", "warning")
  }
  if (!sender_storage || sender_storage.id === null) {
    return showToast("Поле Склад не может быть пустым", "warning")
  }
  if (!recipient_storage || recipient_storage.id === null) {
    return showToast("Поле Склад не может быть пустым", "warning")
  }
  
  return true
}