import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  organizationAdd,
  currencyAdd,
  employeeAdd
) {
      if (!nameRef.value) {
       return showToast("Поле Наименование не может быть пустым", "warning")
      }
      
      if (!currencyAdd.value) {
        return showToast("Поле Валюта не может быть пустым", "warning")
      }
      if (!organizationAdd.value) {
        return showToast("Поле Организация не может быть пустым", "warning")
      }
      if (!employeeAdd.value) {
        return showToast("Поле Ответственное лицо не может быть пустым", "warning")
      }
  return true
}
