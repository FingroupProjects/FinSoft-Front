export default function showDate(date) {
    const parts = date.split("-")
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]

    return `${day}.${month}.${year}`
}