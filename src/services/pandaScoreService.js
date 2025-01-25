import axios from 'axios'
import { collection, query, where, getDocs, addDoc, writeBatch, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { pushrApiService } from './pushrApiService'

const PANDASCORE_API_URL = 'https://api.pandascore.co/dota2'
const PANDASCORE_TOKEN = import.meta.env.VITE_PANDASCORE_API_KEY
const CHECK_INTERVAL = 60 * 60 * 1000 // 1 час в миллисекундах

// Создаем инстанс axios с базовой конфигурацией
const pandaScoreAxios = axios.create({
  baseURL: PANDASCORE_API_URL,
  headers: {
    'Authorization': `Bearer ${PANDASCORE_TOKEN}`
  }
})

export const pandaScoreService = {
  // Проверяем существование матча в Firebase
  async checkMatchExists(matchId) {
    const matchesRef = collection(db, 'matches')
    const q = query(matchesRef, where('external_id', '==', matchId))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  },

  // Проверяем наличие команды в Pushr API
  async checkTeamInPushr(teamName) {
    try {
      await pushrApiService.teams.getIdByPandascoreName(teamName)
      return true
    } catch (error) {
      console.log(`Команда ${teamName} не найдена в Pushr API`)
      return false
    }
  },

  // Получаем время последней проверки
  async getLastCheckTime() {
    const docRef = doc(db, 'system', 'matches_check')
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data().lastCheck : null
  },

  // Обновляем время последней проверки
  async updateLastCheckTime() {
    const docRef = doc(db, 'system', 'matches_check')
    await setDoc(docRef, {
      lastCheck: new Date().toISOString()
    })
  },

  // Проверяем, нужно ли обновлять матчи
  async shouldCheckMatches() {
    const lastCheck = await this.getLastCheckTime()
    if (!lastCheck) return true

    const timeSinceLastCheck = Date.now() - new Date(lastCheck).getTime()
    return timeSinceLastCheck > CHECK_INTERVAL
  },

  // Удаляем все существующие матчи из Firebase
  async deleteAllMatches() {
    const matchesRef = collection(db, 'matches')
    const snapshot = await getDocs(matchesRef)
    
    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    console.log('Все существующие матчи удалены')
  },

  // Сохраняем матчи в Firebase
  async saveMatches(matches) {
    const batch = writeBatch(db)
    const matchesRef = collection(db, 'matches')

    for (const match of matches) {
      const matchDoc = doc(matchesRef)
      batch.set(matchDoc, {
        ...match,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'upcoming'
      })
    }

    await batch.commit()
    await this.updateLastCheckTime()
  },

  getUpcomingMatches: async (limit = 50, forceCheck = false) => {
    try {
      // Проверяем, нужно ли обновлять матчи
      const shouldCheck = forceCheck || await pandaScoreService.shouldCheckMatches()
      
      if (!shouldCheck) {
        // Если обновление не требуется, возвращаем существующие матчи из Firebase
        const matchesRef = collection(db, 'matches')
        const q = query(
          matchesRef,
          where('status', '==', 'upcoming'),
          where('begin_at', '>', new Date().toISOString())
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }

      // Если нужно обновить, получаем новые матчи из PandaScore
      const response = await pandaScoreAxios.get('/matches/upcoming', {
        params: {
          per_page: limit,
          sort: 'begin_at'
        }
      })
      
      // Преобразуем формат данных
      const matches = (response.data || []).map(match => ({
        external_id: match.id.toString(),
        begin_at: match.begin_at,
        teams: [
          {
            id: match.opponents[0]?.opponent?.id,
            name: match.opponents[0]?.opponent?.name
          },
          {
            id: match.opponents[1]?.opponent?.id,
            name: match.opponents[1]?.opponent?.name
          }
        ],
        tournament: {
          name: match.league?.name || match.tournament?.name || 'Unknown Tournament',
          serie: match.serie?.full_name || '',
          stage: match.stage?.name || '',
          format: match.number_of_games > 1 ? `BO${match.number_of_games}` : 'Unknown'
        }
      }))
      
      // Фильтруем матчи, проверяя наличие команд в обоих API
      const filteredMatches = []
      for (const match of matches) {
        if (match && 
            match.external_id && 
            match.teams && 
            match.teams[0]?.name && 
            match.teams[1]?.name) {
          
          // Проверяем наличие обеих команд в Pushr API
          const [team1InPushr, team2InPushr] = await Promise.all([
            pandaScoreService.checkTeamInPushr(match.teams[0].name),
            pandaScoreService.checkTeamInPushr(match.teams[1].name)
          ])

          if (team1InPushr && team2InPushr) {
            filteredMatches.push(match)
          }
        }
      }

      // Сначала удаляем все существующие матчи
      await pandaScoreService.deleteAllMatches()
      
      // Сохраняем только отфильтрованные матчи в Firebase
      await pandaScoreService.saveMatches(filteredMatches)
      
      return filteredMatches
    } catch (error) {
      console.error('Ошибка при получении матчей:', error)
      throw error
    }
  }
} 