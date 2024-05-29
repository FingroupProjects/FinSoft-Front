export default function getColor(deleted_at) {
  if (deleted_at !== null) {
    return "red";
  } else {
    return "green";
  }
}