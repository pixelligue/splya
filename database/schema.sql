-- Создание базы данных
CREATE DATABASE IF NOT EXISTS esaisaas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE esaisaas;

-- Таблица команд
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    rating DECIMAL(10,2),
    country VARCHAR(100),
    region VARCHAR(100),
    total_winnings DECIMAL(15,2),
    matches_total INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    events_count INT DEFAULT 0,
    first_places INT DEFAULT 0,
    creation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parsed_at TIMESTAMP,
    INDEX idx_rating (rating),
    INDEX idx_region (region),
    INDEX idx_country (country),
    INDEX idx_matches (matches_total, matches_won, matches_lost),
    INDEX idx_events (events_count, first_places)
);

-- Таблица турниров
CREATE TABLE tournaments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    prize_pool DECIMAL(15,2),
    tier VARCHAR(50),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_tier (tier),
    INDEX idx_region (region)
);

-- Таблица матчей
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id VARCHAR(255) UNIQUE,
    tournament_id INT,
    team1_id INT,
    team2_id INT,
    winner_id INT,
    score_team1 INT,
    score_team2 INT,
    match_date TIMESTAMP,
    match_type VARCHAR(50),
    status VARCHAR(50),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (winner_id) REFERENCES teams(id),
    INDEX idx_match_date (match_date),
    INDEX idx_status (status),
    INDEX idx_teams (team1_id, team2_id),
    INDEX idx_tournament_date (tournament_id, match_date)
);

-- Таблица статистики команд
CREATE TABLE team_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    winrate DECIMAL(5,2),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_match_date TIMESTAMP,
    last_opponent_id INT,
    last_match_result VARCHAR(10),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (last_opponent_id) REFERENCES teams(id),
    INDEX idx_winrate (winrate),
    INDEX idx_last_match (last_match_date)
);

-- Таблица истории рейтинга команд
CREATE TABLE team_rating_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    rating DECIMAL(10,2),
    date TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    INDEX idx_team_date (team_id, date),
    INDEX idx_rating (rating)
);

-- Таблица для хранения H2H статистики
CREATE TABLE head_to_head_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team1_id INT,
    team2_id INT,
    total_matches INT DEFAULT 0,
    team1_wins INT DEFAULT 0,
    team2_wins INT DEFAULT 0,
    last_match_date TIMESTAMP,
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    UNIQUE INDEX idx_team_pairs (team1_id, team2_id),
    INDEX idx_last_match (last_match_date)
);

-- Триггер для обновления статистики команд после добавления матча
DELIMITER //
CREATE TRIGGER after_match_insert 
AFTER INSERT ON matches
FOR EACH ROW
BEGIN
    -- Обновляем статистику для первой команды
    UPDATE team_stats 
    SET total_matches = total_matches + 1,
        wins = wins + (NEW.winner_id = NEW.team1_id),
        losses = losses + (NEW.winner_id = NEW.team2_id),
        winrate = (wins / total_matches) * 100,
        last_match_date = NEW.match_date,
        last_opponent_id = NEW.team2_id,
        last_match_result = CASE 
            WHEN NEW.winner_id = NEW.team1_id THEN 'win'
            ELSE 'loss'
        END
    WHERE team_id = NEW.team1_id;

    -- Обновляем статистику для второй команды
    UPDATE team_stats 
    SET total_matches = total_matches + 1,
        wins = wins + (NEW.winner_id = NEW.team2_id),
        losses = losses + (NEW.winner_id = NEW.team1_id),
        winrate = (wins / total_matches) * 100,
        last_match_date = NEW.match_date,
        last_opponent_id = NEW.team1_id,
        last_match_result = CASE 
            WHEN NEW.winner_id = NEW.team2_id THEN 'win'
            ELSE 'loss'
        END
    WHERE team_id = NEW.team2_id;

    -- Обновляем H2H статистику
    INSERT INTO head_to_head_stats (team1_id, team2_id, total_matches, team1_wins, team2_wins, last_match_date)
    VALUES (
        LEAST(NEW.team1_id, NEW.team2_id),
        GREATEST(NEW.team1_id, NEW.team2_id),
        1,
        IF(NEW.winner_id = LEAST(NEW.team1_id, NEW.team2_id), 1, 0),
        IF(NEW.winner_id = GREATEST(NEW.team1_id, NEW.team2_id), 1, 0),
        NEW.match_date
    )
    ON DUPLICATE KEY UPDATE
        total_matches = total_matches + 1,
        team1_wins = team1_wins + IF(NEW.winner_id = LEAST(NEW.team1_id, NEW.team2_id), 1, 0),
        team2_wins = team2_wins + IF(NEW.winner_id = GREATEST(NEW.team1_id, NEW.team2_id), 1, 0),
        last_match_date = NEW.match_date;
END //
DELIMITER ;