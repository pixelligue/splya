export const getDota2Prompt = (matchData) => {
  const { team1, team2, tournament, startTime, team1Stats, team2Stats, h2h } = matchData

  // Форматируем статистику команды
  const formatTeamStats = (stats) => {
    if (!stats || Object.keys(stats).length === 0) {
      return 'Нет данных'
    }
    
    // Форматируем последние матчи
    const recentResults = stats.recentMatches
      .map(m => `${m.opponent} (${m.score}) - ${m.result.toUpperCase()}`)
      .join('\n')

    // Форматируем популярных героев
    const popularHeroes = stats.heroes
      .map(h => `${h.name} (${h.matches} игр, ${h.winrate}% побед)`)
      .join('\n')

    // Форматируем состав команды
    const roster = stats.roster
      .map(p => {
        const heroes = p.signature_heroes
          .map(h => `${h.name} (${h.winrate}% за ${h.matches} игр)`)
          .join(', ')
        return `${p.nickname} (${p.role})\nСигнатурные герои: ${heroes}`
      })
      .join('\n')

    return `
- Общая статистика:
  • Рейтинг: ${stats.rating}
  • Общий винрейт: ${stats.winRate}%
  • Всего матчей: ${stats.totalMatches}
  • Винрейт последних матчей: ${stats.recentWinrate}%

- Последние матчи:
${recentResults}

- Популярные герои:
${popularHeroes}

- Текущий состав:
${roster}`
  }

  // Форматируем историю встреч
  const formatH2H = (h2h) => {
    if (!h2h || !h2h.matches || h2h.matches.length === 0) {
      return 'Нет данных о личных встречах'
    }
    
    const matchesHistory = h2h.matches
      .map(m => `${m.tournament} - ${m.score} (${m.format}) - ${new Date(m.date).toLocaleDateString()}`)
      .join('\n')

    return `
История встреч:
- Всего матчей: ${h2h.totalMatches}
- Победы ${team1}: ${h2h.team1Wins}
- Победы ${team2}: ${h2h.team2Wins}

Последние встречи:
${matchesHistory}`
  }

  const prompt = `Проанализируй матч DOTA 2 между командами ${team1} и ${team2}.

Детальная информация:
1. Турнир: ${tournament}
2. Дата: ${new Date(startTime).toLocaleString()}

Статистика ${team1}:
${formatTeamStats(team1Stats)}

Статистика ${team2}:
${formatTeamStats(team2Stats)}

${formatH2H(h2h)}

Дай прогноз в следующем формате (верни только JSON, без маркеров markdown):
{
  "prediction": "команда или исход",
  "confidence": число от 1 до 100,
  "explanation": "подробное объяснение на 1000 символов, почему ты сделал такой прогноз, включая анализ всех важных факторов",
  "odds": {
    "team1": число от 1 до 5,
    "team2": число от 1 до 5
  }
}

При анализе учитывай:
1. Текущую форму команд (особенно результаты последних матчей)
2. Историю личных встреч и их результаты
3. Важность турнира и стадию турнира
4. Статистику побед и поражений
5. Текущие тренды команд
6. Общий рейтинг команд
7. Популярных героев команд и их винрейт
8. Стабильность выступлений
9. Опыт выступлений на турнирах
10. Сильные стороны текущих составов
11. Сигнатурных героев игроков

В объяснении обязательно укажи:
1. Почему ты выбрал именно эту команду
2. Какие ключевые факторы повлияли на решение
3. Какие риски есть в прогнозе
4. На что стоит обратить особое внимание во время матча
5. Какие сильные и слабые стороны у каждой команды
6. Как текущие составы и их герои могут повлиять на исход`

  return prompt
} 