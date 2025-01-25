CREATE TABLE IF NOT EXISTS cyberscore_matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id VARCHAR(255) UNIQUE NOT NULL,
    tournament_id INT,
    team1_id INT,
    team2_id INT,
    winner_id INT,
    score_team1 INT,
    score_team2 INT,
    match_date TIMESTAMP,
    match_type VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teams (team1_id, team2_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_match_date (match_date),
    INDEX idx_status (status)
); 