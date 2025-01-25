import { connectDB, Team } from '../config/mongodb.js';

const teams = [
  {
    name: 'Team Spirit',
    logo: 'https://img-cdn.hltv.org/teamlogo/9iMirAi7ArBLNU8p3kqUTZ.svg?ixlib=java-2.1.0&s=4dd8c822854679f765f1553e3c52b381',
    country: 'RU',
    matches: 156,
    winrate: 68.5,
    stats: {
      wins: 107,
      losses: 49,
      first_places: 12
    }
  },
  {
    name: 'Virtus.pro',
    logo: 'https://img-cdn.hltv.org/teamlogo/yZ6Bpuui1rW3jocXQ68XgZ.svg?ixlib=java-2.1.0&s=f39be1d3e7baf30a4e7f0b1e8bcd8369',
    country: 'RU',
    matches: 142,
    winrate: 62.7,
    stats: {
      wins: 89,
      losses: 53,
      first_places: 8
    }
  },
  {
    name: 'Natus Vincere',
    logo: 'https://img-cdn.hltv.org/teamlogo/kixzGZIb9IYAAv-1vGrGev.svg?ixlib=java-2.1.0&s=8f9986a391fcb1adfbfff021b824a937',
    country: 'UA',
    matches: 168,
    winrate: 71.4,
    stats: {
      wins: 120,
      losses: 48,
      first_places: 15
    }
  }
];

const importTeams = async () => {
  try {
    console.log('Подключение к MongoDB...');
    await connectDB();
    
    console.log('Очистка коллекции teams...');
    await Team.deleteMany({});
    
    console.log('Импорт команд...');
    for (const teamData of teams) {
      const team = new Team(teamData);
      await team.save();
      console.log(`Команда ${teamData.name} импортирована`);
    }
    
    console.log('Импорт завершен успешно');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при импорте:', error);
    process.exit(1);
  }
};

importTeams(); 