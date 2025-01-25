import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { connectDB } from '../config/mongodb.js';
import { TeamStats } from '../../server/models/TeamStats.js';
import { parseTeamInfo, parseTeamMatches } from './parseTeamTournaments.js';

// Проверяем конфигурацию
console.log('Загрузка конфигурации...');
dotenv.config();

const CYBERSCORE_URL = 'https://cyberscore.live/teams/';
const TEAMS_URL = CYBERSCORE_URL + '?order_by=rating--DESC+NULLS+LAST';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Функция для случайной задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Получить случайный User-Agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Парсинг списка команд
export const parseTeamsList = async (page) => {
  try {
    // Настраиваем страницу
    await setupPage(page);
    
    let allTeams = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      // Загружаем текущую страницу
      const pageUrl = `${TEAMS_URL}&page=${currentPage}`;
      console.log(`\nЗагрузка страницы ${currentPage}: ${pageUrl}`);
      await retryLoad(page, pageUrl);
      
      // Ждем загрузку контента
      await page.waitForSelector('.archive-block', { timeout: TIMEOUT });
      
      const pageTeams = await page.evaluate(() => {
        const items = document.querySelectorAll('.items a.item');
        return Array.from(items).map(item => {
          const teamUrl = item.getAttribute('href');
          const teamId = teamUrl.split('/').filter(Boolean).pop();
          
          return {
            name: item.querySelector('.team-name .b-title')?.textContent?.trim(),
            logo: item.querySelector('.team-name img')?.src,
            country: item.querySelector('.country .player-country span')?.textContent?.trim(),
            country_flag: item.querySelector('.country .player-country img')?.src,
            matches: parseInt(item.querySelector('.sub-item:nth-child(3) .b-title')?.textContent?.trim() || '0'),
            winrate: parseFloat(item.querySelector('.sub-item:nth-child(4) .b-title')?.textContent?.trim()?.replace('%', '') || '0'),
            roster: Array.from(item.querySelectorAll('.team img')).map(player => ({
              nickname: player.getAttribute('alt'),
              photo: player.getAttribute('src')
            })),
            team_id: teamId
          };
        }).filter(team => team.name && team.team_id);
      });

      if (pageTeams.length > 0) {
        allTeams = [...allTeams, ...pageTeams];
        console.log(`Найдено ${pageTeams.length} команд на странице ${currentPage}`);
        
        // Проверяем наличие следующей страницы
        const hasNext = await page.evaluate(() => {
          const pagination = document.querySelector('.pagination');
          if (!pagination) return false;
          
          const currentPage = parseInt(pagination.querySelector('.active')?.textContent || '0');
          const nextButton = pagination.querySelector('.next');
          return nextButton && !nextButton.classList.contains('disabled');
        });

        if (hasNext) {
          currentPage++;
          // Небольшая пауза между страницами
          await delay(3000);
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    console.log(`\nВсего найдено ${allTeams.length} команд`);
    return allTeams;
  } catch (error) {
    console.error('Ошибка при парсинге списка команд:', error);
    throw error;
  }
};

// Парсинг детальной информации о команде
const parseTeamDetails = async (page, teamId) => {
  try {
    const teamUrl = `${CYBERSCORE_URL}${teamId}/`;
    await retryLoad(page, teamUrl);
    
    await page.waitForSelector('.teams-single-about-wrapper', { timeout: TIMEOUT });
    
    const teamInfo = await page.evaluate(() => {
      // Получаем основную статистику
      const stats = {
        winrate: parseFloat(document.querySelector('.teams-single-statistics .item:nth-child(1) .progress-title.b-title.bt16.bold')?.textContent?.replace('%', '') || '0'),
        losses: parseFloat(document.querySelector('.teams-single-statistics .item:nth-child(2) .progress-title.b-title.bt16.bold')?.textContent?.replace('%', '') || '0'),
        first_places: parseFloat(document.querySelector('.teams-single-statistics .item:nth-child(3) .progress-title.b-title.bt16.bold')?.textContent?.replace('%', '') || '0')
      };

      // Получаем детальную статистику
      const items = document.querySelectorAll('.teams-single-about-wrapper .items .item');
      items.forEach(item => {
        const title = item.querySelector('.b-title.bt14.color26')?.textContent?.trim().toLowerCase();
        const value = item.querySelector('.b-title.bt16.bold')?.textContent?.trim();
        if (title && value) {
          stats[title.replace(/\s+/g, '_')] = value;
        }
      });

      // Получаем основной состав
      const mainRoster = Array.from(document.querySelectorAll('.teams-single-players .items .item')).map(player => {
        const playerUrl = player.getAttribute('href') || '';
        const playerId = playerUrl.match(/\/en\/players\/(\d+)\//)?.[1];
        
        return {
          nickname: player.querySelector('.desc-bottom .nickname.b-title.bt16.bold')?.textContent?.trim() || '',
          full_name: player.querySelector('.desc-bottom .full-name.b-title.bt16.color26')?.textContent?.trim() || '',
          country: player.querySelector('.desc-top .player-country span')?.textContent?.trim() || '',
          role: player.querySelector('.desc-top .role .truncate')?.textContent?.trim() || '',
          rank: player.querySelector('.desc-bottom .rank .tier')?.textContent?.trim() || '',
          photo: player.querySelector('.image img')?.src || '',
          player_id: playerId
        };
      });

      // Получаем дополнительных членов команды
      const otherMembers = Array.from(document.querySelectorAll('.teams-single-players:nth-of-type(2) .items .item')).map(player => {
        const playerUrl = player.getAttribute('href') || '';
        const playerId = playerUrl.match(/\/en\/players\/(\d+)\//)?.[1];
        
        return {
          nickname: player.querySelector('.desc-bottom .nickname.b-title.bt16.bold')?.textContent?.trim() || '',
          full_name: player.querySelector('.desc-bottom .full-name.b-title.bt16.color26')?.textContent?.trim() || '',
          country: player.querySelector('.desc-top .player-country span')?.textContent?.trim() || '',
          role: player.querySelector('.desc-top .role .truncate')?.textContent?.trim() || '',
          rank: player.querySelector('.desc-bottom .rank .tier')?.textContent?.trim() || '',
          photo: player.querySelector('.image img')?.src || '',
          player_id: playerId
        };
      });

      // Получаем историю команды
      const history = Array.from(document.querySelectorAll('.teams-single-description .text-in p')).map(p => p.textContent?.trim()).filter(Boolean);

      return {
        name: document.querySelector('.block-title h1.b-title.bt18.extrabold.color1.ttu')?.textContent?.trim() || '',
        stats,
        roster: {
          main: mainRoster,
          other: otherMembers
        },
        history: history.join('\n')
      };
    });

    if (!teamInfo || !teamInfo.name) {
      console.log(`✗ Не удалось получить информацию о команде ${teamId}`);
      return null;
    }

    console.log(`✓ ${teamInfo.name} [${teamInfo.roster.main.length + teamInfo.roster.other.length} игроков]`);
    return teamInfo;
  } catch (error) {
    console.log(`✗ Ошибка при обработке команды ${teamId}`);
    return null;
  }
};

// Парсинг статистики героев команды
const parseTeamHeroes = async (page, teamId) => {
  try {
    const heroesUrl = `${CYBERSCORE_URL}${teamId}/heroes/`;
    await retryLoad(page, heroesUrl);
    
    await page.waitForSelector('.teams-single-heroes', { timeout: TIMEOUT });
    
    return await page.evaluate(() => {
      // Получаем основной состав и их героев
      const mainRoster = Array.from(document.querySelectorAll('.teams-single-heroes:first-child .items .item')).map(player => {
        // Информация об игроке
        const playerInfo = {
          photo: player.querySelector('.sub-item.sub-item-name img')?.src || '',
          nickname: player.querySelector('.sub-item.sub-item-name .b-title.bt16')?.textContent?.trim() || '',
          winrate: parseFloat(player.querySelector('.sub-item-progress .CircularProgressbar-text')?.textContent?.replace('%', '') || '0'),
        };

        // Получаем героев игрока
        const heroes = Array.from(player.querySelectorAll('.sub-item-heroes .hero-wrapper')).map(hero => ({
          name: hero.querySelector('.image img')?.alt || hero.querySelector('.image img')?.title || '',
          image: hero.querySelector('.image img')?.src || '',
          matches: parseInt(hero.querySelector('.hero-stats-in span:first-child')?.textContent || '0'),
          winrate: parseFloat(hero.querySelector('.hero-stats-in span:last-child')?.textContent?.replace('%', '') || '0')
        }));

        return {
          ...playerInfo,
          heroes
        };
      });

      // Получаем дополнительных членов команды
      const otherRoster = Array.from(document.querySelectorAll('.teams-single-heroes:nth-of-type(2) .items .item')).map(player => {
        const playerInfo = {
          photo: player.querySelector('.sub-item.sub-item-name img')?.src || '',
          nickname: player.querySelector('.sub-item.sub-item-name .b-title.bt16')?.textContent?.trim() || '',
          winrate: parseFloat(player.querySelector('.sub-item-progress .CircularProgressbar-text')?.textContent?.replace('%', '') || '0'),
        };

        const heroes = Array.from(player.querySelectorAll('.sub-item-heroes .hero-wrapper')).map(hero => ({
          name: hero.querySelector('.image img')?.alt || hero.querySelector('.image img')?.title || '',
          image: hero.querySelector('.image img')?.src || '',
          matches: parseInt(hero.querySelector('.hero-stats-in span:first-child')?.textContent || '0'),
          winrate: parseFloat(hero.querySelector('.hero-stats-in span:last-child')?.textContent?.replace('%', '') || '0')
        }));

        return {
          ...playerInfo,
          heroes
        };
      });

      return {
        main_roster: mainRoster,
        other_roster: otherRoster
      };
    });
  } catch (error) {
    console.log(`✗ Ошибка при парсинге героев команды ${teamId}`);
    return null;
  }
};

// Парсинг информации об игроке
const parsePlayerDetails = async (page, playerId) => {
  if (!playerId) {
    console.log('✗ ID игрока не определен');
    return null;
  }

  try {
    const playerUrl = `https://cyberscore.live/en/players/${playerId}/`;
    console.log(`\nЗагрузка страницы игрока: ${playerUrl}`);
    await retryLoad(page, playerUrl);
    console.log('✓ Страница загружена');
    
    // Делаем скриншот для отладки
    await page.screenshot({ path: `debug_player_${playerId}.png` });
    console.log('✓ Сделан скриншот страницы');
    
    // Получаем HTML страницы для проверки
    const pageContent = await page.content();
    console.log('Длина HTML:', pageContent.length);
    
    // Ждем загрузку контента
    console.log('Ожидание селектора .players-single-heroes...');
    await page.waitForSelector('.players-single-heroes', { timeout: TIMEOUT });
    console.log('✓ Селектор .players-single-heroes найден');
    
    // Проверяем наличие контейнера с героями
    const heroesData = await page.evaluate(() => {
      console.log('Начинаем проверку контейнера героев...');
      
      const container = document.querySelector('.players-single-heroes .items');
      console.log('Контейнер найден:', !!container);
      
      if (!container) {
        return { error: 'Контейнер с героями не найден' };
      }
      
      const heroes = container.querySelectorAll('.item');
      console.log(`Найдено героев в DOM: ${heroes.length}`);
      
      // Проверяем структуру первого героя
      if (heroes.length > 0) {
        const firstHero = heroes[0];
        const heroData = {
          name: firstHero.querySelector('.hero-item-col__name')?.textContent?.trim(),
          image: firstHero.querySelector('.hero-item-col__image img')?.src,
          winrate: firstHero.querySelector('.sub-item:nth-child(2) .CircularProgressbar-text')?.textContent,
          matches: firstHero.querySelector('.sub-item:nth-child(3) .b-title.bt15')?.textContent,
          kda: firstHero.querySelector('.sub-item:nth-child(4) .CircularProgressbar-text')?.textContent,
          lastGame: firstHero.querySelector('.sub-item:nth-child(5) .b-title.bt15')?.textContent
        };
        
        console.log('Данные первого героя:', JSON.stringify(heroData, null, 2));
      }
      
      // Собираем данные всех героев
      const heroesData = Array.from(heroes).map(item => {
        const name = item.querySelector('.hero-item-col__name')?.textContent?.trim() || '';
        const image = item.querySelector('.hero-item-col__image img')?.src || '';
        const winrate = parseFloat(item.querySelector('.sub-item:nth-child(2) .CircularProgressbar-text')?.textContent?.replace('%', '') || '0');
        const matches = parseInt(item.querySelector('.sub-item:nth-child(3) .b-title.bt15')?.textContent || '0');
        const kda = parseFloat(item.querySelector('.sub-item:nth-child(4) .CircularProgressbar-text')?.textContent || '0');
        const last_game = item.querySelector('.sub-item:nth-child(5) .b-title.bt15')?.textContent?.trim() || '';
        
        return { name, image, winrate, matches, kda, last_game };
      });

      return {
        heroes: heroesData,
        total: heroes.length
      };
    });
    
    if (heroesData.error) {
      console.log(`✗ Ошибка: ${heroesData.error}`);
      return null;
    }
    
    console.log(`Найдено героев: ${heroesData.total}`);
    heroesData.heroes.forEach(hero => {
      console.log(`Обработан герой: ${hero.name} (${hero.matches} игр, KDA: ${hero.kda}, WR: ${hero.winrate}%)`);
    });

    return {
      heroes: heroesData.heroes,
      total_heroes: heroesData.total
    };
  } catch (error) {
    console.log(`✗ Ошибка при парсинге игрока: ${error.message}`);
    return null;
  }
};

const TIMEOUT = 60000; // Увеличиваем таймаут до 60 секунд

// Функция для обхода блокировщика рекламы
const bypassAdBlock = async (page) => {
  // Включаем JavaScript и перехват запросов
  await page.setJavaScriptEnabled(true);
  await page.setRequestInterception(true);
  
  // Обрабатываем запросы
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (['image', 'stylesheet', 'font'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });
  
  // Устанавливаем эмуляцию устройства
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
};

// Функция для установки заголовков
const setupPage = async (page) => {
  const userAgent = getRandomUserAgent();
  
  await page.setUserAgent(userAgent);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Chromium";v="120", "Not(A:Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': userAgent,
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document'
  });
  
  await bypassAdBlock(page);
};

// Функция для повторных попыток загрузки страницы
const retryLoad = async (page, url, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Повторная попытка ${attempt}/${maxAttempts}...`);
      }
      
      const response = await page.goto(url, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
        timeout: TIMEOUT 
      });

      if (response.status() === 404) {
        throw new Error('Страница не найдена');
      }

      await page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               !document.querySelector('.loading') && 
               window.performance.timing.loadEventEnd > 0;
      }, { timeout: TIMEOUT });
      
      await delay(3000);
      
      const content = await page.evaluate(() => {
        const mainContent = document.querySelector('.teams-single-about') || 
                          document.querySelector('.archive-block') || 
                          document.querySelector('.players-single-heroes');
        return !!mainContent;
      });
      
      if (!content) {
        throw new Error('Контент не загружен');
      }
      
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(attempt * 7000);
    }
  }
  return false;
};

// Функция очистки данных перед сохранением
const cleanDataForFirestore = (data) => {
  if (!data) return null;
  if (typeof data !== 'object') {
    // Преобразуем все числа в строки, если они не конечные
    if (typeof data === 'number' && !Number.isFinite(data)) {
      return '0';
    }
    return data;
  }
  
  const cleaned = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    // Пропускаем специальные значения
    if (value === undefined) continue;
    if (value === null) continue;
    if (typeof value === 'function') continue;
    if (typeof value === 'symbol') continue;
    
    // Очищаем значение
    let cleanedValue;
    if (typeof value === 'object') {
      cleanedValue = cleanDataForFirestore(value);
    } else if (typeof value === 'number') {
      // Преобразуем все числа в строки, если они не конечные
      cleanedValue = Number.isFinite(value) ? value : '0';
    } else {
      cleanedValue = value;
    }
    
    // Проверяем ключ и значение
    if (cleanedValue !== undefined && cleanedValue !== null) {
      cleaned[key] = cleanedValue;
    }
  }
  
  return cleaned;
};

const parseTeams = async () => {
  let browser = null;
  let page = null;
  
  try {
    console.log('\nПодключаемся к MongoDB...');
    await connectDB();
    
    // Получаем существующие team_id
    const existingTeams = await TeamStats.distinct('team_id');
    console.log(`В базе уже есть ${existingTeams.length} команд\n`);
    
    console.log('\nНачинаем парсинг команд...');

    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--disable-web-security'
      ]
    });

    // Цикл по страницам
    for(let pageNum = 1; pageNum <= 5; pageNum++) {
      console.log(`\nОбработка страницы ${pageNum}...`);
      
      page = await browser.newPage();
      await setupPage(page);
      
      const pageUrl = `${TEAMS_URL}&page=${pageNum}`;
      await page.goto(pageUrl, {
        waitUntil: 'networkidle0',
        timeout: TIMEOUT
      });

      await page.waitForSelector('.archive-block', { timeout: TIMEOUT });
      const teams = await page.evaluate(() => {
        // Проверяем структуру страницы
        const archiveBlock = document.querySelector('.archive-block');
        if (!archiveBlock) {
          console.log('Не найден основной контейнер .archive-block');
          return [];
        }
        
        const itemsContainer = archiveBlock.querySelector('.items');
        if (!itemsContainer) {
          console.log('Не найден контейнер списка команд .items');
          return [];
        }
        
        const items = itemsContainer.querySelectorAll('.item');
        console.log('Найдено элементов:', items.length);
        
        if (items.length === 0) {
          console.log('Список команд пуст');
          return [];
        }
        
        return Array.from(items).map(item => {
          try {
            const teamUrl = item.getAttribute('href') || '';
            const teamId = teamUrl.split('/').filter(Boolean).pop() || '';
            
            const data = {
              name: item.querySelector('.team-name .b-title')?.textContent?.trim() || '',
              logo: item.querySelector('.team-name img')?.src || '',
              country: item.querySelector('.country .player-country span')?.textContent?.trim() || '',
              country_flag: item.querySelector('.country .player-country img')?.src || '',
              matches: parseInt(item.querySelector('.sub-item:nth-child(3) .b-title')?.textContent?.trim() || '0'),
              winrate: parseFloat(item.querySelector('.sub-item:nth-child(4) .b-title')?.textContent?.trim()?.replace('%', '') || '0'),
              roster: Array.from(item.querySelectorAll('.team img')).map(player => ({
                nickname: player.getAttribute('alt') || '',
                photo: player.getAttribute('src') || ''
              })),
              team_id: teamId,
              url: teamUrl
            };
            
            console.log('Обработана команда:', data.name || 'Unnamed');
            return data;
          } catch (error) {
            console.error('Ошибка при обработке команды:', error);
            return null;
          }
        }).filter(team => team !== null && team.name && team.team_id);
      });

      // Фильтруем только новые команды
      const newTeams = teams.filter(team => !existingTeams.includes(team.team_id));
      console.log(`\nНайдено новых команд: ${newTeams.length}`);
      
      if (newTeams.length > 0) {
        console.log('\nОбработка команд:');
        for (const team of newTeams) {
          try {
            // Получаем информацию о команде
            const teamPage = await browser.newPage();
            await setupPage(teamPage);
            const teamData = await parseTeamDetails(teamPage, team.team_id);
            
            if (teamData && teamData.name) {
              // Получаем статистику героев команды
              const heroesPage = await browser.newPage();
              await setupPage(heroesPage);
              const heroesData = await parseTeamHeroes(heroesPage, team.team_id);
              await heroesPage.close();

              // Получаем статистику каждого игрока
              const playersData = {
                main: [],
                other: []
              };

              // Обрабатываем основной состав
              for (const player of teamData.roster.main) {
                const playerPage = await browser.newPage();
                await setupPage(playerPage);
                const playerStats = await parsePlayerDetails(playerPage, player.player_id);
                if (playerStats) {
                  playersData.main.push({
                    ...player,
                    heroes_stats: playerStats
                  });
                }
                await playerPage.close();
                await delay(2000);
              }

              // Обрабатываем дополнительных членов
              for (const player of teamData.roster.other) {
                const playerPage = await browser.newPage();
                await setupPage(playerPage);
                const playerStats = await parsePlayerDetails(playerPage, player.player_id);
                if (playerStats) {
                  playersData.other.push({
                    ...player,
                    heroes_stats: playerStats
                  });
                }
                await playerPage.close();
                await delay(2000);
              }

              const fullTeamData = {
                ...teamData,
                heroes_stats: heroesData || { main_roster: [] },
                roster: playersData
              };
              
              try {
                const teamDoc = {
                  ...fullTeamData,
                  team_id: team.team_id,
                  parsed_at: new Date(),
                  updated_at: new Date()
                };
                
                // Сохраняем в MongoDB
                await TeamStats.findOneAndUpdate(
                  { team_id: team.team_id },
                  teamDoc,
                  { upsert: true, new: true }
                );
                
                console.log(`✓ ${teamData.name} | ID: ${team.team_id} [${playersData.main.length + playersData.other.length} игроков]`);
              } catch (error) {
                console.error(`✗ Ошибка сохранения ${teamData.name}:`, error);
              }
            }
            
            await teamPage.close();
          } catch (error) {
            console.log(`✗ Ошибка при обработке команды ${team.name || team.team_id}`);
          }
        }
      }
      
      await page.close();
      if (pageNum < 5) await delay(10000); // Пауза между страницами
    }

    console.log('\nГотово!');
    console.log(`Обработано успешно: ${teams.length} из ${teams.length}`);
    
    return teams;
  } catch (error) {
    console.log('\n✗ Критическая ошибка:', error.message);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
};

// Поиск команды по названию
const findTeamByName = async (page, teamName) => {
  try {
    const searchUrl = `${CYBERSCORE_URL}search?query=${encodeURIComponent(teamName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle0' });
    
    const teamId = await page.evaluate(() => {
      const firstTeam = document.querySelector('.items .item');
      if (!firstTeam) return null;
      const teamUrl = firstTeam.getAttribute('href');
      return teamUrl.split('/').filter(Boolean).pop();
    });
    
    return teamId;
  } catch (error) {
    console.error('Ошибка при поиске команды:', error);
    return null;
  }
};

// Функция для парсинга одной команды
export const parseOneTeam = async (teamId) => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());

    // Настраиваем страницу
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Получаем детальную информацию о команде
    const teamDetails = await parseTeamDetails(page, teamId);
    if (!teamDetails) {
      throw new Error('Не удалось получить детальную информацию о команде');
    }

    // Получаем статистику героев
    const heroesStats = await parseTeamHeroes(page, teamId);
    if (!heroesStats) {
      console.log('Предупреждение: Не удалось получить статистику героев');
    }

    // Получаем информацию о турнирах
    console.log('\n2. Парсинг информации о турнирах:');
    const teamInfo = await parseTeamInfo(page, teamId);
    console.log('Информация о команде:', {
      name: teamInfo.name,
      region: teamInfo.region,
      maps_played: teamInfo.maps_played,
      maps_won: teamInfo.maps_won,
      events_count: teamInfo.events_count
    });

    // Получаем последние матчи
    console.log('\n3. Парсинг последних матчей:');
    const matches = await parseTeamMatches(page, teamId);
    console.log('Последние 3 матча:', matches?.slice(0, 3).map(match => ({
      opponent: match.opponent.name,
      score: match.score,
      result: match.result,
      tournament: match.tournament.name
    })));

    // Подключаемся к БД
    await connectDB();

    // Обновляем или создаем запись в БД
    await TeamStats.updateOne(
      { team_id: teamId },
      {
        $set: {
          team_id: teamId,
          name: teamDetails.name,
          heroes_stats: heroesStats,
          roster: teamDetails.roster,
          stats: {
            ...teamDetails.stats,
            losses: teamInfo.maps_lost || 0,
            first_places: teamInfo.first_places || 0
          },
          tournaments: matches.reduce((acc, match) => {
            const tournamentName = match.tournament.name;
            const existingTournament = acc.find(t => t.name === tournamentName);
            
            if (existingTournament) {
              existingTournament.matches.push({
                match_id: match.match_id,
                url: match.url,
                date: match.tournament.date,
                opponent: match.opponent,
                format: match.format,
                score: match.score,
                result: match.result,
                maps: match.maps
              });
            } else {
              acc.push({
                name: tournamentName,
                logo: match.tournament.logo,
                date: match.tournament.date,
                matches: [{
                  match_id: match.match_id,
                  url: match.url,
                  date: match.tournament.date,
                  opponent: match.opponent,
                  format: match.format,
                  score: match.score,
                  result: match.result,
                  maps: match.maps
                }]
              });
            }
            
            return acc;
          }, []),
          parsed_at: new Date(),
          updated_at: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`✓ Данные команды ${teamDetails.name} успешно сохранены`);
    return teamDetails;

  } catch (error) {
    console.error('Ошибка при парсинге команды:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

// Экспортируем функции
export { parseTeamsList as default, parseTeamDetails, parseTeamHeroes, parsePlayerDetails }; 