import { pool } from '../server/db/db.js';
import fs from 'fs';

async function prepareTrainingData() {
  try {
    // Получаем исторические данные матчей и предсказаний
    const [matches] = await pool.query(`
      SELECT m.*, p.prediction, p.actual_result 
      FROM matches m 
      JOIN predictions p ON m.match_id = p.match_id 
      WHERE p.actual_result IS NOT NULL
    `);

    // Форматируем данные для файн-тюнинга
    const trainingData = matches.map(match => ({
      messages: [
        {
          role: "system",
          content: "Вы - эксперт по прогнозированию киберспортивных матчей. Анализируйте статистику команд и давайте точные предсказания."
        },
        {
          role: "user",
          content: `Проанализируйте матч между ${match.team1_name} и ${match.team2_name}. Статистика команд: ${match.team1_stats} vs ${match.team2_stats}`
        },
        {
          role: "assistant",
          content: `На основе анализа статистики, вероятность победы ${match.winner_team} составляет ${match.prediction}%`
        }
      ]
    }));

    // Сохраняем в JSONL формате
    const jsonlData = trainingData.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync('training_data.jsonl', jsonlData);

    console.log(`Подготовлено ${trainingData.length} примеров для обучения`);
  } catch (error) {
    console.error('Ошибка при подготовке данных:', error);
  }
}

prepareTrainingData(); 