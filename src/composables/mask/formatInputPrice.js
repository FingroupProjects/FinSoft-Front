export default function formatInputPrice(price, event) {
 let value = event.target.value;

 if (value.length === 2 && value.startsWith("0") && !value.includes(".")) {
  event.target.value = `0.${value[1]}`;
 }
}