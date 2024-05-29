import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
) {
  if (!nameRef.value) {
    return showToast("Поле Наименования не может быть пустым", "warning")
  }
  return true
}