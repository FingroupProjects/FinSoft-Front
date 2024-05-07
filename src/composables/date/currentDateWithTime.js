export default function currentDateWithTime() {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
    const day = ('0' + currentDate.getDate()).slice(-2)
    const hour = ('0' + currentDate.getHours()).slice(-2)
    const minute = ('0' + currentDate.getMinutes()).slice(-2)
    return `${year}-${month}-${day}T${hour}:${minute}:00`
}