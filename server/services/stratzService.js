import fetch from 'node-fetch';

const STRATZ_API_URL = 'https://api.stratz.com/graphql';
const STRATZ_TOKEN = process.env.STRATZ_API_TOKEN;

export const stratzService = {
  async executeQuery(query, variables = {}) {
    try {
      console.log('🚀 Отправка запроса к STRATZ API:');
      console.log('Query:', query);
      console.log('Variables:', variables);
      console.log('Token:', STRATZ_TOKEN ? 'Установлен' : 'Отсутствует');

      const response = await fetch(STRATZ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRATZ_TOKEN}`,
          'User-Agent': 'ESAISaaS/1.0',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      console.log('📡 Статус ответа:', response.status);
      console.log('📡 Заголовки ответа:', response.headers.raw());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка API:', errorText);
        throw new Error(`STRATZ API error: ${response.status}\n${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Полученные данные:', JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error('❌ GraphQL ошибки:', data.errors);
        throw new Error(data.errors[0].message);
      }

      return data.data;
    } catch (error) {
      console.error('❌ Ошибка выполнения запроса:', error);
      throw error;
    }
  },

  // Получить текущие матчи
  async getLiveMatches(limit = 5) {
    const query = `
      query {
        live {
          matches(request: { take: ${limit} }) {
            matchId
            gameTime
            averageRank
            players {
              steamAccount {
                name
                seasonRank
              }
              hero {
                displayName
              }
            }
          }
        }
      }
    `;
    return this.executeQuery(query);
  },

  // Получить детали матча
  async getMatch(matchId) {
    const query = `
      query {
        match(id: ${matchId}) {
          id
          gameMode
          startDateTime
          durationSeconds
          players {
            steamAccount {
              name
              seasonRank
            }
            hero {
              displayName
            }
            kills
            deaths
            assists
            networth
            goldPerMinute
            experiencePerMinute
            level
            position
            isRadiant
          }
          radiantKills
          direKills
          isStats
        }
      }
    `;
    return this.executeQuery(query);
  },

  // Поиск игрока по Steam ID
  async getPlayer(steamId) {
    const query = `
      query {
        player(steamAccountId: ${steamId}) {
          steamAccount {
            name
            seasonRank
            avatar
          }
          matches(request: { take: 10 }) {
            id
            gameMode
            startDateTime
            players(steamAccountId: ${steamId}) {
              hero {
                displayName
              }
              kills
              deaths
              assists
              position
              isVictory
            }
          }
        }
      }
    `;
    return this.executeQuery(query);
  },

  // Получить статистику героя
  async getHeroStats(heroId) {
    const query = `
      query {
        constants {
          hero(id: ${heroId}) {
            displayName
            stats {
              pickCount
              winCount
              banCount
              position1Count
              position2Count
              position3Count
              position4Count
              position5Count
            }
          }
        }
      }
    `;
    return this.executeQuery(query);
  }
};

export default stratzService; 