import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const fineTuningService = {
  async createFineTuningJob() {
    try {
      // Загружаем файл с данными
      const file = await openai.files.create({
        file: fs.createReadStream('training_data.jsonl'),
        purpose: 'fine-tune'
      });

      // Создаем задачу файн-тюнинга
      const fineTuningJob = await openai.fineTuning.jobs.create({
        training_file: file.id,
        model: 'gpt-3.5-turbo'
      });

      return fineTuningJob;
    } catch (error) {
      console.error('Ошибка при создании задачи файн-тюнинга:', error);
      throw error;
    }
  },

  async getJobStatus(jobId) {
    try {
      const job = await openai.fineTuning.jobs.retrieve(jobId);
      return job;
    } catch (error) {
      console.error('Ошибка при получении статуса задачи:', error);
      throw error;
    }
  },

  async useFineTunedModel(modelId, matchData) {
    try {
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          {
            role: "system",
            content: "Вы - эксперт по прогнозированию киберспортивных матчей. Анализируйте статистику команд и давайте точные предсказания."
          },
          {
            role: "user",
            content: `Проанализируйте матч между ${matchData.team1_name} и ${matchData.team2_name}. Статистика команд: ${matchData.team1_stats} vs ${matchData.team2_stats}`
          }
        ]
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Ошибка при использовании файн-тюнед модели:', error);
      throw error;
    }
  }
}; 