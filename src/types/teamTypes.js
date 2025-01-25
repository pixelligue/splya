// Структура данных игрока
export const playerDataStructure = {
  player_id: '',
  nickname: '',
  real_name: '',
  position: 1, // 1-5
  country: '',
  avatar_url: '',
  
  // Статистика игрока
  stats: {
    matches_played: 0,
    wins: 0,
    losses: 0,
    avg_kda: '0.0',
    avg_gpm: 0,
    avg_xpm: 0,
    avg_last_hits_10min: 0,
    avg_denies_10min: 0,
    avg_lane_efficiency: '0%',
    
    // Сигнатурные герои
    signature_heroes: [], // [{hero_id, matches, wins, winrate}]
    
    // Статистика по линиям
    lane_stats: {
      safe_lane: { matches: 0, wins: 0, winrate: '0%' },
      mid_lane: { matches: 0, wins: 0, winrate: '0%' },
      off_lane: { matches: 0, wins: 0, winrate: '0%' },
      jungle: { matches: 0, wins: 0, winrate: '0%' }
    },
    
    // Герои
    hero_pool: [], // [{hero_id, matches, wins, winrate, avg_kda, avg_gpm}]
    
    // Статистика по турниру
    tournament_stats: {
      matches: 0,
      wins: 0,
      losses: 0,
      heroes_played: [], // [{hero_id, matches, wins}]
      avg_kda: '0.0',
      avg_gpm: 0,
      avg_xpm: 0
    }
  }
};

// Структура данных команды
export const teamDataStructure = {
  // Основная информация
  team_id: '',
  name: '',
  tag: '',
  logo_url: '',
  rating: 0,
  region: '',
  created_at: null,
  updated_at: null,
  
  // Общая статистика
  stats: {
    total_matches: 0,
    wins: 0,
    losses: 0,
    winrate: '0%',
    winrate_last_month: '0%',
    current_streak: 0, // положительное - победы, отрицательное - поражения
    
    // Экономика
    avg_team_networth_10min: 0,
    avg_team_networth_20min: 0,
    avg_team_networth_30min: 0,
    
    // Объективы
    first_blood_rate: '0%',
    first_tower_rate: '0%',
    first_roshan_rate: '0%',
    avg_towers_destroyed: 0,
    avg_roshans_killed: 0,
    
    // Тайминги
    avg_game_duration: 0,
    avg_first_blood_time: 0,
    avg_first_tower_time: 0,
    avg_first_roshan_time: 0
  },
  
  // Текущий состав
  roster: [playerDataStructure],
  
  // Стиль игры
  playstyle: {
    early_game_rating: 0, // 0-100
    mid_game_rating: 0,
    late_game_rating: 0,
    aggression_level: 0,
    farm_dependency: 0,
    teamfight_frequency: 0,
    
    // Предпочтения
    preferred_side: '', // 'radiant' или 'dire'
    preferred_draft_style: '', // 'aggressive', 'defensive', 'balanced'
    preferred_game_pace: '', // 'fast', 'medium', 'slow'
    
    // Статистика по стадиям игры
    stage_stats: {
      early_game: {
        win_rate: '0%',
        avg_kills: 0,
        avg_networth_diff: 0
      },
      mid_game: {
        win_rate: '0%',
        avg_kills: 0,
        avg_networth_diff: 0
      },
      late_game: {
        win_rate: '0%',
        avg_kills: 0,
        avg_networth_diff: 0
      }
    }
  },
  
  // Драфт
  draft_stats: {
    most_picked_heroes: [], // [{hero_id, matches, wins, winrate}]
    most_banned_heroes: [], // [{hero_id, matches}]
    best_winrate_heroes: [], // [{hero_id, matches, wins, winrate}]
    hero_combinations: [], // [{heroes: [hero_id, hero_id], matches, wins}]
    first_pick_winrate: '0%',
    second_pick_winrate: '0%'
  },
  
  // История матчей
  match_history: {
    recent_matches: [], // последние 20 матчей
    tournament_matches: [], // матчи текущего турнира
    head_to_head: {}, // история встреч с другими командами
  }
};

// Структура данных матча
export const matchDataStructure = {
  match_id: '',
  tournament_id: '',
  tournament_name: '',
  series_id: '',
  game_number: 0,
  date: null,
  duration: 0,
  
  // Команды
  radiant_team_id: '',
  dire_team_id: '',
  winner: '', // team_id
  score: [0, 0], // [radiant_score, dire_score]
  
  // Драфт
  draft: {
    first_pick: '', // team_id
    bans: [], // [{hero_id, team_id, order}]
    picks: [], // [{hero_id, team_id, order, player_id}]
  },
  
  // Объективы
  objectives: {
    first_blood: {
      time: 0,
      team_id: '',
      killer_id: '',
      victim_id: ''
    },
    towers: [
      // {time, team_id, tower_id, killer_id}
    ],
    roshans: [
      // {time, team_id, killer_id}
    ],
    barracks: [
      // {time, team_id, barracks_id}
    ]
  },
  
  // Статистика команд
  team_stats: {
    radiant: {
      networth_graph: [], // [time, networth]
      xp_graph: [], // [time, xp]
      kills_graph: [], // [time, kills]
      gold_advantage: [], // [time, advantage]
      xp_advantage: [], // [time, advantage]
      
      // Общая статистика
      total_kills: 0,
      total_deaths: 0,
      total_assists: 0,
      total_networth: 0,
      total_hero_damage: 0,
      total_tower_damage: 0,
      total_hero_healing: 0,
      
      // Объективы
      towers_destroyed: 0,
      barracks_destroyed: 0,
      roshans_killed: 0,
      
      // Видимость
      wards_placed: 0,
      sentries_placed: 0,
      obs_wards_destroyed: 0,
      sentries_destroyed: 0
    },
    dire: {
      // То же самое, что и для radiant
    }
  },
  
  // Статистика игроков
  player_stats: {
    // Для каждого игрока
    // player_id: { ... статистика ... }
  }
};

// Структура статистики игрока в матче
export const playerMatchStatsStructure = {
  player_id: '',
  team_id: '',
  hero_id: 0,
  position: 1, // 1-5
  
  // Основная статистика
  kills: 0,
  deaths: 0,
  assists: 0,
  kda: '0.0',
  
  // Фарм
  last_hits: 0,
  denies: 0,
  gpm: 0,
  xpm: 0,
  networth: 0,
  
  // Урон
  hero_damage: 0,
  tower_damage: 0,
  hero_healing: 0,
  
  // Лейнинг
  lane: '', // 'safe', 'mid', 'off', 'jungle'
  lane_efficiency: '0%',
  lane_cs: 0,
  lane_denies: 0,
  lane_kills: 0,
  lane_deaths: 0,
  
  // Предметы
  items: [], // [{item_id, time}]
  backpack: [], // [item_id]
  neutral_item: 0,
  
  // Способности
  ability_upgrades: [], // [{ability_id, time, level}]
  
  // Дополнительная статистика
  camps_stacked: 0,
  runes_collected: 0,
  teamfight_participation: '0%',
  wards_placed: 0,
  sentries_placed: 0,
  obs_wards_destroyed: 0,
  sentries_destroyed: 0,
  stuns: 0,
  tower_kills: 0,
  roshan_kills: 0,
  
  // Графики
  networth_graph: [], // [time, networth]
  xp_graph: [], // [time, xp]
  
  // Тайминги предметов
  item_timings: [] // [{item_id, time}]
}; 