import pool from '../../src/config/database.js';

export const predictionService = {
    // Получение всех прогнозов
    getPredictions: async () => {
        let connection;
        try {
            connection = await pool.getConnection();
            const [predictions] = await connection.execute(
                `SELECT * FROM predictions ORDER BY created_at DESC`
            );
            return predictions;
        } catch (error) {
            console.error('Ошибка при получении прогнозов:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Получение прогноза по ID матча
    getPredictionByMatchId: async (matchId) => {
        let connection;
        try {
            connection = await pool.getConnection();
            const [predictions] = await connection.execute(
                `SELECT * FROM predictions WHERE match_id = ?`,
                [matchId]
            );
            return predictions[0] || null;
        } catch (error) {
            console.error('Ошибка при получении прогноза:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Создание нового прогноза
    createPrediction: async (predictionData) => {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO predictions (
                    match_id, team1_name, team1_chance, team2_name, team2_chance,
                    predicted_winner, tournament_name, tournament_serie, tournament_stage,
                    reasoning, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    predictionData.match_id,
                    predictionData.teams.team1.name,
                    predictionData.teams.team1.predicted_chance,
                    predictionData.teams.team2.name,
                    predictionData.teams.team2.predicted_chance,
                    predictionData.predicted_winner,
                    predictionData.tournament.name,
                    predictionData.tournament.serie,
                    predictionData.tournament.stage,
                    predictionData.reasoning,
                    predictionData.status || 'pending'
                ]
            );
            
            const [newPrediction] = await connection.execute(
                'SELECT * FROM predictions WHERE id = ?',
                [result.insertId]
            );
            
            return newPrediction[0];
        } catch (error) {
            console.error('Ошибка при создании прогноза:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Обновление статуса прогноза
    updatePredictionStatus: async (matchId, status, result = null) => {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.execute(
                `UPDATE predictions 
                 SET status = ?, result = ?
                 WHERE match_id = ?`,
                [status, result, matchId]
            );
            
            const [updatedPrediction] = await connection.execute(
                'SELECT * FROM predictions WHERE match_id = ?',
                [matchId]
            );
            
            return updatedPrediction[0];
        } catch (error) {
            console.error('Ошибка при обновлении статуса прогноза:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Получение статистики прогнозов
    getPredictionStats: async () => {
        let connection;
        try {
            connection = await pool.getConnection();
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' AND result = 'win' THEN 1 ELSE 0 END) as correct,
                    SUM(CASE WHEN status = 'completed' AND result = 'loss' THEN 1 ELSE 0 END) as incorrect,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM predictions
            `);
            return stats[0];
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Удаление прогноза
    deletePrediction: async (id) => {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.execute(
                'DELETE FROM predictions WHERE id = ?',
                [id]
            );
            return { success: true };
        } catch (error) {
            console.error('Ошибка при удалении прогноза:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
};

export default predictionService; 