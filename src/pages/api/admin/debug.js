import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    // Подключаемся напрямую к MongoDB
    console.log('Connecting to MongoDB...');
    if (!mongoose.connection.readyState) {
      await mongoose.connect('mongodb://localhost:27017/esaisaas');
    }
    console.log('Connected successfully');

    // Получаем все коллекции
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections);

    // Получаем данные из коллекции teams
    const teamsCollection = mongoose.connection.db.collection('teams');
    const teams = await teamsCollection.find({}).toArray();
    
    // Получаем данные из коллекции teamstats
    const teamStatsCollection = mongoose.connection.db.collection('teamstats');
    const teamStats = await teamStatsCollection.find({}).toArray();

    // Статистика по коллекциям
    const stats = {
      collections: collections.length,
      teams: {
        total: teams.length,
        withStats: teams.filter(t => t.stats).length,
        withRoster: teams.filter(t => t.roster?.main?.length > 0).length,
      },
      teamStats: {
        total: teamStats.length,
        withStats: teamStats.filter(t => t.stats).length,
        withRoster: teamStats.filter(t => t.roster?.main?.length > 0).length,
      }
    };

    res.status(200).json({
      stats,
      collections: collections.map(c => c.name),
      teams,
      teamStats
    });
  } catch (error) {
    console.error('Error getting database data:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении данных из базы', 
      details: error.message,
      connectionState: mongoose.connection.readyState
    });
  }
} 