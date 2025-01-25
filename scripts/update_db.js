import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from '../server/db/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'esaisaas'
    });

    try {
        console.log('Подключение к базе данных...');
        
        // Читаем SQL-файл
        const sqlPath = path.join(__dirname, 'update_teams_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Выполняем SQL-запрос
        console.log('Обновление структуры таблицы...');
        await connection.query(sql);
        
        console.log('Структура таблицы успешно обновлена!');
    } catch (error) {
        console.error('Ошибка при обновлении структуры таблицы:', error);
    } finally {
        await connection.end();
    }
}

async function syncTeamStats() {
  const connection = await pool.getConnection();
  
  try {
    // Получаем все команды из таблицы teams
    const [teams] = await connection.execute(
      `SELECT t.team_id, t.name, t.matches_total, t.matches_won, t.matches_lost 
       FROM teams t`
    );
    
    console.log(`Найдено ${teams.length} команд для синхронизации`);
    
    // Для каждой команды обновляем или создаем запись в team_stats
    for (const team of teams) {
      const [exists] = await connection.execute(
        'SELECT 1 FROM team_stats WHERE team_id = ?',
        [team.team_id]
      );
      
      if (exists.length > 0) {
        // Обновляем существующую статистику
        console.log(`Обновляем статистику для команды ${team.name} (ID: ${team.team_id})`);
        await connection.execute(
          `UPDATE team_stats 
           SET total_matches = ?,
               wins = ?,
               losses = ?,
               winrate = ?
           WHERE team_id = ?`,
          [
            team.matches_total || 0,
            team.matches_won || 0,
            team.matches_lost || 0,
            team.matches_total > 0 ? (team.matches_won / team.matches_total * 100) : 0,
            team.team_id
          ]
        );
      } else {
        // Создаем новую запись
        console.log(`Создаем статистику для команды ${team.name} (ID: ${team.team_id})`);
        await connection.execute(
          `INSERT INTO team_stats (
            team_id, 
            total_matches, 
            wins, 
            losses, 
            winrate, 
            current_streak, 
            longest_streak
          ) VALUES (?, ?, ?, ?, ?, 0, 0)`,
          [
            team.team_id,
            team.matches_total || 0,
            team.matches_won || 0,
            team.matches_lost || 0,
            team.matches_total > 0 ? (team.matches_won / team.matches_total * 100) : 0
          ]
        );
      }
    }
    
    console.log('Синхронизация статистики команд завершена');
    
  } catch (error) {
    console.error('Ошибка при синхронизации статистики команд:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Запускаем синхронизацию
syncTeamStats()
  .then(() => {
    console.log('Скрипт успешно выполнен');
    process.exit(0);
  })
  .catch(error => {
    console.error('Ошибка выполнения скрипта:', error);
    process.exit(1);
  });

main(); 