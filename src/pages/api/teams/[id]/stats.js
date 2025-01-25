import { connectDB } from '../../../../src/config/mongodb.js';
import { TeamStats } from '../../../../server/models/TeamStats.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully');

    const { id } = req.query;
    console.log('Getting raw stats for team:', id);
    
    const teamStats = await TeamStats.findOne({ 
      $or: [
        { team_id: id },
        { 'external_ids.id': id }
      ]
    });
    
    if (!teamStats) {
      console.log('Team stats not found for id:', id);
      return res.status(404).json({ error: 'Статистика команды не найдена' });
    }
    
    console.log('Found team stats:', teamStats.name);
    res.status(200).json(teamStats);
  } catch (error) {
    console.error('Error getting team stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики команды' });
  }
} 