// Форматирование даты для отображения
export const formatMatchDate = (dateString) => {
  if (!dateString) return 'Дата не определена'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Дата не определена'

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Moscow'
    }).format(date)
  } catch (e) {
    console.error('Ошибка при форматировании даты:', e)
    return 'Дата не определена'
  }
}

// Проверка валидности даты
export const isValidDate = (dateString) => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch (e) {
    return false
  }
} 