import pool from '../../src/config/database.js';
import { updateMatches } from '../../scripts/updateMatches.js';

export const matchService = {
    // Получение предстоящих матчей
    getMatches: async () => {
        let connection;
        try {
            connection = await pool.getConnection();
            
            const [matches] = await connection.execute(
                `SELECT * FROM pandascore_matches 
                 WHERE status = 'pending' 
                 AND begin_at > NOW() 
                 ORDER BY begin_at ASC 
                 LIMIT 50`
            );
            
            console.log(`Получено ${matches.length} предстоящих матчей из базы данных`);
            return matches;
        } catch (error) {
            console.error('Ошибка при получении матчей из базы данных:', error);
            throw new Error('Ошибка при получении матчей из базы данных: ' + error.message);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    // Синхронизация матчей с PandaScore
    syncMatches: async () => {
        try {
            console.log('Начинаем синхронизацию матчей...');
            await updateMatches();
            console.log('Синхронизация матчей завершена успешно');
            return { success: true, message: 'Матчи успешно синхронизированы' };
        } catch (error) {
            console.error('Ошибка при синхронизации матчей:', error);
            throw new Error('Ошибка при синхронизации матчей: ' + error.message);
        }
    }
};

export default matchService; 