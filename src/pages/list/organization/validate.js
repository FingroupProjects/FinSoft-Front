import showToast from "../../../composables/toast/index.js";
const rules = {
  required: (value) => !!value,
  inn: (value) => value.length === 9
};
export default function validate(
  nameRef,
  innRef,
  directorRef,
  accountantRef,
  addressRef,
  descriptionRef
) {
  if (!nameRef.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }
  if (!innRef.value) {
    return showToast("Поле инн не может быть пустым", "warning")
  }
  if (innRef.value && !rules.inn(innRef.value)) {
    return showToast("Поле инн должен состоят из 9 цифр", "warning")
  }
  if (!directorRef.value) {
    return showToast("Поле директор не может быть пустым", "warning")
  }
  if (!accountantRef.value) {
    return showToast("Поле гл.бухгалтер не может быть пустым", "warning")
  }
  if (!addressRef.value) {
    return showToast("Поле адрес не может быть пустым", "warning")
  }
  if (!descriptionRef.value) {
    return showToast("Поле описания не может быть пустым", "warning")
  }

  return true
}