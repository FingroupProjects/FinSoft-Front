import showToast from "../../../composables/toast/index.js";

export default function validate(
  nameRef,
  vendor_codeRef,
  storageRef,
  unitRef,
  groupRef
) {
  if (!nameRef.value) {
    return showToast("Поле Наименование не может быть пустым", "warning");
  }
  if (vendor_codeRef.value.length != 8) {
    return showToast("Поле Артикуль должно состоять из 8 символов", "warning");
  }
  if (!storageRef.value) {
    return showToast("Поле Место расположения не может быть пустым", "warning");
  }
  if (!unitRef.value) {
    return showToast("Поле Ед измерения не может быть пустым", "warning");
  }
  if (!groupRef.value) {
    return showToast(
      "Поле Группа номенклатуры не может быть пустым",
      "warning"
    );
  }

  return true;
}
