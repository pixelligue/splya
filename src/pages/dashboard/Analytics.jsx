import { useState, useEffect } from 'react'
import { IoTrophy, IoStatsChart, IoTime, IoTrendingUp, IoSearch } from 'react-icons/io5'
import { Card, Row, Col, Statistic, Tag, Empty, Collapse, Button, Input, Modal } from 'antd'
import { Line } from '@ant-design/charts'
import { pandaScoreService } from '../../services/pandaScoreService'
import { pushrApiService } from '../../services/pushrApiService'
import { heroesService } from '../../services/heroesService'
import { openDotaService } from '../../services/openDotaService'

// Ключи для localStorage
const CACHE_KEYS = {
  matches: 'analytics_matches',
  teams: 'analytics_teams',
  lastUpdate: 'analytics_last_update'
}

// Время жизни кэша - 1 час
const CACHE_TTL = 60 * 60 * 1000

const HEROES_CACHE_KEY = 'heroes_data'

const Analytics = () => {
  const [matches, setMatches] = useState([])
  const [teamsData, setTeamsData] = useState({})
  const [heroes, setHeroes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [heroNames, setHeroNames] = useState({})
  const [visibleMatches, setVisibleMatches] = useState(2)

  // Новые состояния для OpenDota
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [loadingPlayer, setLoadingPlayer] = useState(false)

  const heroIdMapping = {
    '1': 'antimage', // Anti-Mage
    '2': 'axe', // Axe
    '3': 'bane', // Bane
    '4': 'bloodseeker', // Bloodseeker
    '5': 'crystal_maiden', // Crystal Maiden
    '6': 'drow_ranger', // Drow Ranger
    '7': 'earthshaker', // Earthshaker
    '8': 'juggernaut', // Juggernaut
    '9': 'mirana', // Mirana
    '10': 'morphling', // Morphling
    '11': 'nevermore', // Shadow Fiend
    '12': 'phantom_lancer', // Phantom Lancer
    '13': 'puck', // Puck
    '14': 'pudge', // Pudge
    '15': 'razor', // Razor
    '16': 'sand_king', // Sand King
    '17': 'storm_spirit', // Storm Spirit
    '18': 'sven', // Sven
    '19': 'tiny', // Tiny
    '20': 'vengefulspirit', // Vengeful Spirit
    '21': 'windrunner', // Windranger
    '22': 'zuus', // Zeus
    '23': 'kunkka', // Kunkka
    '25': 'lina', // Lina
    '26': 'lion', // Lion
    '27': 'shadow_shaman', // Shadow Shaman
    '28': 'slardar', // Slardar
    '29': 'tidehunter', // Tidehunter
    '30': 'witch_doctor', // Witch Doctor
    '31': 'lich', // Lich
    '32': 'riki', // Riki
    '33': 'enigma', // Enigma
    '34': 'tinker', // Tinker
    '35': 'sniper', // Sniper
    '36': 'necrolyte', // Necrophos
    '37': 'warlock', // Warlock
    '38': 'beastmaster', // Beastmaster
    '39': 'queenofpain', // Queen of Pain
    '40': 'venomancer', // Venomancer
    '41': 'faceless_void', // Faceless Void
    '42': 'skeleton_king', // Wraith King
    '43': 'death_prophet', // Death Prophet
    '44': 'phantom_assassin', // Phantom Assassin
    '45': 'pugna', // Pugna
    '46': 'templar_assassin', // Templar Assassin
    '47': 'viper', // Viper
    '48': 'luna', // Luna
    '49': 'dragon_knight', // Dragon Knight
    '50': 'dazzle', // Dazzle
    '51': 'rattletrap', // Clockwerk
    '52': 'leshrac', // Leshrac
    '53': 'furion', // Nature's Prophet
    '54': 'life_stealer', // Lifestealer
    '55': 'dark_seer', // Dark Seer
    '56': 'clinkz', // Clinkz
    '57': 'omniknight', // Omniknight
    '58': 'enchantress', // Enchantress
    '59': 'huskar', // Huskar
    '60': 'night_stalker', // Night Stalker
    '61': 'broodmother', // Broodmother
    '62': 'bounty_hunter', // Bounty Hunter
    '63': 'weaver', // Weaver
    '64': 'jakiro', // Jakiro
    '65': 'batrider', // Batrider
    '66': 'chen', // Chen
    '67': 'spectre', // Spectre
    '68': 'ancient_apparition', // Ancient Apparition
    '69': 'doom_bringer', // Doom
    '70': 'ursa', // Ursa
    '71': 'spirit_breaker', // Spirit Breaker
    '72': 'gyrocopter', // Gyrocopter
    '73': 'alchemist', // Alchemist
    '74': 'invoker', // Invoker
    '75': 'silencer', // Silencer
    '76': 'obsidian_destroyer', // Outworld Destroyer
    '77': 'lycan', // Lycan
    '78': 'brewmaster', // Brewmaster
    '79': 'shadow_demon', // Shadow Demon
    '80': 'lone_druid', // Lone Druid
    '81': 'chaos_knight', // Chaos Knight
    '82': 'meepo', // Meepo
    '83': 'treant', // Treant Protector
    '84': 'ogre_magi', // Ogre Magi
    '85': 'undying', // Undying
    '86': 'rubick', // Rubick
    '87': 'disruptor', // Disruptor
    '88': 'nyx_assassin', // Nyx Assassin
    '89': 'naga_siren', // Naga Siren
    '90': 'keeper_of_the_light', // Keeper of the Light
    '91': 'wisp', // Io
    '92': 'visage', // Visage
    '93': 'slark', // Slark
    '94': 'medusa', // Medusa
    '95': 'troll_warlord', // Troll Warlord
    '96': 'centaur', // Centaur Warrunner
    '97': 'magnataur', // Magnus
    '98': 'shredder', // Timbersaw
    '99': 'bristleback', // Bristleback
    '100': 'tusk', // Tusk
    '101': 'skywrath_mage', // Skywrath Mage
    '102': 'abaddon', // Abaddon
    '103': 'elder_titan', // Elder Titan
    '104': 'legion_commander', // Legion Commander
    '105': 'techies', // Techies
    '106': 'ember_spirit', // Ember Spirit
    '107': 'earth_spirit', // Earth Spirit
    '108': 'abyssal_underlord', // Underlord
    '109': 'terrorblade', // Terrorblade
    '110': 'phoenix', // Phoenix
    '111': 'oracle', // Oracle
    '112': 'winter_wyvern', // Winter Wyvern
    '113': 'arc_warden', // Arc Warden
    '114': 'monkey_king', // Monkey King
    '115': 'phoenix', // Phoenix (ID 110)
    '116': 'oracle', // Oracle (ID 111)
    '119': 'dark_willow', // Dark Willow
    '120': 'pangolier', // Pangolier
    '121': 'grimstroke', // Grimstroke
    '123': 'hoodwink', // Hoodwink
    '126': 'void_spirit', // Void Spirit
    '128': 'snapfire', // Snapfire
    '129': 'mars', // Mars
    '130': 'primal_beast', // Primal Beast (ID 137)
    '131': 'ringmaster', // Ringmaster
    '135': 'dawnbreaker', // Dawnbreaker
    '136': 'marci', // Marci
    '137': 'primal_beast', // Primal Beast
    '138': 'muerta', // Muerta
    '145': 'kez' // Kez
  }

  // Проверка актуальности кэша
  const isCacheValid = () => {
    const lastUpdateTime = localStorage.getItem(CACHE_KEYS.lastUpdate)
    if (!lastUpdateTime) return false
    
    const timeSinceLastUpdate = Date.now() - parseInt(lastUpdateTime)
    return timeSinceLastUpdate < CACHE_TTL
  }

  // Сохранение данных в кэш
  const saveToCache = (matches, teamsData, heroes) => {
    localStorage.setItem(CACHE_KEYS.matches, JSON.stringify(matches))
    localStorage.setItem(CACHE_KEYS.teams, JSON.stringify(teamsData))
    localStorage.setItem('heroes_cache', JSON.stringify(heroes))
    localStorage.setItem(CACHE_KEYS.lastUpdate, Date.now().toString())
    setLastUpdate(new Date())
  }

  // Загрузка данных из кэша
  const loadFromCache = () => {
    try {
      const cachedMatches = JSON.parse(localStorage.getItem(CACHE_KEYS.matches))
      const cachedTeams = JSON.parse(localStorage.getItem(CACHE_KEYS.teams))
      const cachedHeroes = JSON.parse(localStorage.getItem('heroes_cache'))
      const lastUpdateTime = localStorage.getItem(CACHE_KEYS.lastUpdate)

      if (cachedMatches && cachedTeams && cachedHeroes && lastUpdateTime) {
        setMatches(cachedMatches)
        setTeamsData(cachedTeams)
        setHeroes(cachedHeroes)
        setLastUpdate(new Date(parseInt(lastUpdateTime)))
        return true
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из кэша:', error)
    }
    return false
  }

  // Функция для загрузки героев
  const loadHeroes = async () => {
    try {
      console.log('Начинаем загрузку героев...')
      const heroesData = await heroesService.getHeroesForAnalytics()
      console.log('Загруженные герои из Firebase:', heroesData)
      
      // Преобразуем данные в объект для быстрого доступа по ID
      const heroesMap = {}
      Object.entries(heroesData).forEach(([key, hero]) => {
        console.log('Обработка героя:', {
          key,
          hero_id: hero.hero_id,
          title: hero.title?.rendered,
          slug: hero.slug
        })
        
        if (hero.hero_id) {
          heroesMap[hero.hero_id] = hero
        }
      })
      
      console.log('Итоговая карта героев:', {
        totalHeroes: Object.keys(heroesMap).length,
        sample: heroesMap[Object.keys(heroesMap)[0]]
      })
      
      setHeroes(heroesMap)
    } catch (error) {
      console.error('Ошибка при загрузке героев:', error)
    }
  }

  // Загрузка актуальных матчей и данных команд
  const fetchData = async (forceFetch = false) => {
    try {
      setLoading(true)
      setError(null)

      // Проверяем кэш, если не требуется принудительное обновление
      if (!forceFetch && isCacheValid() && loadFromCache()) {
        setLoading(false)
        return
      }

      // Загружаем героев
      await loadHeroes()
      
      // Получаем матчи из PandaScore
      const matchesData = await pandaScoreService.getUpcomingMatches(50, true)
      setMatches(matchesData)

      // Получаем данные команд из Pushr API
      const teamsInfo = {}
      for (const match of matchesData) {
        for (const team of match.teams) {
          if (!teamsInfo[team.name]) {
            try {
              const teamId = await pushrApiService.teams.getIdByPandascoreName(team.name)
              console.log('Найден ID команды:', team.name, teamId)
              
              const teamData = await pushrApiService.teams.getById(teamId)
              console.log('Данные команды:', team.name, teamData)

              // Получаем данные игроков
              if (teamData.team_roster) {
                const rosterLength = parseInt(teamData.team_roster)
                for (let i = 0; i < rosterLength; i++) {
                  const playerId = teamData[`team_roster_${i}_player`]
                  if (playerId) {
                    const playerData = await pushrApiService.players.getById(playerId)
                    teamData[`team_roster_${i}_player_info`] = playerData
                  }
                }
              }
              
              teamsInfo[team.name] = teamData
            } catch (error) {
              console.error(`Ошибка при получении данных команды ${team.name}:`, error)
            }
          }
        }
      }
      setTeamsData(teamsInfo)

      // Сохраняем данные в кэш
      saveToCache(matchesData, teamsInfo, heroes)
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error)
      setError('Не удалось загрузить данные матчей')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка данных
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // Пробуем загрузить из кэша
        const hasCachedData = loadFromCache()
        
        if (!hasCachedData) {
          // Если нет в кэше, загружаем с сервера
          await Promise.all([
            loadHeroes(),
            fetchData(true)
          ])
        }
      } catch (error) {
        console.error('Ошибка при инициализации:', error)
        setError('Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadMore = () => {
    setVisibleMatches(prev => prev + 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Empty
          description={
            <span className="text-zinc-400">
              Нет предстоящих матчей для анализа
            </span>
          }
        />
      </div>
    )
  }

  const translateRole = (role) => {
    const roles = {
      'Carry': 'Керри',
      'Mid': 'Мидер',
      'Offlaner': 'Хард',
      'Soft Support': 'Саппорт',
      'Hard Support': 'Фулл-Саппорт'
    }
    return roles[role] || role
  }

  const getHeroName = (heroId) => {
    try {
      if (!heroId) {
        console.warn('getHeroName вызван с пустым ID');
        return 'Неизвестный герой';
      }

      console.log('getHeroName вызван с ID:', heroId);
      
      // Преобразуем ID в строку для корректного поиска в маппинге
      const stringId = String(heroId);
      
      // Сначала проверяем маппинг ID
      const mappedSlug = heroIdMapping[stringId];
      console.log('Маппинг ID:', { original: heroId, mapped: mappedSlug });
      
      if (!mappedSlug) {
        console.warn(`Маппинг не найден для героя с ID ${heroId}`);
        return `Герой ${heroId}`;
      }

      // Ищем героя в загруженных данных по slug
      const hero = heroes[mappedSlug];
      console.log('Найденный герой:', hero);
      
      if (hero && hero.name) {
        // Используем имя героя из данных
        console.log('Возвращаем имя героя:', hero.name);
        return hero.name;
      }
      
      // Если героя нет в данных, возвращаем slug с заглавной буквы
      const prettyName = mappedSlug
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log('Возвращаем форматированный slug:', prettyName);
      return prettyName;
    } catch (error) {
      console.error('Ошибка при получении имени героя:', error);
      return `Герой ${heroId}`;
    }
  };

  const HeroStats = ({ stat }) => {
    console.log('HeroStats получил данные:', stat);
    const heroName = getHeroName(stat.hero);
    
    // Пороговые значения для подсветки
    const HIGH_WINRATE = 60;
    const HIGH_KDA = 3.5;
    
    // Преобразуем значения в числа и нормализуем
    const kdaValue = parseFloat(stat.kda) || 0;
    // Если винрейт приходит как целое число (например 73), делим на 100
    const rawWinrate = parseFloat(stat.winrate) || 0;
    const winrateValue = rawWinrate > 1 ? rawWinrate / 100 : rawWinrate;
    
    console.log('Преобразованные значения:', {
      heroId: stat.hero,
      originalKda: stat.kda,
      originalWinrate: stat.winrate,
      kdaValue,
      winrateValue
    });
    
    // Определяем цвет для винрейта
    const getWinrateColor = (winrate) => {
      const wr = winrate * 100;
      if (wr >= HIGH_WINRATE) return 'text-green-400';
      if (wr >= 50) return 'text-yellow-400';
      return 'text-zinc-400';
    };

    // Определяем цвет для KDA
    const getKDAColor = (kda) => {
      if (kda >= HIGH_KDA) return 'text-green-400';
      if (kda >= 2.5) return 'text-yellow-400';
      return 'text-zinc-400';
    };
    
    return (
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center space-x-2">
          <div className="text-white">{heroName}</div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-zinc-500">{stat.matches} игр</span>
          <span className={getWinrateColor(winrateValue)}>
            {(winrateValue * 100).toFixed(1)}% WR
          </span>
          <span className={getKDAColor(kdaValue)}>
            {kdaValue.toFixed(2)} KDA
          </span>
        </div>
      </div>
    );
  }

  const renderTeamStats = (teamName) => {
    const team = teamsData[teamName]
    if (!team) return null

    return (
      <div className="space-y-6">
        {/* Основная статистика */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1C1C1E]/60 backdrop-blur-lg p-4 rounded-2xl">
            <div className="text-sm font-medium text-zinc-400">Матчи</div>
            <div className="text-2xl font-semibold text-white mt-1">{team.team_matches_played || 0}</div>
          </div>
          <div className="bg-[#1C1C1E]/60 backdrop-blur-lg p-4 rounded-2xl">
            <div className="text-sm font-medium text-zinc-400">Победы</div>
            <div className="text-2xl font-semibold text-white mt-1">{team.wins || 0}</div>
          </div>
          <div className="bg-[#1C1C1E]/60 backdrop-blur-lg p-4 rounded-2xl">
            <div className="text-sm font-medium text-zinc-400">Винрейт</div>
            <div className="text-2xl font-semibold text-white mt-1">{team.team_winrate || 0}%</div>
          </div>
        </div>

        {/* Состав команды */}
        <div className="bg-[#1C1C1E]/60 backdrop-blur-lg rounded-2xl p-6">
          <div className="text-lg font-semibold text-white mb-4">Состав команды</div>
          <div className="space-y-4">
            {Array.from({ length: parseInt(team.team_roster) || 0 }).map((_, index) => {
              const playerInfo = team[`team_roster_${index}_player_info`]
              const role = team[`team_roster_${index}_role`]

              if (!playerInfo) return null

              const heroStats = []
              for (let i = 0; i < 3; i++) {
                const prefix = `player_hero_stats_${i}`
                const heroId = playerInfo[`${prefix}_hero`]
                const matches = playerInfo[`${prefix}_matches`]
                const winrate = playerInfo[`${prefix}_winrate`]
                const kda = playerInfo[`${prefix}_kda`]

                if (heroId) {
                  heroStats.push({ 
                    hero: heroId,
                    matches, 
                    winrate, 
                    kda 
                  })
                }
              }

              return (
                <div key={`${playerInfo.player_info_player_nickname}-${index}`} 
                     className="bg-[#2C2C2E]/40 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 hover:bg-[#2C2C2E]/60">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium text-lg">{playerInfo.player_info_player_nickname}</div>
                      <div className="text-sm font-medium text-zinc-400">{translateRole(role)}</div>
                    </div>
                    <div className="text-sm px-3 py-1 rounded-full bg-[#1C1C1E]/60 text-zinc-300">
                      KDA: {playerInfo.player_statistics_avg_kda}
                    </div>
                  </div>
                  {heroStats.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-zinc-500 mb-2">Лучшие герои</div>
                      <div className="space-y-2">
                        {heroStats.map((stat, idx) => (
                          <HeroStats key={`${playerInfo.player_info_player_nickname}-hero-${idx}`} stat={stat} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderMatchCard = (match) => {
    if (!match || !match.teams || match.teams.length < 2) return null
    
    const matchDate = match.begin_at || match.scheduled_at || match.start_at || match.date
    
    return (
      <div className="bg-gradient-to-b from-[#1C1C1E]/80 to-[#1C1C1E]/60 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/5" key={match.external_id}>
        {/* Шапка матча */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-white">
              {match.teams[0].name} <span className="text-zinc-500">vs</span> {match.teams[1].name}
            </div>
            <div className="flex items-center space-x-4">
              {match.tournament && (
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <IoTrophy className="w-4 h-4" />
                  <span className="font-medium">{match.tournament.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-zinc-400">
                <IoTime className="w-4 h-4" />
                <span className="font-medium">{matchDate ? formatMatchDate(matchDate) : 'Дата не определена'}</span>
              </div>
            </div>
          </div>
          {match.tournament?.format && (
            <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">
              {match.tournament.format}
            </div>
          )}
        </div>

        {/* Сравнение команд */}
        <div className="grid grid-cols-2 gap-8">
          {match.teams.map((team, index) => {
            const teamData = teamsData[team.name]
            const otherTeamData = teamsData[match.teams[1 - index].name]
            
            return (
              <div key={team.name || `team-${index}`} className="space-y-6">
                <div className="flex items-center space-x-4 bg-[#2C2C2E]/40 p-4 rounded-2xl">
                  <img 
                    src={teamData?.team_image || team.logo_url || '/team-placeholder.png'} 
                    alt={team.name}
                    className="w-16 h-16 rounded-xl object-contain bg-[#1C1C1E]/60 p-2"
                  />
                  <div>
                    <div className="text-xl font-semibold text-white">{team.name}</div>
                    {teamData?.team_location && (
                      <div className="text-sm font-medium text-zinc-400">{teamData.team_location}</div>
                    )}
                  </div>
                </div>

                {/* Сравнение статистики */}
                {teamData && otherTeamData && (
                  <div className="bg-[#2C2C2E]/40 p-4 rounded-2xl">
                    <div className="text-sm font-medium text-zinc-400 mb-3">Сравнение</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Винрейт</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{teamData.team_winrate}%</span>
                          {teamData.team_winrate > otherTeamData.team_winrate ? (
                            <span className="text-green-400 text-xs">+{(teamData.team_winrate - otherTeamData.team_winrate).toFixed(1)}%</span>
                          ) : teamData.team_winrate < otherTeamData.team_winrate ? (
                            <span className="text-red-400 text-xs">{(teamData.team_winrate - otherTeamData.team_winrate).toFixed(1)}%</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Матчей сыграно</span>
                        <span className="text-white font-medium">{teamData.team_matches_played || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Побед</span>
                        <span className="text-white font-medium">{teamData.wins || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {renderTeamStats(team.name)}
              </div>
            )
          })}
        </div>

        {/* Дополнительная информация */}
        {match.tournament?.serie && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2C2C2E]/40 p-4 rounded-xl">
                <div className="text-sm font-medium text-zinc-400">Серия</div>
                <div className="text-white mt-1">{match.tournament.serie}</div>
              </div>
              {match.tournament.stage && (
                <div className="bg-[#2C2C2E]/40 p-4 rounded-xl">
                  <div className="text-sm font-medium text-zinc-400">Стадия</div>
                  <div className="text-white mt-1">{match.tournament.stage}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Форматирование даты
  const formatMatchDate = (dateString) => {
    try {
      console.log('Formatting date:', dateString)
      
      if (!dateString) {
        console.log('Date string is empty')
        return 'Дата не определена'
      }
      
      const date = new Date(dateString)
      console.log('Parsed date:', date)
      
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        console.log('Formatted date:', formatted)
        return formatted
      }
      
      console.log('Invalid date')
      return 'Дата не определена'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Дата не определена'
    }
  }

  // Функция поиска игроков
  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await openDotaService.searchPlayers(value)
      setSearchResults(results)
    } catch (error) {
      console.error('Ошибка при поиске игроков:', error)
    }
  }

  // Функция загрузки статистики игрока
  const loadPlayerStats = async (accountId) => {
    setLoadingPlayer(true)
    try {
      const stats = await openDotaService.getPlayerStats(accountId)
      setPlayerStats(stats)
      setShowPlayerModal(true)
    } catch (error) {
      console.error('Ошибка при загрузке статистики игрока:', error)
    } finally {
      setLoadingPlayer(false)
    }
  }

  // Компонент статистики игрока
  const PlayerStatsModal = ({ stats, visible, onClose }) => {
    if (!stats) return null

    return (
      <Modal
        title={<div className="text-xl font-bold">{stats.profile?.personaname || 'Статистика игрока'}</div>}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="player-stats-modal"
      >
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="flex items-center space-x-4 bg-[#1C1C1E]/60 p-4 rounded-xl">
            <img 
              src={stats.profile?.avatarfull || '/player-placeholder.png'} 
              alt={stats.profile?.personaname}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="text-lg font-semibold text-white">{stats.profile?.personaname}</div>
              <div className="text-sm text-zinc-400">
                {stats.profile?.country_code && `${stats.profile.country_code} • `}
                ID: {stats.profile?.account_id}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1C1C1E]/60 p-4 rounded-xl">
              <div className="text-sm text-zinc-400">Винрейт</div>
              <div className="text-xl font-bold text-white mt-1">
                {stats.stats?.winrate?.toFixed(1)}%
              </div>
            </div>
            <div className="bg-[#1C1C1E]/60 p-4 rounded-xl">
              <div className="text-sm text-zinc-400">Матчи</div>
              <div className="text-xl font-bold text-white mt-1">
                {(stats.stats?.wins || 0) + (stats.stats?.losses || 0)}
              </div>
            </div>
            <div className="bg-[#1C1C1E]/60 p-4 rounded-xl">
              <div className="text-sm text-zinc-400">KDA</div>
              <div className="text-xl font-bold text-white mt-1">
                {stats.stats?.averages?.kills}/{stats.stats?.averages?.deaths}/{stats.stats?.averages?.assists}
              </div>
            </div>
          </div>

          {/* Лучшие герои */}
          {stats.heroes && stats.heroes.length > 0 && (
            <div className="bg-[#1C1C1E]/60 p-4 rounded-xl">
              <div className="text-lg font-semibold text-white mb-4">Лучшие герои</div>
              <div className="space-y-3">
                {stats.heroes.map((hero, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-white">{getHeroName(hero.hero_id)}</div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-zinc-400">{hero.games} игр</span>
                      <span className={hero.winrate >= 60 ? 'text-green-400' : 'text-zinc-400'}>
                        {hero.winrate.toFixed(1)}% WR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Последние матчи */}
          {stats.recent_matches && stats.recent_matches.length > 0 && (
            <div className="bg-[#1C1C1E]/60 p-4 rounded-xl">
              <div className="text-lg font-semibold text-white mb-4">Последние матчи</div>
              <div className="space-y-3">
                {stats.recent_matches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-white">{getHeroName(match.hero_id)}</div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={match.result ? 'text-green-400' : 'text-red-400'}>
                        {match.result ? 'Победа' : 'Поражение'}
                      </span>
                      <span className="text-zinc-400">
                        {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] bg-opacity-95">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Заголовок и поиск игроков */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Аналитика матчей
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Поиск игрока..."
                prefix={<IoSearch className="text-zinc-400" />}
                className="w-64 bg-[#1C1C1E] border-0 text-white"
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-[#1C1C1E] rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((player) => (
                    <div
                      key={player.account_id}
                      className="flex items-center justify-between p-3 hover:bg-[#2C2C2E] cursor-pointer"
                      onClick={() => loadPlayerStats(player.account_id)}
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={player.avatarfull || '/player-placeholder.png'} 
                          alt={player.personaname}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="text-white flex items-center space-x-2">
                            <span>{player.personaname}</span>
                            {player.is_pro && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">PRO</span>
                            )}
                          </div>
                          {(player.team_name || player.country_code) && (
                            <div className="text-sm text-zinc-400">
                              {player.team_name && (
                                <span className="text-blue-400">{player.team_tag || player.team_name}</span>
                              )}
                              {player.team_name && player.country_code && " • "}
                              {player.country_code && player.country_code}
                            </div>
                          )}
                        </div>
                      </div>
                      {player.last_match_time && (
                        <div className="text-xs text-zinc-500">
                          {new Date(player.last_match_time).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {lastUpdate && (
              <div className="text-sm font-medium text-zinc-400">
                Обновлено: {formatMatchDate(lastUpdate)}
              </div>
            )}
          </div>
        </div>

        {/* Матчи */}
        <div className="space-y-6">
          {matches.slice(0, visibleMatches).map(renderMatchCard)}
        </div>

        {/* Кнопка "Загрузить еще" */}
        {visibleMatches < matches.length && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={loadMore}
              className="px-6 py-3 bg-[#2C2C2E]/60 hover:bg-[#2C2C2E] text-white font-medium rounded-full transition-all duration-200"
            >
              Загрузить еще
            </button>
          </div>
        )}

        {/* Модальное окно со статистикой игрока */}
        <PlayerStatsModal
          stats={playerStats}
          visible={showPlayerModal}
          onClose={() => setShowPlayerModal(false)}
        />
      </div>
    </div>
  )
}

export default Analytics 