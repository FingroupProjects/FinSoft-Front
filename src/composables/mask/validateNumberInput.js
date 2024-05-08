export default function validateNumberInput(event, item) {
  let inputValue = event.target.value;
  inputValue = inputValue.replace(/[^0-9.]/g, "");
  item = inputValue;
}