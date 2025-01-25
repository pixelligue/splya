import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { pushrApiService } from './pushrApiService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Форматирование данных команд для AI
const formatTeamDataForAI = (teamData) => {
  if (!teamData || !teamData.stats) {
    console.warn('Отсутствуют данные команды или статистика:', teamData);
    return null;
  }

  // Форматируем основную статистику
  const stats = {
    total_matches: parseInt(teamData.stats.total_matches) || 0,
    wins: parseInt(teamData.stats.wins) || 0,
    losses: parseInt(teamData.stats.losses) || 0,
    winrate: parseFloat(teamData.stats.winrate) || 0
  };

  // Форматируем состав команды
  const roster = {
    main: teamData.stats.roster?.main?.map(player => ({
      nickname: player.nickname,
      role: player.role,
      heroes: player.heroes?.slice(0, 10)?.map(hero => ({
        name: hero.name,
        matches: parseInt(hero.matches),
        wins: parseInt(hero.wins),
        winrate: parseFloat(hero.winrate),
        kda: parseFloat(hero.kda)
      })) || []
    })) || []
  };

  // Форматируем недавние турниры
  const recentTournaments = teamData.stats.tournaments?.slice(0, 5)?.map(tournament => ({
    name: tournament.name,
    date: tournament.date,
    matches: tournament.matches?.map(match => ({
      opponent: match.opponent.name,
      result: match.result,
      score: match.score,
      date: match.date
    })) || []
  })) || [];

  return {
    name: teamData.name,
    stats,
    roster,
    recent_tournaments: recentTournaments
  };
};

// Получение прогноза от AI
const getAIPrediction = async (matchData) => {
  try {
    const response = await fetch(`${API_URL}/api/ai/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(matchData)
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении прогноза от AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении прогноза:', error);
    throw error;
  }
};

// Создание прогноза с использованием AI
export const createAIPrediction = async (team1Data, team2Data, matchInfo) => {
  try {
    console.log('Данные команд для AI:', { team1Data, team2Data });

    // Проверяем наличие данных
    if (!team1Data?.stats || !team2Data?.stats) {
      console.error('Отсутствует статистика команд:', {
        team1Stats: !!team1Data?.stats,
        team2Stats: !!team2Data?.stats
      });
      throw new Error('Отсутствует статистика команд');
    }

    // Собираем все данные для AI
    const aiMatchData = {
      match_info: {
        ...matchInfo,
        tournament: {
          name: matchInfo.tournament?.name || 'Unknown Tournament',
          tier: matchInfo.tournament?.tier,
          serie: matchInfo.tournament?.serie,
          stage: matchInfo.tournament?.stage
        },
        format: matchInfo.format,
        begin_at: matchInfo.begin_at
      },
      team1: {
        name: team1Data.name,
        stats: team1Data.stats
      },
      team2: {
        name: team2Data.name,
        stats: team2Data.stats
      },
      meta: {
        generated_at: new Date().toISOString(),
        data_version: '2.0'
      }
    };

    console.log('Отправляем данные для AI:', aiMatchData);

    // Получаем прогноз от AI
    const prediction = await getAIPrediction(aiMatchData);
    return prediction;
  } catch (error) {
    console.error('Ошибка при создании AI прогноза:', error);
    throw error;
  }
};

export const predictionService = {
  // Получение данных для матча Dota 2
  getDota2MatchData: async (match) => {
    try {
      console.log('Получение данных для прогноза:', match);
      
      // Получаем данные команд через API
      const [team1Response, team2Response] = await Promise.all([
        fetch(`${API_URL}/api/teams/${match.teams[0].id}/stats`),
        fetch(`${API_URL}/api/teams/${match.teams[1].id}/stats`)
      ]);

      if (!team1Response.ok || !team2Response.ok) {
        throw new Error('Ошибка при получении данных команд');
      }

      const [team1Data, team2Data] = await Promise.all([
        team1Response.json(),
        team2Response.json()
      ]);

      if (!team1Data || !team2Data) {
        throw new Error('Не удалось найти данные одной или обеих команд');
      }

      console.log('Получены данные команд:', { team1Data, team2Data });

      // Форматируем данные для прогноза
      const matchData = {
        match_id: match.id,
        tournament: {
          name: match.tournament.name,
          tier: match.tournament.tier,
          serie: match.tournament.serie?.name,
          stage: match.tournament.stage?.name
        },
        format: match.format,
        begin_at: match.begin_at,
        team1: {
          id: match.teams[0].id,
          name: team1Data.name,
          stats: team1Data.stats
        },
        team2: {
          id: match.teams[1].id,
          name: team2Data.name,
          stats: team2Data.stats
        }
      };

      // Находим очные встречи в турнирах обеих команд
      const h2hMatches = [];
      
      // Проверяем турниры первой команды
      team1Data.stats.tournaments?.forEach(tournament => {
        tournament.matches?.forEach(match => {
          if (match.opponent.name === team2Data.name) {
            h2hMatches.push({
              date: match.date,
              tournament: tournament.name,
              format: match.format,
              score: match.score,
              result: match.result
            });
          }
        });
      });

      // Проверяем турниры второй команды для полноты данных
      team2Data.stats.tournaments?.forEach(tournament => {
        tournament.matches?.forEach(match => {
          if (match.opponent.name === team1Data.name && 
              !h2hMatches.some(h2h => h2h.date === match.date)) {
            h2hMatches.push({
              date: match.date,
              tournament: tournament.name,
              format: match.format,
              score: match.score,
              result: match.result
            });
          }
        });
      });

      // Сортируем матчи по дате и берем последние 5
      matchData.head_to_head = {
        total_matches: h2hMatches.length,
        matches: h2hMatches
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      };

      return matchData;
    } catch (error) {
      console.error('Ошибка при получении данных для прогноза:', error);
      throw error;
    }
  },

  // Создание прогноза
  createPrediction: async (matchData) => {
    try {
      const response = await fetch(`${API_URL}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchData)
      });

      const prediction = await response.json();
      return prediction;
    } catch (error) {
      console.error('Ошибка при создании прогноза:', error);
      throw error;
    }
  },

  // Обновление результатов матчей
  updateMatchResults: async () => {
    try {
      const predictionsRef = collection(db, 'predictions')
      const now = new Date()
      
      // Получаем все завершенные матчи без результата
      const q = query(
        predictionsRef,
        where('status', '==', 'pending'),
        where('startTime', '<=', now)
      )
      
      const querySnapshot = await getDocs(q)
      let updatedCount = 0

      for (const doc of querySnapshot.docs) {
        const prediction = doc.data()
        
        try {
          // Получаем результат матча из Pandascore
          const matchResult = await pushrApiService.matches.getById(prediction.matchId)
          
          if (matchResult && matchResult.status === 'completed') {
            // Обновляем прогноз с результатом
            await updateDoc(doc.ref, {
              status: 'completed',
              result: matchResult.winner,
              score: matchResult.score,
              updated_at: now
            })
            updatedCount++
          }
        } catch (error) {
          console.error(`Ошибка при обновлении матча ${prediction.matchId}:`, error)
        }
      }

      return updatedCount
    } catch (error) {
      console.error('Ошибка при обновлении результатов:', error)
      throw error
    }
  }
};

export default predictionService; 