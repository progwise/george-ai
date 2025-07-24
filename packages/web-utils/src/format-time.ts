export const formatTime = (hour: number = 0, minute: number = 0) => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}
