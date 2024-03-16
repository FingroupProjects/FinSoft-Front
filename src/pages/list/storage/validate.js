import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  organizationAdd,
  groupName
) {
  if (!nameRef.value) {
    return showToast("Поле Название не может быть пустым", "warning")
  }
  if (!organizationAdd.value) {
    return showToast("Поле организации не может быть пустым", "warning")
  }
  if (!groupName.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }
  return true
}