import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Список User-Agent для ротации
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

class DotabuffParser {
    constructor() {
        this.baseUrl = 'https://www.dotabuff.com'
        this.cacheDir = path.join(path.dirname(__dirname), '../../cache')
        this.currentUserAgentIndex = 0
        
        console.log('Инициализация парсера...')
        console.log('Директория кэша:', this.cacheDir)
        
        // Создаем директорию для кэша если её нет
        if (!fs.existsSync(this.cacheDir)) {
            console.log('Создание директории кэша...')
            try {
                fs.mkdirSync(this.cacheDir, { recursive: true })
                console.log('Директория кэша создана')
            } catch (error) {
                console.error('Ошибка при создании директории кэша:', error)
                // Продолжаем работу без кэша
                this.cacheDir = null
            }
        }
    }

    // Получение следующего User-Agent
    getNextUserAgent() {
        this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % USER_AGENTS.length
        const userAgent = USER_AGENTS[this.currentUserAgentIndex]
        console.log('Использую User-Agent:', userAgent)
        return userAgent
    }

    // Задержка между запросами
    async delay(min = 30000, max = 60000) {
        const ms = Math.floor(Math.random() * (max - min + 1)) + min
        console.log(`Ожидание ${ms}ms перед следующим запросом...`)
        await new Promise(resolve => setTimeout(resolve, ms))
    }

    // Получение HTML страницы с кэшированием
    async fetchPage(url, useCache = true, retryCount = 0) {
        console.log(`\nЗапрос страницы: ${url}`)
        console.log(`Использование кэша: ${useCache}`)
        console.log(`Попытка: ${retryCount + 1}`)

        // Увеличиваем задержку с каждой попыткой
        const baseDelay = 30000 * (retryCount + 1)
        await this.delay(baseDelay, baseDelay * 2)

        let cacheFile = null
        if (this.cacheDir && useCache) {
            const urlHash = Buffer.from(url).toString('base64')
            cacheFile = path.join(this.cacheDir, `${urlHash}.html`)
            
            // Проверяем кэш
            if (fs.existsSync(cacheFile)) {
                const stats = fs.statSync(cacheFile)
                const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)
                
                // При блокировке используем кэш до 72 часов
                const maxCacheAge = retryCount > 0 ? 72 : 24
                
                if (hoursSinceModified < maxCacheAge) {
                    console.log('Загрузка из кэша...')
                    try {
                        const content = fs.readFileSync(cacheFile, 'utf-8')
                        if (content && content.length > 0) {
                            console.log('Данные успешно загружены из кэша')
                            return content
                        }
                    } catch (error) {
                        console.error('Ошибка при чтении кэша:', error)
                    }
                }
            }
        }

