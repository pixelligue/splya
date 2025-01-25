import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { connectDB } from '../config/mongodb.js';
import { TeamStats } from '../../server/models/TeamStats.js';
import { parseOneTeam, parseTeamsList } from './parseTeamsData.js';
import { parseTeamInfo, parseTeamMatches } from './parseTeamTournaments.js';

// Загружаем конфигурацию
console.log('Загрузка конфигурации...');
dotenv.config();

const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 час в миллисекундах

// Основная функция парсинга
async function parseAllData() {
  let browser;
  try {
    console.log('Подключаемся к MongoDB...');
    await connectDB();
    
    console.log('Запускаем браузер...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Получаем список всех команд с сайта
    console.log('\nПолучаем список команд с сайта...');
    const page = await browser.newPage();
    const teamsList = await parseTeamsList(page);
    console.log(`Найдено ${teamsList.length} команд на сайте`);

    // Сохраняем новые команды в базу
    for (const teamData of teamsList) {
      const exists = await TeamStats.findOne({ team_id: teamData.team_id });
      if (!exists) {
        await TeamStats.create({
          ...teamData,
          pandascore_id: null,
          parsed_at: new Date(),
          updated_at: new Date()
        });
        console.log(`Добавлена новая команда: ${teamData.name}`);
      }
    }

    // Получаем все команды из базы для обновления
    const teams = await TeamStats.find({}, { team_id: 1, name: 1 }).sort({ updated_at: 1 });
    console.log(`\nВсего команд в базе: ${teams.length}`);

    // Обновляем информацию по каждой команде
    for (const [index, team] of teams.entries()) {
      try {
        console.log(`\nОбработка команды ${index + 1}/${teams.length}: ${team.name}`);

        // Парсим основную информацию
        const teamData = await parseOneTeam(team.team_id);
        if (!teamData) {
          console.log(`Пропускаем команду ${team.name} - не удалось получить основные данные`);
          continue;
        }

        // Парсим турниры и матчи
        const page = await browser.newPage();
        const { teamInfo, matches } = await parseTeamInfo(page, team.team_id);
        await page.close();

        if (!teamInfo || !matches) {
          console.log(`Пропускаем команду ${team.name} - не удалось получить информацию о турнирах`);
          continue;
        }

        // Обновляем данные в БД
        await TeamStats.updateOne(
          { team_id: team.team_id },
          { 
            $set: {
              ...teamData,
              ...teamInfo,
              tournaments: matches,
              updated_at: new Date()
            }
          }
        );

        console.log(`Обновлена информация для команды ${team.name}`);
      } catch (error) {
        console.error(`Ошибка при обработке команды ${team.name}:`, error);
        continue;
      }
    }

    console.log('\nПарсинг всех данных завершен');
  } catch (error) {
    console.error('Критическая ошибка:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Функция для автоматического запуска парсинга
async function startAutoUpdate() {
  console.log('Запуск автоматического обновления данных...');
  
  // Первый запуск сразу при старте
  await parseAllData().catch(error => {
    console.error('Ошибка при парсинге:', error);
  });

  // Устанавливаем интервал
  setInterval(async () => {
    console.log('\n=== Запуск планового обновления данных ===');
    console.log('Время:', new Date().toLocaleString());
    
    try {
      await parseAllData();
    } catch (error) {
      console.error('Ошибка при плановом обновлении:', error);
    }
  }, UPDATE_INTERVAL);
}

// Запускаем автоматическое обновление
console.log('Запуск скрипта автоматического обновления данных...');
startAutoUpdate().catch(console.error); 