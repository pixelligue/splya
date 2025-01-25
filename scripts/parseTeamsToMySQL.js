import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import pool from '../src/config/database.js';

dotenv.config();

const CYBERSCORE_URL = 'https://cyberscore.live/en';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const TIMEOUT = 60000;
const DELAY_MIN = 3000;
const DELAY_MAX = 7000;
const MAX_RETRIES = 3;

// Вспомогательные функции
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN) + DELAY_MIN));
const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Функция для повторных попыток
async function retryOperation(operation, maxRetries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.log(`Попытка ${attempt}/${maxRetries} не удалась: ${error.message}`);
            if (attempt === maxRetries) throw error;
            await delay(attempt * 5000);
        }
    }
}

// Функция для преобразования даты из формата DD.MM.YYYY в YYYY-MM-DD
const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Not available') return null;
    
    const [day, month, year] = dateStr.split('.');
    if (!day || !month || !year) return null;
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Парсинг детальной информации о команде
async function parseTeamDetails(page, teamId, teamBasicInfo) {
    try {
        const teamUrl = `${CYBERSCORE_URL}/teams/${teamId}`;
        console.log(`\nЗагрузка детальной информации о команде ${teamBasicInfo.name}: ${teamUrl}`);
        
        await retryOperation(async () => {
            await page.goto(teamUrl, { waitUntil: 'networkidle0', timeout: TIMEOUT });
            await page.waitForSelector('.teams-single-about', { timeout: TIMEOUT });
        });

        const teamData = await page.evaluate(() => {
            const getItemValue = (label) => {
                const item = Array.from(document.querySelectorAll('.teams-single-about .item')).find(el => 
                    el.querySelector('.color26')?.textContent?.trim() === label
                );
                return item?.querySelector('.bold')?.textContent?.trim() || null;
            };

            // Получаем основную информацию
            const teamName = document.querySelector('.teams-single-about .color1.ttu')?.textContent?.trim();
            const teamLogo = document.querySelector('.teams-single-about .image img')?.src;
            
            // Извлекаем числовые значения
            const mapsPlayed = getItemValue('Maps played:')?.split(' ')[0];
            const mapsWon = getItemValue('Maps won:')?.split(' ')[0];
            const mapsLost = getItemValue('Maps lost:')?.split(' ')[0];
            
            // Выводим все найденные элементы для отладки
            const allItems = Array.from(document.querySelectorAll('.teams-single-about .item')).map(item => ({
                label: item.querySelector('.color26')?.textContent?.trim(),
                value: item.querySelector('.bold')?.textContent?.trim()
            }));
            console.log('Найденные элементы:', allItems);

            const data = {
                logo_url: teamLogo,
                region: getItemValue('Country/region:'),
                matches_total: parseInt(mapsPlayed) || 0,
                matches_won: parseInt(mapsWon) || 0,
                matches_lost: parseInt(mapsLost) || 0,
                events_count: parseInt(getItemValue('Events:')) || 0,
                first_places: parseInt(getItemValue('First places:')) || 0,
                creation_date: getItemValue('Creation date:'),
                total_winnings: parseFloat((getItemValue('Prize money:') || '0').replace(/[^0-9.]/g, ''))
            };

            // Выводим собранные данные для отладки
            console.log('Собранные данные:', data);

            return data;
        });

        console.log('Результат парсинга:', teamData);

        return {
            team_id: teamId,
            name: teamBasicInfo.name,
            logo_url: teamData.logo_url,
            rating: teamBasicInfo.rating,
            country: teamBasicInfo.country,
            region: teamData.region,
            total_winnings: teamData.total_winnings,
            matches_won: teamData.matches_won,
            matches_total: teamData.matches_total,
            matches_lost: teamData.matches_lost,
            events_count: teamData.events_count,
            first_places: teamData.first_places,
            creation_date: teamData.creation_date,
            winrate: teamData.matches_total > 0 ? (teamData.matches_won / teamData.matches_total * 100) : 0
        };
    } catch (error) {
        console.error(`Ошибка при парсинге команды ${teamId}:`, error.message);
        return null;
    }
}

