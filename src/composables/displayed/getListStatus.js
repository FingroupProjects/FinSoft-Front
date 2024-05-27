export default function getListStatus(deleted_at) {
  if (deleted_at === null) {
    return "Активный";
  } else {
    return "Удален";
  }
}