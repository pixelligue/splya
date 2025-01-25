import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const now = new Date();
      
      const matchesQuery = query(
        collection(db, 'matches'),
        where('startTime', '>=', now),
        orderBy('startTime', 'asc')
      );

      const querySnapshot = await getDocs(matchesQuery);
      const matchesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMatches(matchesData);
    } catch (error) {
      console.error('Ошибка при загрузке матчей:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (startTime) => {
    const now = new Date();
    const matchTime = new Date(startTime.toDate());
    
    if (matchTime > now) {
      return 'upcoming';
    }
    return 'live';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Предстоящие матчи</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(match => (
            <Link 
              key={match.id} 
              to={`/dashboard/live/${match.id}`}
              className="block bg-[#1C1C1E]/80 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/50 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-zinc-400 text-sm">
                  {format(match.startTime.toDate(), 'd MMMM, HH:mm', { locale: ru })}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  getMatchStatus(match.startTime) === 'live'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {getMatchStatus(match.startTime) === 'live' ? 'LIVE' : 'Скоро'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={match.team1Logo} 
                    alt={match.team1Name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{match.team1Name}</span>
                </div>
                <span className="text-zinc-400">vs</span>
                <div className="flex items-center space-x-3">
                  <span className="text-white font-medium">{match.team2Name}</span>
                  <img 
                    src={match.team2Logo} 
                    alt={match.team2Name}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-zinc-400">
                  {match.tournament}
                </div>
                <div className="text-zinc-400">
                  BO{match.format}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          Нет предстоящих матчей
        </div>
      )}
    </div>
  );
};

export default Matches; 