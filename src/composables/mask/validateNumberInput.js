export default function validateNumberInput(data) {
 if (!data) return data || ""
 return data.toString().replace(/[^0-9.]/g, "");
}

