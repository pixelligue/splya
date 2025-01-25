import { Team } from '../config/mongodb.js';

export const teamDataService = {
  // Сохранение данных команды
  saveTeamData: async (teamId, teamName, data) => {
    try {
      const teamData = {
        ...data,
        updated_at: new Date(),
        team_id: teamId,
        name: teamName
      };

      const result = await Team.findOneAndUpdate(
        { team_id: teamId },
        { $set: teamData },
        { upsert: true, new: true }
      );
      
      console.log(`Данные команды ${teamName} сохранены`);
      return result;
    } catch (error) {
      console.error(`Ошибка при сохранении данных команды ${teamName}:`, error);
      throw error;
    }
  },

  // Получение данных команды из БД
  getTeamData: async (teamId) => {
    try {
      const team = await Team.findOne({ team_id: teamId });
      return team;
    } catch (error) {
      console.error('Ошибка при получении данных команды:', error);
      throw error;
    }
  },

  // Получение списка всех команд из БД
  getAllTeams: async () => {
    try {
      const teams = await Team.find().sort({ matches: -1 });
      return teams;
    } catch (error) {
      console.error('Ошибка при получении списка команд:', error);
      throw error;
    }
  },

  // Поиск команд по имени
  searchTeams: async (searchQuery) => {
    try {
      const teams = await Team.find({
        name: { $regex: new RegExp(searchQuery, 'i') }
      }).sort({ matches: -1 });
      
      return teams;
    } catch (error) {
      console.error('Ошибка при поиске команд:', error);
      throw error;
    }
  }
};

export default teamDataService; 