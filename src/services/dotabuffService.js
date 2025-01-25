import * as cheerio from 'cheerio'
import axios from 'axios'
import { teamsService } from './teamsService'

const API_URL = 'http://localhost:3001/api'

export const dotabuffService = {
  // Поиск команды
  searchTeam: async (teamName) => {
    try {
      // Сначала ищем в Firebase
      const teams = await teamsService.searchTeams(teamName)
      const team = teams.find(t => 
        t.customData?.socialLinks?.dotabuff && 
        (t.name.toLowerCase() === teamName.toLowerCase() || 
         t.tag.toLowerCase() === teamName.toLowerCase())
      )

      if (team) {
        // Если нашли команду с ссылкой на Dotabuff, используем её
        return {
          id: team.team_id,
          name: team.name,
          tag: team.tag,
          dotabuffUrl: team.customData.socialLinks.dotabuff
        }
      }

      // Если не нашли в Firebase, делаем запрос к API
      const response = await axios.get(`${API_URL}/dotabuff/teams`)
      const allTeams = response.data
      
      // Ищем команду по имени
      const foundTeam = allTeams.find(t => 
        t.name.toLowerCase().includes(teamName.toLowerCase())
      )

      return foundTeam || null
    } catch (error) {
      console.error('Ошибка поиска команды:', error)
      throw error
    }
  },

  // Получение данных команды по ID
  getTeamById: async (teamId) => {
    try {
      // Сначала получаем команду из Firebase
      const team = await teamsService.getTeamById(teamId)
      
      if (!team?.customData?.socialLinks?.dotabuff) {
        throw new Error('Ссылка на Dotabuff не найдена для этой команды')
      }

      // Используем сохраненную ссылку для получения данных
      const response = await axios.get(`${API_URL}/dotabuff/teams/${teamId}`)
      return response.data
    } catch (error) {
      console.error('Ошибка получения данных команды:', error)
      throw error
    }
  },

  // Получение всех команд с Dotabuff
  getAllTeams: async () => {
    try {
      const response = await axios.get(`${API_URL}/dotabuff/teams`)
      return response.data
    } catch (error) {
      console.error('Ошибка получения списка команд:', error)
      throw error
    }
  }
} 