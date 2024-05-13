export default function parseFloatNumber(data) {
  return parseFloat(data.replace(/\s/g, '').replace(',', '.'))
}