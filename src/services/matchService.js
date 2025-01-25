import { db } from '../config/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { pandaScoreService } from './pandaScoreService'
import { openDotaService } from './openDotaService'
import { stratzService } from './stratzService'
import { dotabuffService } from './dotabuffService'
import { datDotaService } from './datDotaService'

const MATCHES_COLLECTION = 'matches'
const UPDATE_INTERVAL = 60 * 60 * 1000 // 1 час в миллисекундах

export const matchService = {
  // Получение матчей из базы данных
  getMatches: async () => {
    try {
      const matchesRef = collection(db, MATCHES_COLLECTION)
      const q = query(
        matchesRef,
        where('scheduled_at', '>=', new Date()),
        orderBy('scheduled_at', 'asc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Ошибка при получении матчей из базы:', error)
      throw error
    }
  },

  // Получение данных о командах из всех источников
  getTeamsData: async (team1Name, team2Name) => {
    try {
      let data = {
        team1Stats: {},
        team2Stats: {},
        h2h: {}
      }

      // 1. Получаем данные из OpenDota
      console.log('Получаем данные из OpenDota...')
      const [team1OpenDota, team2OpenDota] = await Promise.all([
        openDotaService.getTeamByName(team1Name),
        openDotaService.getTeamByName(team2Name)
      ])

      if (team1OpenDota && team2OpenDota) {
        const [team1Stats, team2Stats] = await Promise.all([
          openDotaService.getTeamStats(team1OpenDota.team_id),
          openDotaService.getTeamStats(team2OpenDota.team_id)
        ])

        data.team1Stats.openDota = team1Stats
        data.team2Stats.openDota = team2Stats
      }

      // 2. Получаем данные из STRATZ
      if (!data.team1Stats.openDota || !data.team2Stats.openDota) {
        console.log('Получаем данные из STRATZ...')
        const [team1Stratz, team2Stratz] = await Promise.all([
          stratzService.searchTeam(team1Name),
          stratzService.searchTeam(team2Name)
        ])

        if (team1Stratz) {
          const matches = await stratzService.getTeamMatches(team1Stratz.id)
          data.team1Stats.stratz = {
            details: team1Stratz,
            matches
          }
        }

        if (team2Stratz) {
          const matches = await stratzService.getTeamMatches(team2Stratz.id)
          data.team2Stats.stratz = {
            details: team2Stratz,
            matches
          }
        }
      }

      // 3. Получаем данные из Dotabuff
      console.log('Получаем данные из Dotabuff...')
      const [team1DotabuffUrl, team2DotabuffUrl] = await Promise.all([
        dotabuffService.searchTeam(team1Name),
        dotabuffService.searchTeam(team2Name)
      ])

      if (team1DotabuffUrl && team2DotabuffUrl) {
        const [team1Stats, team2Stats, h2hStats] = await Promise.all([
          dotabuffService.getTeamStats(team1DotabuffUrl),
          dotabuffService.getTeamStats(team2DotabuffUrl),
          dotabuffService.getHeadToHead(team1DotabuffUrl, team2DotabuffUrl)
        ])

        data.team1Stats.dotabuff = team1Stats
        data.team2Stats.dotabuff = team2Stats
        data.h2h.dotabuff = h2hStats
      }

      // 4. Получаем данные из DatDota
      if (team1OpenDota && team2OpenDota) {
        console.log('Получаем данные из DatDota...')
        const [
          team1Stats,
          team2Stats,
          team1Draft,
          team2Draft,
          team1Laning,
          team2Laning,
          h2h
        ] = await Promise.all([
          datDotaService.getTeamStats(team1OpenDota.team_id),
          datDotaService.getTeamStats(team2OpenDota.team_id),
          datDotaService.getTeamDraftStats(team1OpenDota.team_id),
          datDotaService.getTeamDraftStats(team2OpenDota.team_id),
          datDotaService.getTeamLaningStats(team1OpenDota.team_id),
          datDotaService.getTeamLaningStats(team2OpenDota.team_id),
          datDotaService.getHeadToHead(team1OpenDota.team_id, team2OpenDota.team_id)
        ])

        if (team1Stats) {
          data.team1Stats.datDota = {
            general: team1Stats,
            draft: team1Draft,
            laning: team1Laning
          }
        }

        if (team2Stats) {
          data.team2Stats.datDota = {
            general: team2Stats,
            draft: team2Draft,
            laning: team2Laning
          }
        }

        if (h2h) {
          data.h2h.datDota = h2h
        }
      }

      return data
    } catch (error) {
      console.error('Ошибка при получении данных о командах:', error)
      throw error
    }
  },

  // Обновление матчей из PandaScore
  updateMatches: async () => {
    try {
      console.log('Начинаем обновление матчей...')
      
      // Получаем время последнего обновления
      const lastUpdateRef = doc(db, 'system', 'lastMatchUpdate')
      const lastUpdate = await getDocs(lastUpdateRef)
      const lastUpdateTime = lastUpdate?.data()?.timestamp?.toDate() || new Date(0)
      
      // Проверяем, нужно ли обновление
      if (new Date() - lastUpdateTime < UPDATE_INTERVAL) {
        console.log('Обновление не требуется, прошло менее часа')
        return { updated: 0, added: 0 }
      }

      // Получаем матчи из PandaScore
      const matches = await pandaScoreService.getUpcomingDota2Matches(20)
      
      // Получаем существующие матчи
      const existingMatches = await matchService.getMatches()
      const existingMatchIds = new Set(existingMatches.map(m => m.pandaScoreId))
      
      let added = 0
      let updated = 0

      // Обрабатываем каждый матч
      for (const match of matches) {
        const team1Name = match.opponents[0]?.opponent.name
        const team2Name = match.opponents[1]?.opponent.name

        if (!team1Name || !team2Name) {
          console.log('Пропускаем матч без команд:', match.id)
          continue
        }

        // Получаем данные о командах
        const teamsData = await matchService.getTeamsData(team1Name, team2Name)

        const matchData = {
          pandaScoreId: match.id.toString(),
          team1: team1Name,
          team2: team2Name,
          tournament: match.tournament?.name || 'Unknown',
          scheduled_at: new Date(match.scheduled_at),
          status: match.status,
          lastUpdated: serverTimestamp(),
          stats: teamsData
        }

        if (existingMatchIds.has(match.id.toString())) {
          // Обновляем существующий матч
          const existingMatch = existingMatches.find(m => m.pandaScoreId === match.id.toString())
          await updateDoc(doc(db, MATCHES_COLLECTION, existingMatch.id), matchData)
          updated++
        } else {
          // Добавляем новый матч
          await addDoc(collection(db, MATCHES_COLLECTION), matchData)
          added++
        }

        // Добавляем задержку между запросами
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Обновляем время последнего обновления
      await updateDoc(lastUpdateRef, {
        timestamp: serverTimestamp()
      })

      console.log(`Обновление завершено. Добавлено: ${added}, Обновлено: ${updated}`)
      return { added, updated }
    } catch (error) {
      console.error('Ошибка при обновлении матчей:', error)
      throw error
    }
  },

  // Автоматическое обновление матчей
  startAutoUpdate: () => {
    // Обновляем сразу при запуске
    matchService.updateMatches()

    // Устанавливаем интервал обновления
    setInterval(() => {
      matchService.updateMatches()
    }, UPDATE_INTERVAL)
  }
}

export default matchService 