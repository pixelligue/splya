-- Проверяем структуру таблиц
SHOW CREATE TABLE teams;
SHOW CREATE TABLE team_stats;

-- Удаляем существующие внешние ключи и индексы
ALTER TABLE team_stats 
DROP FOREIGN KEY IF EXISTS team_stats_ibfk_1,
DROP INDEX IF EXISTS team_stats_ibfk_1,
DROP INDEX IF EXISTS team_id;

-- Обновляем тип данных для team_id в обеих таблицах
ALTER TABLE teams 
MODIFY COLUMN team_id VARCHAR(255) NOT NULL;

ALTER TABLE team_stats 
MODIFY COLUMN team_id VARCHAR(255) NOT NULL;

-- Добавляем индекс для team_id в teams
ALTER TABLE teams 
ADD PRIMARY KEY (team_id);

-- Добавляем индекс для team_id в team_stats
ALTER TABLE team_stats 
ADD INDEX (team_id);

-- Создаем новый внешний ключ
ALTER TABLE team_stats
ADD CONSTRAINT fk_team_stats_team_id
FOREIGN KEY (team_id) REFERENCES teams(team_id)
ON DELETE CASCADE
ON UPDATE CASCADE; 