import showToast from "../../../composables/toast/index.js";

export default function validate(name, phone, address, email, roles) {
  if (!name.value) {
    return showToast("Поле наименования не может быть пустым", "warning");
  }
  if (phone.value.length !== 13) {
    return showToast(
      "Поле тел номер должен состоять из 11 символов",
      "warning"
    );
  }
  if (!address.value) {
    return showToast("Поле адрес не может быть пустым", "warning");
  }
  if (!email.value) {
    return showToast("Поле почта не может быть пустым", "warning");
  }
  if (roles.value.length === 0) {
    return showToast("Выберите хотя бы одну роль!", "warning");
  }
  return true;
}
