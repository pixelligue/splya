import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

export const matchesService = {
  // Сохранение матча
  saveMatch: async (matchData) => {
    try {
      const matchRef = doc(db, 'matches', matchData.match_id);
      await setDoc(matchRef, {
        ...matchData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return matchData;
    } catch (error) {
      console.error('Error saving match:', error);
      throw error;
    }
  },

  // Получение матча по ID
  getMatchById: async (matchId) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      if (matchDoc.exists()) {
        return { ...matchDoc.data(), match_id: matchDoc.id };
      }
      return null;
    } catch (error) {
      console.error('Error getting match:', error);
      throw error;
    }
  },

  // Получение матчей команды
  getTeamMatches: async (teamId) => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('radiant_team_id', '==', teamId),
        orderBy('date', 'desc')
      );
      const q2 = query(
        collection(db, 'matches'),
        where('dire_team_id', '==', teamId),
        orderBy('date', 'desc')
      );

      const [radiantSnapshot, direSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(q2)
      ]);

      const matches = [
        ...radiantSnapshot.docs.map(doc => ({ ...doc.data(), match_id: doc.id })),
        ...direSnapshot.docs.map(doc => ({ ...doc.data(), match_id: doc.id }))
      ];

      // Сортируем по дате
      return matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting team matches:', error);
      throw error;
    }
  },

  // Получение матчей турнира
  getTournamentMatches: async (tournamentId) => {
    try {
      const q = query(
        collection(db, 'matches'),
        where('tournament_id', '==', tournamentId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), match_id: doc.id }));
    } catch (error) {
      console.error('Error getting tournament matches:', error);
      throw error;
    }
  },

  // Получение истории встреч двух команд
  getHeadToHead: async (team1Id, team2Id) => {
    try {
      const matches = [];
      
      // Получаем матчи, где team1 - radiant, team2 - dire
      const q1 = query(
        collection(db, 'matches'),
        where('radiant_team_id', '==', team1Id),
        where('dire_team_id', '==', team2Id)
      );
      
      // Получаем матчи, где team1 - dire, team2 - radiant
      const q2 = query(
        collection(db, 'matches'),
        where('radiant_team_id', '==', team2Id),
        where('dire_team_id', '==', team1Id)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      matches.push(...snapshot1.docs.map(doc => ({ ...doc.data(), match_id: doc.id })));
      matches.push(...snapshot2.docs.map(doc => ({ ...doc.data(), match_id: doc.id })));

      // Сортируем по дате
      return matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting head to head matches:', error);
      throw error;
    }
  }
};

export default matchesService; 