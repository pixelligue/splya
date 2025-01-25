export const getDota2Prompt = (matchData) => {
  const formatTeamStats = (stats) => {
    const recentMatches = stats.tournaments[0]?.matches.slice(0, 5).map(m => ({
      opponent: m.opponent.name,
      score: m.score,
      result: m.result
    })) || []

    const roster = stats.roster.main.map(player => ({
      nickname: player.nickname,
      role: player.role,
      winrate: player.heroes_stats.heroes.reduce((acc, hero) => acc + hero.winrate, 0) / player.heroes_stats.heroes.length,
      topHeroes: player.heroes_stats.heroes.slice(0, 3).map(hero => ({
        name: hero.name,
        matches: hero.matches,
        winrate: hero.winrate,
        kda: hero.kda
      }))
    }))

    return {
      recentMatches,
      roster,
      totalWinrate: ((stats.stats.first_places / (stats.stats.first_places + stats.stats.losses)) * 100).toFixed(2),
      recentForm: recentMatches.filter(m => m.result === 'win').length / recentMatches.length
    }
  }

  const team1Stats = formatTeamStats(matchData.team1Stats)
  const team2Stats = formatTeamStats(matchData.team2Stats)

  return `Проанализируй матч DOTA 2 между командами ${matchData.team1} и ${matchData.team2}.

Турнир: ${matchData.tournament}
Дата: ${new Date(matchData.startTime).toLocaleString()}

Статистика ${matchData.team1}:
- Общий винрейт: ${team1Stats.totalWinrate}%
- Форма в последних матчах: ${(team1Stats.recentForm * 100).toFixed(2)}%
- Последние матчи:
${team1Stats.recentMatches.map(m => `  • vs ${m.opponent}: ${m.score} (${m.result})`).join('\n')}

Состав:
${team1Stats.roster.map(p => `
- ${p.nickname} (${p.role})
  Винрейт: ${p.winrate.toFixed(2)}%
  Топ герои: ${p.topHeroes.map(h => `${h.name} (${h.winrate}% за ${h.matches} игр)`).join(', ')}`).join('\n')}

Статистика ${matchData.team2}:
- Общий винрейт: ${team2Stats.totalWinrate}%
- Форма в последних матчах: ${(team2Stats.recentForm * 100).toFixed(2)}%
- Последние матчи:
${team2Stats.recentMatches.map(m => `  • vs ${m.opponent}: ${m.score} (${m.result})`).join('\n')}

Состав:
${team2Stats.roster.map(p => `
- ${p.nickname} (${p.role})
  Винрейт: ${p.winrate.toFixed(2)}%
  Топ герои: ${p.topHeroes.map(h => `${h.name} (${h.winrate}% за ${h.matches} игр)`).join(', ')}`).join('\n')}

Дай прогноз в следующем формате (верни только JSON, без маркеров markdown):
{
  "prediction": "название команды-победителя",
  "confidence": число от 1 до 100,
  "explanation": "подробное объяснение на 1000 символов, почему ты сделал такой прогноз"
}`
}

export default getDota2Prompt 