        try {
            console.log('Отправка запроса к серверу...')
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.getNextUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    'Referer': 'https://www.dotabuff.com/esports/teams'
                },
                timeout: 60000
            })

            console.log('Получен ответ от сервера:', response.status)

            if (response.status === 200 && cacheFile && useCache) {
                try {
                    fs.writeFileSync(cacheFile, response.data)
                    console.log('Данные сохранены в кэш')
                } catch (error) {
                    console.error('Ошибка при сохранении в кэш:', error)
                }
            }

            return response.data
        } catch (error) {
            console.error('Ошибка при загрузке страницы:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })

            if (error.response?.status === 429) {
                console.log('Получена ошибка 429 (Too Many Requests)')
                
                // Проверяем кэш при ошибке 429
                if (cacheFile && fs.existsSync(cacheFile)) {
                    console.log('Пробуем использовать кэш при ошибке 429...')
                    const content = fs.readFileSync(cacheFile, 'utf-8')
                    if (content && content.length > 0) {
                        console.log('Успешно загружено из кэша')
                        return content
                    }
                }

                if (retryCount < 3) {
                    const nextRetry = retryCount + 1
                    const waitTime = baseDelay * 2
                    console.log(`Ожидание ${waitTime}ms перед попыткой ${nextRetry + 1}/3...`)
                    await this.delay(waitTime, waitTime * 1.5)
                    return this.fetchPage(url, useCache, nextRetry)
                }
            }

            throw error
        }
    }

    // Поиск команды
    async searchTeam(teamName) {
        console.log(`Поиск команды: ${teamName}`)
        const url = `${this.baseUrl}/search?q=${encodeURIComponent(teamName)}&commit=Search`
        const html = await this.fetchPage(url, false) // Не кэшируем результаты поиска
        const $ = cheerio.load(html)

        const teams = []
        $('.search-results-container a').each((i, elem) => {
            const $elem = $(elem)
            const href = $elem.attr('href')
            const text = $elem.text().trim()

            if (href && href.includes('/esports/teams/') && 
                text.toLowerCase().includes(teamName.toLowerCase())) {
                teams.push({
                    id: href.split('/').pop(),
                    name: text
                })
            }
        })

        console.log(`Найдено команд: ${teams.length}`)
        return teams
    }

    // Получение данных команды
    async getTeamData(teamId) {
        console.log(`Получение данных команды: ${teamId}`)
        const url = `${this.baseUrl}/esports/teams/${teamId}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        console.log('\n=== АНАЛИЗ HTML СТРУКТУРЫ ===')
        
        // Логируем основные секции
        console.log('\n--- ОСНОВНЫЕ СЕКЦИИ ---')
        $('section').each((i, section) => {
            const $section = $(section)
            const title = $section.find('header h2').text().trim()
            console.log(`\nСекция ${i + 1}: "${title}"`)
            console.log('HTML:', $section.html().substring(0, 500) + '...')
        })

        // Логируем все таблицы
        console.log('\n--- ТАБЛИЦЫ ---')
        $('table').each((i, table) => {
            const $table = $(table)
            const headers = []
            $table.find('thead th').each((j, th) => {
                headers.push($(th).text().trim())
            })
            console.log(`\nТаблица ${i + 1}:`)
            console.log('Заголовки:', headers.join(' | '))
            console.log('Классы:', $table.attr('class'))
            console.log('Первая строка:', $table.find('tbody tr:first-child').text().trim())
            console.log('HTML первой строки:', $table.find('tbody tr:first-child').html())
        })

        // Логируем содержимое важных элементов
        console.log('\n--- ВАЖНЫЕ ЭЛЕМЕНТЫ ---')
        console.log('\nИгроки:')
        $('.team-overview-players, .team-members-table').each((i, table) => {
            console.log(`\nТаблица игроков ${i + 1}:`)
            console.log('HTML:', $(table).html())
        })

        console.log('\nГерои:')
        $('table:contains("Most Played Heroes")').each((i, table) => {
            console.log(`\nТаблица героев ${i + 1}:`)
            console.log('HTML:', $(table).html())
        })

        // Проверяем на блокировку
        const pageText = $('body').text()
        if (pageText.includes('Please verify you are human') || 
            pageText.includes('Access Denied') ||
            pageText.includes('Please complete the security check') ||
            pageText.includes('Retry later')) {
            throw new Error('Доступ заблокирован')
        }

        // Парсинг основной информации
        const name = $('.header-content-title h1').text()
            .replace('Summary', '')
            .replace('Сводка', '')
            .trim()

        if (!name) {
            console.error('Не удалось найти название команды')
            throw new Error('Не удалось получить данные команды')
        }

        // Парсинг статистики
        const recordText = $('.header-content-secondary').text()
        const recordMatch = recordText.match(/(\d+)-(\d+)/)
        const totalMatches = recordMatch ? parseInt(recordMatch[1]) + parseInt(recordMatch[2]) : 0
        const winRate = recordMatch ? 
            ((parseInt(recordMatch[1]) / (parseInt(recordMatch[1]) + parseInt(recordMatch[2]))) * 100).toFixed(2) + '%' : 
            "0%"

        // Парсинг игроков
        console.log('Начинаю парсинг игроков...')
        const players = []

        // Ищем таблицу игроков
        const $playerTable = $('table.team-overview-players, table.team-members-table')
        console.log('Найдена таблица игроков:', $playerTable.length > 0)

        $playerTable.find('tbody tr').each((i, row) => {
            const $row = $(row)
            console.log(`\nПарсинг строки игрока ${i + 1}:`)
            
            // Получаем все ячейки
            const cells = $row.find('td')
            
            // Парсим имя, ID и URL из первой ячейки
            const $nameCell = $(cells[0])
            const $playerLink = $nameCell.find('a').first()
            const playerUrl = $playerLink.attr('href')
            
            // Извлекаем ID и имя из URL
            const urlParts = playerUrl?.split('/').pop()?.split('-') || []
            const playerId = urlParts[0]
            const playerName = $playerLink.text().trim() || urlParts.slice(1).join(' ')
            
            if (playerUrl && playerId) {
                const player = {
                    id: playerId,
                    name: playerName,
                    url: playerUrl,
                    matches: parseInt($nameCell.next().text().trim()) || 0,
                    heroes: parseInt(cells.eq(2).text().trim()) || 0,
                    kda: parseFloat(cells.eq(3).text().trim()) || 0,
                    lastHits: parseFloat(cells.eq(4).text().trim()) || 0,
                    denies: parseFloat(cells.eq(5).text().trim()) || 0,
                    gpm: parseInt(cells.eq(6).text().trim()) || 0,
                    xpm: parseInt(cells.eq(7).text().trim()) || 0
                }
                
                console.log('Данные игрока:', player)
                players.push(player)
            }
        })

        console.log(`\nВсего найдено игроков: ${players.length}`)

        // Парсинг героев
        console.log('\nНачинаю парсинг героев...')
        const heroes = []
        $('table:contains("Most Played Heroes") tbody tr').each((i, row) => {
            const $row = $(row)
            const $cells = $row.find('td')
            
            const $heroLink = $cells.eq(0).find('a')
            const heroName = $heroLink.text().trim()
            const matches = parseInt($cells.eq(1).text().trim()) || 0
            const winRate = $cells.eq(2).text().trim()
            
            if (heroName && !heroName.includes('Hero')) {
                const hero = {
                    name: heroName,
                    matches: matches,
                    winRate: winRate
                }
                console.log('Данные героя:', hero)
                heroes.push(hero)
            }
        })
        console.log(`\nВсего найдено героев: ${heroes.length}`)

        // Парсинг матчей
        const recentMatches = []
        $('.recent-esports-matches tbody tr').each((i, row) => {
            const $row = $(row)
            const $leagueCell = $row.find('td:first-child')
            const $leagueLink = $leagueCell.find('a')
            const $opponentCell = $row.find('td:nth-child(8)')
            const $opponentLink = $opponentCell.find('a')
            
            const match = {
                league: {
                    name: $leagueLink.find('.league-link').text().trim() || $leagueLink.text().trim(),
                    url: $leagueLink.attr('href')
                },
                type: $row.find('td:nth-child(2)').text().trim(),
                region: $row.find('td:nth-child(3)').text().trim(),
                status: $row.find('td:nth-child(4)').text().trim(),
                date: $row.find('td:nth-child(5)').text().trim(),
                result: $row.find('td:nth-child(6)').text().trim(),
                winner: $row.find('td:nth-child(7)').text().trim(),
                opponent: {
                    name: $opponentLink.find('.team-link').text().trim() || $opponentLink.text().trim(),
                    url: $opponentLink.attr('href')
                }
            }
            
            recentMatches.push(match)
        })

        // Парсинг недавних лиг
        const recentLeagues = []
        $('.recent-esports-leagues tbody tr').each((i, row) => {
            const $row = $(row)
            const $leagueCell = $row.find('td:first-child')
            const $leagueLink = $leagueCell.find('a')
            const leagueName = $leagueLink.find('.league-link').text().trim() || $leagueLink.text().trim()
            const leagueUrl = $leagueLink.attr('href')
            
            if (leagueUrl) {
                const league = {
                    name: leagueName,
                    url: leagueUrl,
                    date: $row.find('td:nth-child(2)').text().trim(),
                    series: {
                        won: parseInt($row.find('td:nth-child(3)').text().trim()) || 0,
                        tied: parseInt($row.find('td:nth-child(4)').text().trim()) || 0,
                        lost: parseInt($row.find('td:nth-child(5)').text().trim()) || 0
                    }
                }
                recentLeagues.push(league)
            }
        })

        console.log(`Найдено: ${players.length} игроков, ${heroes.length} героев, ${recentMatches.length} матчей`)

        return {
            name,
            summary: {
                allTime: {
                    matches: totalMatches,
                    winRate,
                    series: {
                        wins: parseInt(recordMatch?.[1]) || 0,
                        losses: parseInt(recordMatch?.[2]) || 0
                    }
                },
                factions: {
                    radiant: {
                        matches: parseInt($('.faction-radiant .matches').text()) || 0,
                        winRate: $('.faction-radiant .win-rate').text().trim() || "0%"
                    },
                    dire: {
                        matches: parseInt($('.faction-dire .matches').text()) || 0,
                        winRate: $('.faction-dire .win-rate').text().trim() || "0%"
                    }
                }
            },
            players,
            matches: recentMatches,
            heroes,
            recentLeagues
        }
    }

    // Получение списка всех команд
    async getAllTeams() {
        console.log('Получение списка всех команд...')
        const url = `${this.baseUrl}/esports/teams`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        const teams = []
        
        // Парсим таблицу с командами
        $('table.team-rankings tbody tr').each((i, row) => {
            const $row = $(row)
            const $teamLink = $row.find('td:first-child a')
            
            if ($teamLink.length) {
                const href = $teamLink.attr('href')
                const name = $teamLink.text().trim()
                const id = href.split('/').pop()
                
                // Получаем дополнительные данные из строки
                const $cells = $row.find('td')
                const team = {
                    id,
                    name,
                    url: `${this.baseUrl}${href}`,
                    matches: $cells.eq(2).text().trim(),
                    winRate: $cells.eq(3).text().trim(),
                    kda: $cells.eq(4).text().trim(),
                    gpm: $cells.eq(5).text().trim(),
                    xpm: $cells.eq(6).text().trim(),
                    duration: $cells.eq(7).text().trim()
                }
                
                teams.push(team)
            }
        })

        // Также проверяем секцию "Most Matches" для дополнительных команд
        $('section:contains("Most Matches") table tbody tr').each((i, row) => {
            const $row = $(row)
            const $teamLink = $row.find('td:first-child a')
            
            if ($teamLink.length) {
                const href = $teamLink.attr('href')
                const name = $teamLink.text().trim()
                const id = href.split('/').pop()
                
                // Проверяем, нет ли уже такой команды
                if (!teams.some(t => t.id === id)) {
                    const $cells = $row.find('td')
                    const team = {
                        id,
                        name,
                        url: `${this.baseUrl}${href}`,
                        matches: $cells.eq(1).text().trim(),
                        winRate: $cells.eq(2).text().trim()
                    }
                    
                    teams.push(team)
                }
            }
        })

        // И секцию "Highest Win Rate"
        $('section:contains("Highest Win Rate") table tbody tr').each((i, row) => {
            const $row = $(row)
            const $teamLink = $row.find('td:first-child a')
            
            if ($teamLink.length) {
                const href = $teamLink.attr('href')
                const name = $teamLink.text().trim()
                const id = href.split('/').pop()
                
                // Проверяем, нет ли уже такой команды
                if (!teams.some(t => t.id === id)) {
                    const $cells = $row.find('td')
                    const team = {
                        id,
                        name,
                        url: `${this.baseUrl}${href}`,
                        matches: $cells.eq(1).text().trim(),
                        winRate: $cells.eq(2).text().trim()
                    }
                    
                    teams.push(team)
                }
            }
        })

        console.log(`Найдено ${teams.length} команд`)
        
        // Сохраняем список команд в кэш
        if (this.cacheDir) {
            const cacheFile = path.join(this.cacheDir, 'teams_list.json')
            try {
                fs.writeFileSync(cacheFile, JSON.stringify(teams, null, 2))
                console.log('Список команд сохранен в кэш')
            } catch (error) {
                console.error('Ошибка при сохранении списка команд в кэш:', error)
            }
        }

        return teams
    }

    // Загрузка списка команд из кэша
    loadTeamsFromCache() {
        if (!this.cacheDir) return null

        const cacheFile = path.join(this.cacheDir, 'teams_list.json')
        if (fs.existsSync(cacheFile)) {
            try {
                const stats = fs.statSync(cacheFile)
                const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)
                
                // Используем кэш если он не старше 24 часов
                if (hoursSinceModified < 24) {
                    console.log('Загрузка списка команд из кэша...')
                    const content = fs.readFileSync(cacheFile, 'utf-8')
                    const teams = JSON.parse(content)
                    console.log(`Загружено ${teams.length} команд из кэша`)
                    return teams
                }
            } catch (error) {
                console.error('Ошибка при загрузке списка команд из кэша:', error)
            }
        }
        return null
    }

    // Получение истории составов команды
    async getTeamRosterHistory(teamId) {
        const url = `${this.baseUrl}/esports/teams/${teamId}/players`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        
        const rosterHistory = []
        $('.team-roster-history tbody tr').each((i, row) => {
            const $row = $(row)
            const period = $row.find('td:nth-child(1)').text().trim()
            const players = []
            
            $row.find('td:nth-child(2) a').each((j, playerLink) => {
                const $link = $(playerLink)
                players.push({
                    name: $link.text().trim(),
                    url: $link.attr('href')
                })
            })
            
            if (period && players.length > 0) {
                rosterHistory.push({ period, players })
            }
        })
        
        return rosterHistory
    }

    // Получение статистики против других команд
    async getTeamHeadToHead(teamId) {
        const url = `${this.baseUrl}/esports/teams/${teamId}/matches`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        
        const headToHead = []
        $('.team-matches-summary tbody tr').each((i, row) => {
            const $row = $(row)
            const $teamLink = $row.find('td:first-child a')
            
            const opponent = {
                name: $teamLink.text().trim(),
                url: $teamLink.attr('href'),
                matches: parseInt($row.find('td:nth-child(2)').text()) || 0,
                winRate: $row.find('td:nth-child(3)').text().trim(),
                lastPlayed: $row.find('td:nth-child(4)').text().trim()
            }
            
            if (opponent.name && opponent.matches > 0) {
                headToHead.push(opponent)
            }
        })
        
        return headToHead
    }

    // Получение детальной статистики драфтов
    async getTeamDraftStats(teamId) {
        const url = `${this.baseUrl}/esports/teams/${teamId}/drafts`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        
        const draftStats = {
            mostPicked: [],
            mostBanned: [],
            bestWith: [],
            bestAgainst: []
        }

        // Парсим самых популярных героев
        $('.most-picked tbody tr').each((i, row) => {
            const $row = $(row)
            const hero = {
                name: $row.find('td:first-child a').text().trim(),
                matches: parseInt($row.find('td:nth-child(2)').text()) || 0,
                winRate: $row.find('td:nth-child(3)').text().trim(),
                firstPick: parseInt($row.find('td:nth-child(4)').text()) || 0,
                firstWin: $row.find('td:nth-child(5)').text().trim()
            }
            if (hero.name) draftStats.mostPicked.push(hero)
        })

        // Парсим самых банимых героев
        $('.most-banned tbody tr').each((i, row) => {
            const $row = $(row)
            const hero = {
                name: $row.find('td:first-child a').text().trim(),
                bans: parseInt($row.find('td:nth-child(2)').text()) || 0,
                banRate: $row.find('td:nth-child(3)').text().trim(),
                firstBan: parseInt($row.find('td:nth-child(4)').text()) || 0,
                winRate: $row.find('td:nth-child(5)').text().trim()
            }
            if (hero.name) draftStats.mostBanned.push(hero)
        })

        // Парсим лучшие сочетания героев
        $('.best-with tbody tr').each((i, row) => {
            const $row = $(row)
            const combo = {
                heroes: [
                    $row.find('td:nth-child(1) a').text().trim(),
                    $row.find('td:nth-child(2) a').text().trim()
                ],
                matches: parseInt($row.find('td:nth-child(3)').text()) || 0,
                winRate: $row.find('td:nth-child(4)').text().trim()
            }
            if (combo.heroes[0] && combo.heroes[1]) draftStats.bestWith.push(combo)
        })

        return draftStats
    }

    // Получение детальной статистики игрока в команде
    async getPlayerTeamStats(teamId, playerId) {
        const url = `${this.baseUrl}/esports/teams/${teamId}/players/${playerId}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)
        
        const stats = {
            general: {
                matches: parseInt($('.header-content-secondary').text().match(/\d+/)?.[0]) || 0,
                winRate: $('.header-content-secondary').text().match(/(\d+\.\d+)%/)?.[1] || "0",
                duration: $('.average-duration').text().trim()
            },
            heroes: [],
            lanes: {
                safelane: $('.lane-presence-safe').text().trim(),
                midlane: $('.lane-presence-mid').text().trim(),
                offlane: $('.lane-presence-off').text().trim(),
                jungle: $('.lane-presence-jungle').text().trim()
            },
            warding: {
                observersPurchased: parseInt($('.stat-observer-wards').text()) || 0,
                sentriesPurchased: parseInt($('.stat-sentry-wards').text()) || 0,
                wardsDestroyed: parseInt($('.stat-wards-destroyed').text()) || 0
            },
            buybacks: parseInt($('.stat-buybacks').text()) || 0
        }

        // Парсим статистику по героям
        $('.heroes-overview tbody tr').each((i, row) => {
            const $row = $(row)
            const hero = {
                name: $row.find('td:first-child a').text().trim(),
                matches: parseInt($row.find('td:nth-child(2)').text()) || 0,
                winRate: $row.find('td:nth-child(3)').text().trim(),
                kda: parseFloat($row.find('td:nth-child(4)').text()) || 0,
                gpm: parseInt($row.find('td:nth-child(5)').text()) || 0,
                xpm: parseInt($row.find('td:nth-child(6)').text()) || 0
            }
            if (hero.name) stats.heroes.push(hero)
        })

        return stats
    }

    // Получение детальной информации об игроке
    async getPlayerDetails(playerId) {
        const url = `${this.baseUrl}/esports/players/${playerId}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        // Основная информация
        const name = $('.header-content-title h1').text().trim()
        const currentTeam = $('.header-content-secondary').first().text().trim()
        
        // Роли
        const roles = {
            primary: $('.roles-lanes .primary').text().trim(),
            lanes: $('.roles-lanes .lanes').text().trim(),
            coreBreakdown: {},
            supportBreakdown: {}
        }

        // Парсим Core/Support распределение
        $('.roles-breakdown').each((i, elem) => {
            const $breakdown = $(elem)
            const isCore = $breakdown.text().includes('Core Breakdown')
            const target = isCore ? roles.coreBreakdown : roles.supportBreakdown
            
            $breakdown.find('.lane-presence').each((j, lane) => {
                const $lane = $(lane)
                const name = $lane.find('.name').text().trim()
                const percentage = $lane.find('.percentage').text().trim()
                target[name] = percentage
            })
        })

        // Статистика по героям
        const heroes = []
        $('section:contains("Most Played Heroes") table tbody tr').each((i, row) => {
            const $row = $(row)
            const $cells = $row.find('td')
            
            const hero = {
                name: $cells.eq(0).find('a').text().trim(),
                matches: parseInt($cells.eq(1).text()) || 0,
                winRate: $cells.eq(2).text().trim(),
                kda: parseFloat($cells.eq(3).text()) || 0,
                lastHits: parseFloat($cells.eq(4).text()) || 0,
                denies: parseFloat($cells.eq(5).text()) || 0,
                gpm: parseInt($cells.eq(6).text()) || 0,
                xpm: parseInt($cells.eq(7).text()) || 0
            }
            
            if (hero.name) heroes.push(hero)
        })

        // Общая статистика
        const summary = {
            allTime: {
                matches: 0,
                winRate: '0%',
                kda: 0
            },
            recent: {
                month: { matches: 0, winRate: '0%', kda: 0 },
                threeMonths: { matches: 0, winRate: '0%', kda: 0 },
                year: { matches: 0, winRate: '0%', kda: 0 }
            }
        }

        // Парсим таблицу статистики
        $('table:contains("Time Period") tbody tr').each((i, row) => {
            const $cells = $(row).find('td')
            const period = $cells.eq(0).text().trim()
            const matches = parseInt($cells.eq(1).text()) || 0
            const winRate = $cells.eq(2).text().trim()
            const kda = parseFloat($cells.eq(3).text()) || 0

            switch(period) {
                case 'All Time':
                    summary.allTime = { matches, winRate, kda }
                    break
                case '1 Month':
                    summary.recent.month = { matches, winRate, kda }
                    break
                case '3 Months':
                    summary.recent.threeMonths = { matches, winRate, kda }
                    break
                case '12 Months':
                    summary.recent.year = { matches, winRate, kda }
                    break
            }
        })

        // История команд
        const teams = []
        $('.recent-teams tbody tr').each((i, row) => {
            const $row = $(row)
            const $teamLink = $row.find('td:first-child a')
            
            const team = {
                name: $teamLink.text().trim(),
                url: $teamLink.attr('href'),
                period: $row.find('td:nth-child(2)').text().trim(),
                matches: $row.find('td:nth-child(3)').text().trim(),
                kda: parseFloat($row.find('td:nth-child(4)').text()) || 0
            }
            
            if (team.name) teams.push(team)
        })

        // Недавние турниры
        const tournaments = []
        $('.recent-leagues tbody tr').each((i, row) => {
            const $row = $(row)
            const $leagueLink = $row.find('td:first-child a')
            
            const tournament = {
                name: $leagueLink.text().trim(),
                url: $leagueLink.attr('href'),
                date: $row.find('td:nth-child(2)').text().trim(),
                matches: $row.find('td:nth-child(3)').text().trim()
            }
            
            if (tournament.name) tournaments.push(tournament)
        })

        return {
            name,
            currentTeam,
            roles,
            summary,
            heroes,
            teams,
            tournaments
        }
    }

    async getHeroStats(heroName) {
        console.log(`Получение статистики героя: ${heroName}`)
        const url = `${this.baseUrl}/heroes/${heroName.toLowerCase().replace(/ /g, '-')}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        // Проверка на блокировку
        if ($('body').text().includes('Please verify you are human')) {
            throw new Error('Доступ заблокирован - требуется верификация')
        }

        const stats = {
            name: $('.header-content-title h1').text().trim(),
            winRate: $('.header-content-secondary .won').text().trim(),
            pickRate: $('.header-content-secondary .pick').text().trim(),
            roles: [],
            counters: [],
            bestVersus: [],
            recentMatches: []
        }

        // Парсинг ролей
        $('.header-content-secondary .role').each((i, el) => {
            stats.roles.push($(el).text().trim())
        })

        // Парсинг контр-пиков
        $('table:contains("Worst Versus") tbody tr').each((i, el) => {
            if (i < 5) { // Берем только топ 5
                const hero = $(el).find('td a').text().trim()
                const winRate = $(el).find('td:last').text().trim()
                stats.counters.push({ hero, winRate })
            }
        })

        // Парсинг лучших против
        $('table:contains("Best Versus") tbody tr').each((i, el) => {
            if (i < 5) { // Берем только топ 5
                const hero = $(el).find('td a').text().trim()
                const winRate = $(el).find('td:last').text().trim()
                stats.bestVersus.push({ hero, winRate })
            }
        })

        // Последние матчи
        $('.recent-matches tbody tr').each((i, el) => {
            if (i < 10) { // Последние 10 матчей
                const match = {
                    result: $(el).find('.result').text().trim(),
                    kda: $(el).find('.kda-record').text().trim(),
                    when: $(el).find('time').attr('datetime')
                }
                stats.recentMatches.push(match)
            }
        })

        return stats
    }

    async getTeamDetails(teamId) {
        console.log(`Получение информации о команде: ${teamId}`)
        const url = `${this.baseUrl}/esports/teams/${teamId}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        // Проверка на блокировку
        if ($('body').text().includes('Please verify you are human')) {
            throw new Error('Доступ заблокирован - требуется верификация')
        }

        const teamData = {
            name: $('.header-content-title h1').text().trim(),
            winRate: $('.header-content-secondary .won').text().trim(),
            totalMatches: $('.header-content-secondary .matches').text().trim(),
            roster: [],
            recentMatches: [],
            mostPlayedHeroes: [],
            achievements: []
        }

        // Парсинг текущего состава
        $('.team-overview-players tbody tr').each((i, el) => {
            const player = {
                name: $(el).find('.player a').text().trim(),
                position: $(el).find('.position').text().trim(),
                joinDate: $(el).find('time').attr('datetime')
            }
            teamData.roster.push(player)
        })

        // Последние матчи
        $('.recent-matches tbody tr').each((i, el) => {
            if (i < 10) {
                const match = {
                    opponent: $(el).find('.opposing-team-name').text().trim(),
                    result: $(el).find('.result').text().trim(),
                    score: $(el).find('.score').text().trim(),
                    date: $(el).find('time').attr('datetime'),
                    tournament: $(el).find('.league').text().trim()
                }
                teamData.recentMatches.push(match)
            }
        })

        // Самые играемые герои
        $('table:contains("Most Played Heroes") tbody tr').each((i, el) => {
            if (i < 5) {
                const hero = {
                    name: $(el).find('.hero-link').text().trim(),
                    matches: $(el).find('.matches').text().trim(),
                    winRate: $(el).find('.winrate').text().trim()
                }
                teamData.mostPlayedHeroes.push(hero)
            }
        })

        // Достижения
        $('.team-achievements li').each((i, el) => {
            const achievement = {
                tournament: $(el).find('.tournament').text().trim(),
                place: $(el).find('.place').text().trim(),
                date: $(el).find('time').attr('datetime')
            }
            teamData.achievements.push(achievement)
        })

        return teamData
    }

    async getMatchDetails(matchId) {
        console.log(`Получение информации о матче: ${matchId}`)
        const url = `${this.baseUrl}/matches/${matchId}`
        const html = await this.fetchPage(url)
        const $ = cheerio.load(html)

        // Проверка на блокировку
        if ($('body').text().includes('Please verify you are human')) {
            throw new Error('Доступ заблокирован - требуется верификация')
        }

        const matchData = {
            id: matchId,
            result: $('.match-result').text().trim(),
            duration: $('.duration').text().trim(),
            gameMode: $('.game-mode').text().trim(),
            region: $('.region').text().trim(),
            date: $('time').attr('datetime'),
            teams: {
                radiant: {
                    name: $('.team-radiant .team-name').text().trim(),
                    score: $('.team-radiant .score').text().trim(),
                    players: []
                },
                dire: {
                    name: $('.team-dire .team-name').text().trim(),
                    score: $('.team-dire .score').text().trim(),
                    players: []
                }
            },
            picks_bans: {
                radiant: { picks: [], bans: [] },
                dire: { picks: [], bans: [] }
            }
        }

        // Парсинг игроков
        $('.radiant-team tbody tr').each((i, el) => {
            const player = {
                name: $(el).find('.player-name').text().trim(),
                hero: $(el).find('.hero-link').text().trim(),
                level: $(el).find('.level').text().trim(),
                kda: $(el).find('.kda-record').text().trim(),
                items: [],
                gpm: $(el).find('.gpm').text().trim(),
                xpm: $(el).find('.xpm').text().trim()
            }
            
            // Парсинг предметов
            $(el).find('.item').each((j, item) => {
                const itemName = $(item).attr('title')
                if (itemName) player.items.push(itemName)
            })
            
            matchData.teams.radiant.players.push(player)
        })

        $('.dire-team tbody tr').each((i, el) => {
            const player = {
                name: $(el).find('.player-name').text().trim(),
                hero: $(el).find('.hero-link').text().trim(),
                level: $(el).find('.level').text().trim(),
                kda: $(el).find('.kda-record').text().trim(),
                items: [],
                gpm: $(el).find('.gpm').text().trim(),
                xpm: $(el).find('.xpm').text().trim()
            }
            
            // Парсинг предметов
            $(el).find('.item').each((j, item) => {
                const itemName = $(item).attr('title')
                if (itemName) player.items.push(itemName)
            })
            
            matchData.teams.dire.players.push(player)
        })

        // Парсинг пиков и банов
        $('.picks-bans .pick').each((i, el) => {
            const hero = $(el).attr('title')
            const team = $(el).closest('.radiant-team').length ? 'radiant' : 'dire'
            matchData.picks_bans[team].picks.push(hero)
        })

        $('.picks-bans .ban').each((i, el) => {
            const hero = $(el).attr('title')
            const team = $(el).closest('.radiant-team').length ? 'radiant' : 'dire'
            matchData.picks_bans[team].bans.push(hero)
        })

        return matchData
    }
}

export const dotabuffParser = new DotabuffParser() 