// Получение списка команд
async function getTeamsList(page, testMode = false) {
    try {
        let teams = [];
        let currentPage = 1;
        let emptyPagesCount = 0;
        
        // Если тестовый режим, парсим только Team Spirit
        if (testMode) {
            console.log('Тестовый режим: ищем Team Spirit...');
            const teamSpirit = {
                id: '46254', // ID Team Spirit
                name: 'Team Spirit',
                country: 'RU',
                rating: 1000
            };
            return [teamSpirit];
        }

        while (true) {
            const pageUrl = `${CYBERSCORE_URL}/teams/?order_by=rating--DESC+NULLS+LAST&page=${currentPage}`;
            console.log(`\nЗагрузка страницы ${currentPage}: ${pageUrl}`);
            
            await retryOperation(async () => {
                await page.goto(pageUrl, { 
                    waitUntil: 'networkidle0', 
                    timeout: TIMEOUT 
                });
                await page.waitForSelector('.archive-block', { timeout: TIMEOUT });
            });

            const pageTeams = await page.evaluate(() => {
                const items = document.querySelectorAll('.items a.item');
                return Array.from(items).map(item => {
                    const teamUrl = item.getAttribute('href');
                    const name = item.querySelector('.sub-item.team-name .b-title')?.textContent?.trim() || 'Unknown';
                    const country = item.querySelector('.player-country span:last-child')?.textContent?.trim() || null;
                    const ratingElements = item.querySelectorAll('.sub-item .b-title.bt16');
                    const rating = ratingElements.length > 2 ? parseInt(ratingElements[2].textContent.trim()) : 0;
                    
                    return {
                        id: teamUrl.split('/').filter(Boolean).pop(),
                        name,
                        country,
                        rating
                    };
                });
            });

            if (pageTeams.length === 0) {
                emptyPagesCount++;
                console.log('Страница не содержит команд');
                
                if (emptyPagesCount >= 3) {
                    console.log('Достигнут конец списка команд');
                    break;
                }
                
                currentPage++;
                await randomDelay();
                continue;
            }

            emptyPagesCount = 0;
            teams.push(...pageTeams);
            
            console.log(`Найдено ${pageTeams.length} команд на странице ${currentPage}`);
            console.log(`Всего собрано ${teams.length} команд`);

            currentPage++;
            await randomDelay();
        }

        console.log(`\nИтого найдено ${teams.length} команд`);
        return teams;
    } catch (error) {
        console.error('Ошибка при получении списка команд:', error.message);
        throw error;
    }
}

// Сохранение команды в базу данных
async function saveTeam(connection, teamData) {
    try {
        console.log('Сохраняем данные:', teamData);
        
        const data = {
            team_id: teamData.team_id || null,
            name: teamData.name || null,
            logo_url: teamData.logo_url || null,
            rating: teamData.rating || 0,
            country: teamData.country || null,
            region: teamData.region || null,
            total_winnings: teamData.total_winnings || 0,
            matches_total: teamData.matches_total || 0,
            matches_won: teamData.matches_won || 0,
            matches_lost: teamData.matches_lost || 0,
            events_count: teamData.events_count || 0,
            first_places: teamData.first_places || 0,
            creation_date: formatDate(teamData.creation_date),
            winrate: teamData.winrate || 0
        };

        console.log('Сохраняем данные:', data);

        const [result] = await connection.execute(
            `INSERT INTO teams (
                team_id, name, logo_url, rating, country, region, total_winnings,
                matches_total, matches_won, matches_lost, events_count, first_places,
                creation_date, parsed_at
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            logo_url = VALUES(logo_url),
            rating = VALUES(rating),
            country = VALUES(country),
            region = VALUES(region),
            total_winnings = VALUES(total_winnings),
            matches_total = VALUES(matches_total),
            matches_won = VALUES(matches_won),
            matches_lost = VALUES(matches_lost),
            events_count = VALUES(events_count),
            first_places = VALUES(first_places),
            creation_date = VALUES(creation_date),
            parsed_at = NOW()`,
            [
                data.team_id, data.name, data.logo_url, data.rating, 
                data.country, data.region, data.total_winnings,
                data.matches_total, data.matches_won, data.matches_lost,
                data.events_count, data.first_places, data.creation_date
            ]
        );
        
        // Обновляем статистику команды
        await connection.execute(
            `INSERT INTO team_stats (team_id, total_matches, wins, losses, winrate) 
             SELECT id, ?, ?, ?, ? FROM teams WHERE team_id = ?
             ON DUPLICATE KEY UPDATE
             total_matches = VALUES(total_matches),
             wins = VALUES(wins),
             losses = VALUES(losses),
             winrate = VALUES(winrate)`,
            [
                data.matches_total,
                data.matches_won,
                data.matches_lost,
                data.winrate,
                data.team_id
            ]
        );

        console.log(`Сохранена информация о команде: ${data.name}`);
        return result;
    } catch (error) {
        console.error(`Ошибка при сохранении команды ${teamData?.name || 'Unknown'}:`, error.message);
        throw error;
    }
}

