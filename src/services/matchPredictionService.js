import { aiPredictionService } from './aiPredictionService.js';

// Форматирование данных команды для AI
const formatTeamStatsForAI = (teamData) => {
  // Рассчитываем винрейт последних матчей
  const recentMatches = teamData.tournaments.slice(0, 3).flatMap(t => t.matches);
  const recentWins = recentMatches.filter(m => m.result === 'win').length;
  const recentWinrate = ((recentWins / recentMatches.length) * 100).toFixed(2);

  // Форматируем последние матчи
  const formattedMatches = recentMatches.map(match => ({
    opponent: match.opponent.name,
    score: match.score,
    result: match.result
  }));

  // Форматируем героев
  const heroes = teamData.heroes_stats.main_roster.map(hero => ({
    name: hero.name,
    matches: hero.matches,
    winrate: hero.winrate
  }));

  // Форматируем состав
  const roster = teamData.roster.main.map(player => {
    // Находим сигнатурных героев игрока из общей статистики героев
    const signatureHeroes = teamData.heroes_stats.main_roster
      .filter(hero => hero.player === player.nickname)
      .slice(0, 3)
      .map(hero => ({
        name: hero.name,
        winrate: hero.winrate,
        matches: hero.matches
      }));

    return {
      nickname: player.nickname,
      role: player.role,
      signature_heroes: signatureHeroes
    };
  });

  return {
    rating: 'TBD', // TODO: Добавить расчет рейтинга
    winRate: ((teamData.stats.first_places / (teamData.stats.first_places + teamData.stats.losses)) * 100).toFixed(2),
    totalMatches: teamData.stats.first_places + teamData.stats.losses,
    recentWinrate: recentWinrate,
    recentMatches: formattedMatches,
    heroes: heroes,
    roster: roster
  };
};

// Форматирование истории встреч
const formatHeadToHead = (team1Data, team2Data) => {
  const h2hMatches = [];
  let team1Wins = 0;
  let team2Wins = 0;

  // Собираем все матчи между командами
  team1Data.tournaments.forEach(tournament => {
    tournament.matches.forEach(match => {
      if (match.opponent.name === team2Data.name) {
        h2hMatches.push({
          tournament: tournament.name,
          date: tournament.date,
          format: match.format || 'BO3',
          score: match.score,
        });
        
        if (match.result === 'win') team1Wins++;
        else team2Wins++;
      }
    });
  });

  return {
    totalMatches: h2hMatches.length,
    team1Wins,
    team2Wins,
    matches: h2hMatches.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  };
};

export const matchPredictionService = {
  // Генерация прогноза на основе данных из MongoDB
  generatePrediction: async (team1Data, team2Data, matchInfo) => {
    try {
      // Форматируем данные команд
      const team1Stats = formatTeamStatsForAI(team1Data);
      const team2Stats = formatTeamStatsForAI(team2Data);

      // Получаем историю встреч
      const h2h = formatHeadToHead(team1Data, team2Data);

      // Подготавливаем данные для AI
      const aiMatchData = {
        game: 'dota2',
        team1: team1Data.name,
        team2: team2Data.name,
        tournament: matchInfo.tournament.name,
        startTime: new Date().toISOString(), // или matchInfo.startTime
        team1Stats,
        team2Stats,
        h2h
      };

      // Получаем прогноз от AI
      const prediction = await aiPredictionService.generatePrediction(aiMatchData);

      // Добавляем дополнительные метаданные
      return {
        ...prediction,
        metadata: {
          generated_at: new Date().toISOString(),
          match_id: matchInfo.id,
          tournament: matchInfo.tournament,
          format: matchInfo.format
        }
      };
    } catch (error) {
      console.error('Ошибка при генерации прогноза:', error);
      throw error;
    }
  }
};

export default matchPredictionService; 