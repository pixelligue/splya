import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
})

export const aiPredictionService = {
  generatePrediction: async (matchData) => {
    try {
      console.log('Получены данные для прогноза:', JSON.stringify(matchData, null, 2));
      
      const prompt = `Ты - профессиональный киберспортивный аналитик с глубоким пониманием соревновательной Dota 2. 
Проанализируй предстоящий матч и сделай прогноз, основываясь на следующих данных:

Команда 1 (${matchData.team1.name}):
- Всего матчей: ${matchData.team1.stats.total_matches}
- Побед: ${matchData.team1.stats.wins}
- Поражений: ${matchData.team1.stats.losses}
- Винрейт: ${matchData.team1.stats.winrate}%

Команда 2 (${matchData.team2.name}):
- Всего матчей: ${matchData.team2.stats.total_matches}
- Побед: ${matchData.team2.stats.wins}
- Поражений: ${matchData.team2.stats.losses}
- Винрейт: ${matchData.team2.stats.winrate}%

Турнир: ${matchData.match_info.tournament.name}
Стадия: ${matchData.match_info.tournament.stage}

При анализе учитывай следующие факторы:
1. Опыт команд (количество сыгранных матчей)
2. Стабильность выступлений (соотношение побед и поражений)
3. Текущую форму (винрейт)
4. Уровень турнира и его значимость
5. Стадию турнира и психологическое давление
6. Историю выступлений команд на подобных турнирах

Ответь строго в формате JSON без переносов строк в значениях:
{
  "team1_chance": число от 0 до 100,
  "team2_chance": число от 0 до 100,
  "predicted_winner": "${matchData.team1.name} или ${matchData.team2.name}",
  "reasoning": "Подробный анализ всех факторов, влияющих на прогноз. Обязательно укажи:
    1. Ключевые преимущества команды-фаворита
    2. Возможные риски для прогноза
    3. На что стоит обратить внимание во время матча
    4. Почему одна команда имеет преимущество над другой"
}`;

      console.log('Промпт для ИИ:', prompt);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Ты - опытный аналитик Dota 2 с глубокими знаниями о командах, турнирах и истории их выступлений. Твои прогнозы основаны на статистике, понимании меты и знании особенностей команд." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      console.log('Ответ ИИ:', response);

      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Ошибка при парсинге ответа ИИ:', error);
        throw new Error('Некорректный формат ответа от ИИ');
      }
    } catch (error) {
      console.error('Ошибка при генерации прогноза:', error);
      throw error;
    }
  }
};

export default aiPredictionService 