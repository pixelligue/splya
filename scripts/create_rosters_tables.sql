-- Таблица для составов команд
CREATE TABLE IF NOT EXISTS rosters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    INDEX idx_team_active (team_id, is_active),
    INDEX idx_dates (start_date, end_date)
);

-- Таблица для игроков
CREATE TABLE IF NOT EXISTS players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    country VARCHAR(100),
    birth_date DATE,
    position INT, -- 1-5 позиция
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nickname (nickname),
    INDEX idx_country (country)
);

-- Таблица связи игроков с составами
CREATE TABLE IF NOT EXISTS roster_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roster_id INT NOT NULL,
    player_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_standin BOOLEAN DEFAULT FALSE,
    join_date DATE,
    leave_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roster_id) REFERENCES rosters(id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    INDEX idx_roster_active (roster_id, is_active),
    INDEX idx_player_active (player_id, is_active)
);

-- Таблица статистики игроков
CREATE TABLE IF NOT EXISTS player_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    winrate DECIMAL(5,2) DEFAULT 0.00,
    avg_kills DECIMAL(5,2) DEFAULT 0.00,
    avg_deaths DECIMAL(5,2) DEFAULT 0.00,
    avg_assists DECIMAL(5,2) DEFAULT 0.00,
    avg_kda DECIMAL(5,2) DEFAULT 0.00,
    avg_gpm DECIMAL(7,2) DEFAULT 0.00,
    avg_xpm DECIMAL(7,2) DEFAULT 0.00,
    avg_last_hits DECIMAL(7,2) DEFAULT 0.00,
    avg_denies DECIMAL(7,2) DEFAULT 0.00,
    avg_lane_efficiency DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    INDEX idx_player_stats (player_id)
);

-- Таблица статистики игрока по героям
CREATE TABLE IF NOT EXISTS player_hero_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    hero_id INT NOT NULL,
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    winrate DECIMAL(5,2) DEFAULT 0.00,
    avg_kills DECIMAL(5,2) DEFAULT 0.00,
    avg_deaths DECIMAL(5,2) DEFAULT 0.00,
    avg_assists DECIMAL(5,2) DEFAULT 0.00,
    avg_kda DECIMAL(5,2) DEFAULT 0.00,
    avg_gpm DECIMAL(7,2) DEFAULT 0.00,
    avg_xpm DECIMAL(7,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    INDEX idx_player_hero (player_id, hero_id),
    INDEX idx_hero_winrate (hero_id, winrate)
);

-- Таблица статистики игрока по ролям
CREATE TABLE IF NOT EXISTS player_role_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    role VARCHAR(50) NOT NULL, -- carry, mid, offlane, soft_support, hard_support
    matches_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    winrate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    INDEX idx_player_role (player_id, role)
); 