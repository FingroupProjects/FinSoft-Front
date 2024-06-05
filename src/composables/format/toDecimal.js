export default function toDecimal(number) {
  let numStr = number.toString();
  if (!numStr.includes('.')) {
    return numStr + ".00";
  } else {
    let [integerPart, decimalPart] = numStr.split('.');
    if (decimalPart.length === 1) {
      return integerPart + '.' + decimalPart + '0';
    } else if (decimalPart.length === 2) {
      return numStr;
    } else {
      return numStr;
    }
  }
}