import 'dotenv/config';
import pool from '../src/config/database.js';
import { pandaScoreService } from '../server/services/pandaScoreService.js';

async function updateMatches() {
    let connection;
    try {
        console.log('Начинаем обновление матчей...');
        
        // Получаем соединение с базой данных
        connection = await pool.getConnection();
        
        // Получаем матчи из PandaScore API
        const matches = await pandaScoreService.getUpcomingMatches();
        console.log(`Получено ${matches.length} матчей из PandaScore API`);

        // Обновляем каждый матч
        for (const match of matches) {
            const [team1, team2] = match.teams;
            
            await connection.execute(
                `INSERT INTO pandascore_matches (
                    external_id, team1_id, team1_name, team2_id, team2_name,
                    tournament_id, tournament_name, tournament_serie, tournament_stage,
                    tournament_slug, format, begin_at, status, game
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    team1_id = VALUES(team1_id),
                    team1_name = VALUES(team1_name),
                    team2_id = VALUES(team2_id),
                    team2_name = VALUES(team2_name),
                    tournament_id = VALUES(tournament_id),
                    tournament_name = VALUES(tournament_name),
                    tournament_serie = VALUES(tournament_serie),
                    tournament_stage = VALUES(tournament_stage),
                    tournament_slug = VALUES(tournament_slug),
                    format = VALUES(format),
                    begin_at = VALUES(begin_at),
                    status = VALUES(status),
                    game = VALUES(game)`,
                [
                    match.external_id,
                    team1.id, team1.name,
                    team2.id, team2.name,
                    match.tournament.id,
                    match.tournament.name,
                    match.tournament.serie,
                    match.tournament.stage,
                    match.tournament.slug,
                    match.tournament.format,
                    match.begin_at,
                    match.status,
                    match.game
                ]
            );
        }

        console.log('Обновление матчей завершено успешно');
        
    } catch (error) {
        console.error('Ошибка при обновлении матчей:', error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Если скрипт запущен напрямую
if (process.argv[1] === new URL(import.meta.url).pathname) {
    updateMatches().then(() => process.exit());
}

export { updateMatches }; 