// Определение позиции игрока на основе его роли
function getPositionFromRole(role) {
    role = role.toLowerCase();
    if (role.includes('carry') || role.includes('pos1')) return 1;
    if (role.includes('mid') || role.includes('pos2')) return 2;
    if (role.includes('offlane') || role.includes('pos3')) return 3;
    if (role.includes('soft support') || role.includes('pos4')) return 4;
    if (role.includes('hard support') || role.includes('pos5') || role === 'support') return 5;
    return 0; // Unknown или другие роли (например, coach)
}

// Парсинг состава команды
async function parseTeamRoster(page, teamId) {
    try {
        const rosterUrl = `${CYBERSCORE_URL}/teams/${teamId}`;
        console.log('\nЗагрузка состава команды:', rosterUrl);
        
        await retryOperation(async () => {
            await page.goto(rosterUrl, { waitUntil: 'networkidle0', timeout: TIMEOUT });
            await page.waitForSelector('.teams-single-players', { timeout: TIMEOUT });
        });

        const rosterData = await page.evaluate(() => {
            const players = {
                main: [],
                other: []
            };

            // Парсинг основного состава
            const mainPlayers = document.querySelectorAll('.teams-single-players .items .item');
            mainPlayers.forEach(player => {
                const playerUrl = player.getAttribute('href') || '';
                const playerId = playerUrl.split('/').filter(Boolean).pop();
                
                if (playerId) {
                    players.main.push({
                        player_id: playerId,
                        nickname: player.querySelector('.desc-bottom .nickname.b-title.bt16.bold')?.textContent?.trim() || '',
                        real_name: player.querySelector('.desc-bottom .full-name.b-title.bt16.color26')?.textContent?.trim() || '',
                        country: player.querySelector('.desc-top .player-country span')?.textContent?.trim() || '',
                        role: player.querySelector('.desc-top .role .truncate')?.textContent?.trim() || '',
                        avatar_url: player.querySelector('.image img')?.src || ''
                    });
                }
            });

            // Парсинг дополнительных игроков
            const otherPlayers = document.querySelectorAll('.teams-single-players:nth-of-type(2) .items .item');
            otherPlayers.forEach(player => {
                const playerUrl = player.getAttribute('href') || '';
                const playerId = playerUrl.split('/').filter(Boolean).pop();
                
                if (playerId) {
                    players.other.push({
                        player_id: playerId,
                        nickname: player.querySelector('.desc-bottom .nickname.b-title.bt16.bold')?.textContent?.trim() || '',
                        real_name: player.querySelector('.desc-bottom .full-name.b-title.bt16.color26')?.textContent?.trim() || '',
                        country: player.querySelector('.desc-top .player-country span')?.textContent?.trim() || '',
                        role: player.querySelector('.desc-top .role .truncate')?.textContent?.trim() || '',
                        avatar_url: player.querySelector('.image img')?.src || ''
                    });
                }
            });

            return players;
        });

        // Добавляем позиции для каждого игрока
        for (const roster of [rosterData.main, rosterData.other]) {
            for (const player of roster) {
                player.position = getPositionFromRole(player.role);
            }
        }

        console.log('\nОсновной состав:', rosterData.main);
        console.log('\nЗапасные игроки:', rosterData.other);

        return rosterData;
    } catch (error) {
        console.error(`Ошибка при парсинге состава команды ${teamId}:`, error);
        return null;
    }
}

