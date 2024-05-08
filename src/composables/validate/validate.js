import showToast from "./../../composables/toast/index.js";

export default function validate(fieldsToCheck) {
  for (const item of fieldsToCheck) {
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const value = item[key];
        if (!value || value === '' || value === null) {
          showToast(`Поле ${key} не может быть пустым`, 'warning');
          return false;
        }
      }
    }
  }
  return true;
}
