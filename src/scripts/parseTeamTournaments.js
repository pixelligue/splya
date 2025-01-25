import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { connectDB, Team } from '../config/mongodb.js';
import { fileURLToPath } from 'url';

// Загружаем конфигурацию
dotenv.config();

const CYBERSCORE_URL = 'https://cyberscore.live/en';
const TEST_TEAM_ID = '46254';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const TIMEOUT = 30000;
const DELAY_MIN = 2000;
const DELAY_MAX = 5000;

// Вспомогательные функции
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN) + DELAY_MIN));
const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Функция для повторных попыток загрузки страницы
const retryLoad = async (page, url, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: TIMEOUT });
      return;
    } catch (error) {
      console.error(`Попытка ${i + 1}/${maxRetries} загрузки страницы не удалась:`, error.message);
      if (i === maxRetries - 1) throw error;
      await randomDelay();
    }
  }
};

// Парсинг общей информации о команде
const parseTeamInfo = async (page, teamId) => {
  try {
    const teamUrl = `${CYBERSCORE_URL}/teams/${teamId}`;
    console.log(`\nЗагрузка информации о команде: ${teamUrl}`);
    await retryLoad(page, teamUrl);
    
    const teamInfo = await page.evaluate(() => {
      const getItemValue = (label) => {
        const item = Array.from(document.querySelectorAll('.teams-single-about .item')).find(el => 
          el.querySelector('.color26')?.textContent?.trim() === label
        );
        return item?.querySelector('.bold')?.textContent?.trim() || null;
      };

      const teamName = document.querySelector('.teams-single-about .color1.ttu')?.textContent?.trim();
      const teamLogo = document.querySelector('.teams-single-about .image img')?.src;
      
      // Извлекаем числовые значения из строк с дополнительным текстом
      const mapsPlayed = getItemValue('Maps played:')?.split(' ')[0];
      const mapsWon = getItemValue('Maps won:')?.split(' ')[0];
      const mapsLost = getItemValue('Maps lost:')?.split(' ')[0];
      
      return {
        team_id: teamName?.split('|')[1]?.trim()?.replace('ID: ', '') || null,
        name: teamName?.split('|')[0]?.trim() || null,
        logo: teamLogo,
        region: getItemValue('Country/region:'),
        maps_played: parseInt(mapsPlayed) || 0,
        maps_won: parseInt(mapsWon) || 0,
        maps_lost: parseInt(mapsLost) || 0,
        events_count: parseInt(getItemValue('Events:')) || 0,
        first_places: parseInt(getItemValue('First places:')) || 0,
        creation_date: getItemValue('Creation date:'),
        prize_money: getItemValue('Prize money:')
      };
    });

    console.log('Информация о команде:', teamInfo);
    return teamInfo;
  } catch (error) {
    console.error('Ошибка при парсинге информации о команде:', error);
    return null;
  }
};

// Парсинг матчей команды
const parseTeamMatches = async (page, teamId) => {
  try {
    const teamUrl = `${CYBERSCORE_URL}/teams/${teamId}/matches`;
    console.log(`\nЗагрузка матчей команды: ${teamUrl}`);
    await retryLoad(page, teamUrl);
    
    // Делаем скриншот для отладки
    await page.screenshot({ path: `debug_team_matches_${teamId}.png` });
    
    // Получаем HTML страницы для проверки
    const pageContent = await page.content();
    console.log('Длина HTML матчей:', pageContent.length);
    
    const matches = await page.evaluate(() => {
      const items = document.querySelectorAll('.match-past-item');
      console.log('Найдено матчей:', items.length);
      
      return Array.from(items).map(item => {
        // Получаем информацию о матче
        const matchLink = item.getAttribute('href');
        const matchId = matchLink?.split('/').filter(Boolean).pop();
        
        // Информация о команде
        const teamName = item.querySelector('.team-item-col--radiant .team-item-col__name span:first-child')?.textContent?.trim();
        const teamLogo = item.querySelector('.team-item-col--radiant .team-item-col__image img')?.src;
        
        // Информация об оппоненте
        const opponentName = item.querySelector('.team-item-col--dire .team-item-col__name span:first-child')?.textContent?.trim();
        const opponentLogo = item.querySelector('.team-item-col--dire .team-item-col__image img')?.src;
        
        // Информация о формате и результате
        const format = item.querySelector('.sub-item-bo .b-title')?.textContent?.trim();
        const score = item.querySelector('.sub-item-bo-total .b-title')?.textContent?.trim();
        const isWinner = item.querySelector('.sub-item-bo-total.winner') !== null;
        const isDraw = item.querySelector('.sub-item-bo-total.draw') !== null;
        
        // Информация о турнире
        const tournamentName = item.querySelector('.tournament-item-col__name-val')?.textContent?.trim();
        const tournamentStage = item.querySelector('.tournament-item-col__stage i')?.textContent?.trim();
        const tournamentLogo = item.querySelector('.tournament-item-col__image img')?.src;
        const tournamentTier = item.querySelector('.tournament-item-col__tier span')?.textContent?.trim();
        const matchDate = item.querySelector('.tournament-item-col--with-date .color8.ttu.font-semibold')?.textContent?.trim();

        // Парсинг информации о картах
        const matchStatBlock = Array.from(document.querySelectorAll('.match-past-statistic-item'))
          .find(stat => stat.querySelector(`a[href="${matchLink}"]`))?.closest('.match-past-statistic-item');
        
        const maps = matchStatBlock ? Array.from(matchStatBlock.querySelectorAll('.sub-item-bo-total')).map((mapItem, index) => {
          const mapId = mapItem.getAttribute('href')?.split('/').filter(Boolean).pop();
          const scoreEl = mapItem.querySelector('.b-title.bt16');
          const [teamScore, opponentScore] = scoreEl?.textContent?.split('-').map(Number) || [0, 0];
          const durationEl = mapItem.querySelector('.b-title.bt10');
          const duration = durationEl?.textContent?.replace(/[^0-9:]/g, '');
          const isMapWin = mapItem.classList.contains('winner');
          
          return {
            map_id: mapId,
            score: {
              team: teamScore,
              opponent: opponentScore
            },
            duration: duration,
            result: isMapWin ? 'win' : 'loss',
            map_number: index + 1
          };
        }) : [];

        const data = {
          match_id: matchId,
          url: matchLink,
          team: {
            name: teamName,
            logo: teamLogo
          },
          opponent: {
            name: opponentName,
            logo: opponentLogo
          },
          format: format,
          score: score,
          result: isWinner ? 'win' : isDraw ? 'draw' : 'loss',
          tournament: {
            name: tournamentName,
            stage: tournamentStage,
            logo: tournamentLogo,
            tier: tournamentTier,
            date: matchDate
          },
          maps: maps
        };
        
        console.log('Данные матча:', data);
        return data;
      });
    });

    console.log(`Собрано ${matches.length} матчей`);
    return matches;
  } catch (error) {
    console.error('Ошибка при парсинге матчей команды:', error);
    return [];
  }
};