// Сохранение команды и состава
async function saveTeamWithRoster(connection, teamData, rosterData) {
    try {
        // Сохраняем команду
        await saveTeam(connection, teamData);

        // Создаем активный ростер для команды
        const [rosterResult] = await connection.execute(
            `INSERT INTO rosters (team_id, is_active, start_date)
             VALUES (?, 1, CURRENT_DATE)
             ON DUPLICATE KEY UPDATE
             is_active = VALUES(is_active)`,
            [teamData.team_id]
        );

        // Получаем ID созданного ростера
        const [rosterIdResult] = await connection.execute(
            'SELECT id FROM rosters WHERE team_id = ? AND is_active = 1',
            [teamData.team_id]
        );
        
        const rosterId = rosterIdResult[0].id;

        // Сохраняем игроков и их статистику
        for (const roster of [rosterData.main, rosterData.other]) {
            for (const player of roster) {
                // Сохраняем игрока
                await connection.execute(
                    `INSERT INTO players (player_id, nickname, real_name, country, avatar_url)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     nickname = VALUES(nickname),
                     real_name = VALUES(real_name),
                     country = VALUES(country),
                     avatar_url = VALUES(avatar_url)`,
                    [
                        player.player_id,
                        player.nickname || null,
                        player.real_name || null,
                        player.country || null,
                        player.avatar_url || null
                    ]
                );

                // Сохраняем связь игрока с ростером
                await connection.execute(
                    `INSERT INTO roster_players (roster_id, player_id, position, role, is_active)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     position = VALUES(position),
                     role = VALUES(role),
                     is_active = VALUES(is_active)`,
                    [
                        rosterId,
                        player.player_id,
                        player.position || 0,
                        player.role || null,
                        1
                    ]
                );

                // Если есть статистика игрока, сохраняем её
                if (player.stats) {
                    await connection.execute(
                        `INSERT INTO player_stats (player_id, total_matches, wins, losses, avg_kills, avg_deaths, avg_assists, avg_gpm, avg_xpm)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE
                         total_matches = VALUES(total_matches),
                         wins = VALUES(wins),
                         losses = VALUES(losses),
                         avg_kills = VALUES(avg_kills),
                         avg_deaths = VALUES(avg_deaths),
                         avg_assists = VALUES(avg_assists),
                         avg_gpm = VALUES(avg_gpm),
                         avg_xpm = VALUES(avg_xpm)`,
                        [
                            player.player_id,
                            player.stats.total_matches || 0,
                            player.stats.wins || 0,
                            player.stats.losses || 0,
                            player.stats.avg_kills || 0,
                            player.stats.avg_deaths || 0,
                            player.stats.avg_assists || 0,
                            player.stats.avg_gpm || 0,
                            player.stats.avg_xpm || 0
                        ]
                    );

                    // Сохраняем статистику по героям
                    if (player.stats.heroes) {
                        for (const hero of player.stats.heroes) {
                            await connection.execute(
                                `INSERT INTO player_hero_stats (player_id, hero_name, matches_played, wins, avg_kda, last_game)
                                 VALUES (?, ?, ?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE
                                 matches_played = VALUES(matches_played),
                                 wins = VALUES(wins),
                                 avg_kda = VALUES(avg_kda),
                                 last_game = VALUES(last_game)`,
                                [
                                    player.player_id,
                                    hero.name || null,
                                    hero.matches || 0,
                                    Math.round((hero.winrate / 100) * hero.matches) || 0,
                                    hero.kda || 0,
                                    formatDate(hero.last_game) || null
                                ]
                            );
                        }
                    }
                }
            }
        }

        console.log(`Сохранен состав команды ${teamData.name}`);
    } catch (error) {
        console.error(`Ошибка при сохранении состава команды ${teamData.name}:`, error.message);
        throw error;
    }
}

