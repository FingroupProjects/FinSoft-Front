export default function parseFloatNumber(data) {
  if (data === null) return data
  return parseFloat(data.toString().replace(/[^\d.]/g, ''))
}