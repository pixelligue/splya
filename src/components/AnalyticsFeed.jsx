import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AnalyticsFeed = ({
  title = "Аналитика матчей",
  postsLimit = 20
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // 'prediction', 'analysis', 'tournament'
    game: 'all', // 'dota2', 'csgo'
    status: 'all', // 'upcoming', 'live', 'completed'
  });

  // Загрузка постов с учетом фильтров
  const loadPosts = async () => {
    try {
      setLoading(true);
      let postsQuery = query(
        collection(db, 'analytics_posts'),
        orderBy('createdAt', 'desc'),
        limit(postsLimit)
      );

      // Применяем фильтры
      if (filters.type !== 'all') {
        postsQuery = query(postsQuery, where('type', '==', filters.type));
      }
      if (filters.game !== 'all') {
        postsQuery = query(postsQuery, where('game', '==', filters.game));
      }
      if (filters.status !== 'all') {
        postsQuery = query(postsQuery, where('matchData.status', '==', filters.status));
      }

      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPosts(postsData);
    } catch (error) {
      console.error('Ошибка при загрузке постов:', error);
      toast.error('Не удалось загрузить посты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filters]);

  // Компонент фильтров
  const FilterBar = () => (
    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
      {/* Тип контента */}
      <select
        value={filters.type}
        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        className="bg-[#2C2C2E] text-white px-4 py-2 rounded-lg border border-zinc-700/50"
      >
        <option value="all">Все типы</option>
        <option value="prediction">Прогнозы</option>
        <option value="analysis">Анализ</option>
        <option value="tournament">Турниры</option>
      </select>

      {/* Игра */}
      <select
        value={filters.game}
        onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
        className="bg-[#2C2C2E] text-white px-4 py-2 rounded-lg border border-zinc-700/50"
      >
        <option value="all">Все игры</option>
        <option value="dota2">Dota 2</option>
        <option value="csgo">CS:GO</option>
      </select>

      {/* Статус матча */}
      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="bg-[#2C2C2E] text-white px-4 py-2 rounded-lg border border-zinc-700/50"
      >
        <option value="all">Любой статус</option>
        <option value="upcoming">Предстоящие</option>
        <option value="live">Live</option>
        <option value="completed">Завершенные</option>
      </select>
    </div>
  );

  // Компонент поста с аналитикой
  const AnalyticsPost = ({ post }) => (
    <div className="bg-[#1C1C1E]/80 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
      {/* Данные матча */}
      {post.matchData && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white font-medium text-lg">
              {post.matchData.teams[0].name} vs {post.matchData.teams[1].name}
            </div>
            <div className={`px-3 py-1 rounded-lg text-sm ${
              post.matchData.status === 'live' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : post.matchData.status === 'upcoming'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/50'
            }`}>
              {post.matchData.status === 'live' ? 'LIVE' 
                : post.matchData.status === 'upcoming' ? 'Скоро' 
                : 'Завершен'}
            </div>
          </div>
          <div className="text-sm text-zinc-400">
            {post.matchData.tournament.name} • {new Date(post.matchData.begin_at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Прогноз */}
      {post.type === 'prediction' && post.matchData?.prediction && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-[#2C2C2E]/50 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-1">Прогноз AI</div>
            <div className="text-white font-medium">
              Победа: {post.matchData.prediction.winner}
            </div>
          </div>
          <div className="bg-[#2C2C2E]/50 rounded-xl p-4">
            <div className="text-sm text-zinc-400 mb-1">Уверенность</div>
            <div className="text-white font-medium">
              {post.matchData.prediction.confidence}%
            </div>
          </div>
        </div>
      )}

      {/* Контент */}
      <div className="prose prose-invert max-w-none">
        {post.content}
      </div>

      {/* Метаданные */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.metadata.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-[#2C2C2E]/50 rounded-lg text-sm text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-zinc-500">
          {new Date(post.createdAt?.toDate()).toLocaleString()}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-2rem)]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/50 -mx-4 px-4 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-medium text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Фильтры */}
      <div className="mt-6 mb-8">
        <FilterBar />
      </div>

      {/* Список постов */}
      <div className="space-y-6">
        {posts.map(post => (
          <AnalyticsPost key={post.id} post={post} />
        ))}
      </div>

      {/* Пустое состояние */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#1C1C1E]/80 rounded-2xl border border-zinc-800/50">
          <div className="text-zinc-400 text-lg mb-2">Нет доступных постов</div>
          <div className="text-zinc-500 text-sm">Измените параметры фильтрации</div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFeed; 