// Функция сохранения данных в MongoDB
async function saveTeamData(teamData) {
  try {
    await connectDB();
    
    // Находим существующую команду
    const existingTeam = await Team.findOne({ team_id: teamData.team.team_id });
    
    if (existingTeam) {
      console.log(`Обновляем данные для команды ${teamData.team.name}`);
      
      // Группируем матчи по турнирам
      const tournaments = {};
      teamData.matches.forEach(match => {
        const tournamentName = match.tournament.name;
        if (!tournaments[tournamentName]) {
          tournaments[tournamentName] = {
            name: tournamentName,
            stage: match.tournament.stage,
            logo: match.tournament.logo,
            tier: match.tournament.tier,
            date: match.tournament.date,
            matches: []
          };
        }
        tournaments[tournamentName].matches.push({
          match_id: match.match_id,
          url: match.url,
          date: match.tournament.date,
          opponent: match.opponent,
          format: match.format,
          score: match.score,
          result: match.result,
          maps: match.maps
        });
      });

      // Обновляем только новые поля, сохраняя существующие
      const updateData = {
        $set: {
          tournaments: Object.values(tournaments),
          updated_at: new Date()
        }
      };

      // Сохраняем существующие поля
      if (existingTeam.heroes_stats) updateData.$set.heroes_stats = existingTeam.heroes_stats;
      if (existingTeam.roster) updateData.$set.roster = existingTeam.roster;
      if (existingTeam.stats) updateData.$set.stats = existingTeam.stats;

      await Team.updateOne(
        { team_id: teamData.team.team_id },
        updateData
      );

      console.log('Данные успешно обновлены');
    } else {
      console.log('Команда не найдена в базе данных');
    }
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
  }
}

// Функция для парсинга всех команд из базы данных
async function parseAllTeams() {
  console.log('Запуск парсера для всех команд...');
  
  try {
    // Подключаемся к базе данных
    await connectDB();
    
    // Получаем список всех команд
    const teams = await Team.find({}, { team_id: 1, name: 1 });
    console.log(`Найдено ${teams.length} команд для обработки`);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Обрабатываем каждую команду
      for (const team of teams) {
        console.log(`\nОбработка команды ${team.name || team.team_id}`);
        
        try {
          await page.setUserAgent(getRandomUserAgent());
          await page.setViewport({ width: 1920, height: 1080 });
          
          // Получаем информацию о команде
          const teamInfo = await parseTeamInfo(page, team.team_id);
          
          // Получаем матчи команды
          const matches = await parseTeamMatches(page, team.team_id);
          
          // Формируем и сохраняем результат
          const result = {
            team: teamInfo,
            matches: matches
          };
          
          await saveTeamData(result);
          
          // Делаем случайную задержку между командами
          await randomDelay();
          
        } catch (error) {
          console.error(`Ошибка при обработке команды ${team.team_id}:`, error);
          // Продолжаем со следующей командой
          continue;
        }
      }
    } finally {
      await browser.close();
    }
    
    console.log('\nПарсинг всех команд завершен');
    
  } catch (error) {
    console.error('Критическая ошибка при парсинге команд:', error);
  }
}

// Обновляем основную функцию
const parseTeamMatchesTest = async () => {
  console.log('Запуск тестового парсера матчей...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Получаем общую информацию о команде
    const teamInfo = await parseTeamInfo(page, TEST_TEAM_ID);
    
    // Получаем список матчей команды
    const matches = await parseTeamMatches(page, TEST_TEAM_ID);
    
    // Формируем итоговый результат
    const result = {
      team: teamInfo,
      matches: matches
    };
    
    // Выводим результат
    console.log('\nРезультаты парсинга:');
    console.log(JSON.stringify(result, null, 2));
    
    // Сохраняем данные в MongoDB
    await saveTeamData(result);
    
  } catch (error) {
    console.error('Ошибка при выполнении парсера:', error);
  } finally {
    await browser.close();
  }
};

// Экспортируем обе функции
export { parseTeamMatchesTest, parseAllTeams };

// Если файл запущен напрямую, запускаем тестовую версию
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--all') {
    parseAllTeams().catch(console.error);
  } else {
    parseTeamMatchesTest().catch(console.error);
  }
}

// В конце файла добавляем экспорт
export { parseTeamInfo, parseTeamMatches }; 