// Парсинг статистики игрока
async function parsePlayerStats(page, playerId) {
    try {
        const playerUrl = `${CYBERSCORE_URL}/players/${playerId}`;
        console.log(`\nЗагрузка статистики игрока: ${playerUrl}`);
        
        await retryOperation(async () => {
            await page.goto(playerUrl, { waitUntil: 'networkidle0', timeout: TIMEOUT });
            await page.waitForSelector('.players-single-heroes', { timeout: TIMEOUT });
        });

        const playerStats = await page.evaluate(() => {
            const getStatValue = (label) => {
                const item = Array.from(document.querySelectorAll('.players-single-about .item')).find(el => 
                    el.querySelector('.color26')?.textContent?.trim() === label
                );
                return item ? parseFloat(item.querySelector('.bold')?.textContent?.replace(/[^0-9.]/g, '')) || 0 : 0;
            };

            // Получаем основную статистику
            const stats = {
                total_matches: getStatValue('Maps played:'),
                wins: getStatValue('Maps won:'),
                losses: getStatValue('Maps lost:'),
                avg_kills: getStatValue('Average kills:'),
                avg_deaths: getStatValue('Average deaths:'),
                avg_assists: getStatValue('Average assists:'),
                avg_gpm: getStatValue('Average GPM:'),
                avg_xpm: getStatValue('Average XPM:')
            };

            // Получаем статистику по героям
            const heroesContainer = document.querySelector('.players-single-heroes .items');
            if (heroesContainer) {
                const heroes = Array.from(heroesContainer.querySelectorAll('.item')).map(item => ({
                    name: item.querySelector('.hero-item-col__name')?.textContent?.trim() || '',
                    image: item.querySelector('.hero-item-col__image img')?.src || '',
                    winrate: parseFloat(item.querySelector('.sub-item:nth-child(2) .CircularProgressbar-text')?.textContent?.replace('%', '') || '0'),
                    matches: parseInt(item.querySelector('.sub-item:nth-child(3) .b-title.bt15')?.textContent || '0'),
                    kda: parseFloat(item.querySelector('.sub-item:nth-child(4) .CircularProgressbar-text')?.textContent || '0'),
                    last_game: item.querySelector('.sub-item:nth-child(5) .b-title.bt15')?.textContent?.trim() || ''
                }));
                stats.heroes = heroes;
            }

            return stats;
        });

        console.log('Статистика игрока:', playerStats);
        return playerStats;
    } catch (error) {
        console.error(`Ошибка при парсинге статистики игрока ${playerId}:`, error.message);
        return null;
    }
}

// Основная функция
async function main() {
    let browser;
    let connection;
    
    try {
        console.log('Запуск парсера команд...');
        
        // Подключаемся к базе данных
        connection = await pool.getConnection();
        
        // Запускаем браузер
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        // Создаем новую страницу
        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
        
        // Получаем список команд (тестовый режим - только Team Spirit)
        const teams = await getTeamsList(page, true);
        console.log(`\nНачинаем обработку ${teams.length} команд`);
        
        // Обрабатываем команду
        for (const team of teams) {
            try {
                console.log(`\nОбработка команды ${team.name} (ID: ${team.id})`);
                
                // Получаем детальную информацию о команде
                const teamDetails = await parseTeamDetails(page, team.id, team);
                if (teamDetails) {
                    console.log('\nДетальная информация о команде получена:', teamDetails);

                    // Получаем информацию о составе
                    const rosterData = await parseTeamRoster(page, team.id);
                    if (rosterData) {
                        console.log('\nИнформация о составе получена:', rosterData);

                        // Собираем статистику для каждого игрока
                        for (const roster of [rosterData.main, rosterData.other]) {
                            for (const player of roster) {
                                console.log(`\nПолучение статистики игрока ${player.nickname}`);
                                player.stats = await parsePlayerStats(page, player.player_id);
                                console.log('Статистика игрока:', player.stats);
                                await randomDelay();
                            }
                        }
                        
                        // Сохраняем команду и состав
                        await saveTeamWithRoster(connection, teamDetails, rosterData);
                        console.log('\nВсе данные успешно сохранены в базу данных');
                    }
                }
                await randomDelay();
            } catch (error) {
                console.error(`Ошибка при обработке команды ${team.name}:`, error.message);
                continue;
            }
        }
        
        console.log('\nПарсинг команд завершен');
        
    } catch (error) {
        console.error('Критическая ошибка:', error);
    } finally {
        if (browser) await browser.close();
        if (connection) connection.release();
    }
}

// Запускаем скрипт
main().catch(console.error); 