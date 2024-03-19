import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  bill_number,
  date,
  organizationAdd,
  currencyAdd,
) {
      if (!nameRef.value) {
       return showToast("Поле Наименование не может быть пустым", "warning")
      }

      if (!bill_number.value) {
       return showToast("Поле Номер счета не может быть пустым", "warning") 
      }
      
      if (!date.value) {
      return  showToast("Поле Дата не может быть пустым", "warning")
      }

      if (!organizationAdd.value) {
       return showToast("Поле Организация не может быть пустым", "warning")
      }

      if (!currencyAdd.value) {
        return showToast("Поле Валюта не может быть пустым", "warning")

      }
  return true
}
