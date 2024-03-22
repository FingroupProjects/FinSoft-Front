import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  organizationAdd,
  group
) {
  if (!nameRef.value) {
    return showToast("Поле Название не может быть пустым", "warning")
  }
  if (organizationAdd.value.length === 0) {
    return showToast("Поле Организация не может быть пустым", "warning")
  }
  if (!group.value || group.value.length === 0) {
    return showToast("Поле Группа не может быть пустым", "warning")
  }

  return true
}