import { db } from '../config/firebase'
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'

const teamAnalyticsService = {
  // Обновление статистики команды после матча
  updateTeamStats: async (teamId, matchData) => {
    const teamRef = doc(db, 'teams', teamId)
    const teamDoc = await getDoc(teamRef)
    
    if (!teamDoc.exists()) {
      console.error('Команда не найдена:', teamId)
      return
    }

    const team = teamDoc.data()
    const isWinner = matchData.winner_id === teamId
    const opponent = isWinner ? matchData.teams.find(t => t.team_id !== teamId) : matchData.teams.find(t => t.team_id === matchData.winner_id)

    // Обновляем общую статистику
    const newStats = {
      total_matches: (team.stats?.total_matches || 0) + 1,
      wins: (team.stats?.wins || 0) + (isWinner ? 1 : 0),
      losses: (team.stats?.losses || 0) + (isWinner ? 0 : 1)
    }
    newStats.winrate = ((newStats.wins / newStats.total_matches) * 100).toFixed(2)

    // Добавляем матч в историю
    const matchResult = {
      match_id: matchData.id,
      tournament_id: matchData.tournament.id,
      tournament_name: matchData.tournament.name,
      opponent_id: opponent.team_id,
      opponent_name: opponent.name,
      result: isWinner ? 'win' : 'loss',
      date: matchData.end_at || Timestamp.now(),
      score: matchData.score || '0-0'
    }

    // Обновляем документ команды
    await updateDoc(teamRef, {
      'stats': newStats,
      'recent_matches': arrayUnion(matchResult),
      'updatedAt': Timestamp.now()
    })
  },

  // Обновление статистики обеих команд при создании матча
  updateTeamsForNewMatch: async (matchData) => {
    const { teams } = matchData
    for (const team of teams) {
      const teamRef = doc(db, 'teams', team.team_id)
      const teamDoc = await getDoc(teamRef)
      
      if (teamDoc.exists()) {
        await updateDoc(teamRef, {
          'upcoming_matches': arrayUnion({
            match_id: matchData.id,
            tournament_id: matchData.tournament.id,
            tournament_name: matchData.tournament.name,
            opponent_id: teams.find(t => t.team_id !== team.team_id).team_id,
            opponent_name: teams.find(t => t.team_id !== team.team_id).name,
            date: matchData.begin_at,
            status: 'upcoming'
          })
        })
      }
    }
  }
}

export default teamAnalyticsService 