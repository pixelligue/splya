import React, { useState, useEffect } from 'react';
import { Space, Button, message, Input, Select, DatePicker, Tabs, Popconfirm } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import UpcomingMatchesList from '../../components/UpcomingMatchesList';
import PredictionCard from '../../components/PredictionCard';
import ManualPredictionForm from '../../components/ManualPredictionForm';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { pandaScoreService } from '../../services/pandaScoreService';

const { Search } = Input;
const { Option } = Select;

const PredictionsManager = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPrediction, setGeneratingPrediction] = useState(false);
  const [activeTab, setActiveTab] = useState('auto');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    tournament: 'all',
    status: 'all',
    date: null
  });

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const predictionsRef = collection(db, 'predictions');
      const q = query(predictionsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const predictionsData = [];
      querySnapshot.forEach((doc) => {
        predictionsData.push({ id: doc.id, ...doc.data() });
      });
      
      setPredictions(predictionsData);
      message.success('Прогнозы успешно загружены');
    } catch (error) {
      console.error('Ошибка при загрузке прогнозов:', error);
      message.error('Не удалось загрузить прогнозы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handlePredictionGenerated = async (matchData) => {
    await fetchPredictions();
  };

  const handleManualPrediction = (matchData) => {
    setSelectedMatch(matchData);
    setActiveTab('manual');
  };

  // Фильтрация прогнозов
  const filterPredictions = (prediction) => {
    const matchesSearch = filters.search === '' || 
      prediction.teams?.[0]?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      prediction.teams?.[1]?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      prediction.tournament?.name?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesTournament = filters.tournament === 'all' || 
      prediction.tournament?.name === filters.tournament;

    const matchesStatus = filters.status === 'all' || 
      prediction.status === filters.status;

    const matchesDate = !filters.date || 
      new Date(prediction.created_at).toDateString() === filters.date.toDate().toDateString();

    return matchesSearch && matchesTournament && matchesStatus && matchesDate;
  };

  // Получение уникальных турниров
  const tournaments = [...new Set(predictions.map(p => p.tournament?.name))].filter(Boolean);

  const items = [
    {
      key: 'auto',
      label: 'Автоматические прогнозы',
      children: (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Доступные матчи</h2>
          <UpcomingMatchesList 
            onPredictionCreated={handlePredictionGenerated}
            adminMode={true}
            isGenerating={generatingPrediction}
            onManualPrediction={handleManualPrediction}
          />
        </div>
      )
    },
    {
      key: 'manual',
      label: 'Ручное создание',
      children: <ManualPredictionForm 
        onPredictionGenerated={fetchPredictions} 
        initialData={selectedMatch}
      />
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 16 }}>Управление прогнозами</h1>
        
        {/* Фильтры и кнопки управления */}
        <div style={{ 
          padding: 16, 
          background: '#1f1f1f', 
          borderRadius: 8,
          marginBottom: 24
        }}>
          <Space wrap size="middle">
            <Search
              placeholder="Поиск по командам или турниру"
              allowClear
              style={{ width: 300 }}
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Select
              style={{ width: 200 }}
              value={filters.tournament}
              onChange={value => setFilters({ ...filters, tournament: value })}
            >
              <Option value="all">Все турниры</Option>
              {tournaments.map(tournament => (
                <Option key={tournament} value={tournament}>{tournament}</Option>
              ))}
            </Select>

            <Select
              style={{ width: 150 }}
              value={filters.status}
              onChange={value => setFilters({ ...filters, status: value })}
            >
              <Option value="all">Все статусы</Option>
              <Option value="pending">Ожидание</Option>
              <Option value="completed">Завершённые</Option>
            </Select>

            <DatePicker
              placeholder="Фильтр по дате"
              onChange={date => setFilters({ ...filters, date })}
              allowClear
            />

            <Button 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchPredictions}
              loading={loading}
            >
              Обновить
            </Button>

            <Popconfirm
              title="Удалить все матчи?"
              description="Вы уверены, что хотите удалить все матчи? Это действие нельзя отменить."
              onConfirm={async () => {
                try {
                  setLoading(true)
                  await pandaScoreService.deleteAllMatches()
                  message.success('Все матчи успешно удалены')
                  fetchPredictions()
                } catch (error) {
                  console.error('Ошибка при удалении матчей:', error)
                  message.error('Ошибка при удалении матчей')
                } finally {
                  setLoading(false)
                }
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Button type="primary" danger>
                Удалить все матчи
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Обновить матчи из PandaScore?"
              description="Это действие удалит все существующие матчи и загрузит новые из PandaScore, проверив их наличие в Pushr API."
              onConfirm={async () => {
                try {
                  setLoading(true)
                  // Сначала удаляем все матчи
                  await pandaScoreService.deleteAllMatches()
                  message.success('Существующие матчи удалены')
                  
                  // Загружаем новые матчи из PandaScore
                  const matchesData = await pandaScoreService.getUpcomingMatches(50)
                  if (matchesData && matchesData.length > 0) {
                    message.success(`Загружено ${matchesData.length} новых матчей`)
                  } else {
                    message.warning('Нет новых матчей для загрузки')
                  }
                  
                  // Обновляем список
                  fetchPredictions()
                } catch (error) {
                  console.error('Ошибка при обновлении матчей:', error)
                  message.error('Ошибка при обновлении матчей из PandaScore')
                } finally {
                  setLoading(false)
                }
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Button type="primary" style={{ background: '#722ed1' }}>
                Обновить из PandaScore
              </Button>
            </Popconfirm>
          </Space>
        </div>

        {/* Табы */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items} 
        />

        {/* Список прогнозов */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16 
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>Сгенерированные прогнозы</h2>
            <div style={{ 
              padding: '4px 12px', 
              background: '#1f1f1f', 
              borderRadius: 16,
              fontSize: 14 
            }}>
              {predictions.filter(filterPredictions).length}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {predictions.filter(filterPredictions).map(prediction => (
              <PredictionCard 
                key={prediction.id}
                prediction={prediction}
                isAdmin={true}
                onUpdate={fetchPredictions}
              />
            ))}
          </div>

          {predictions.filter(filterPredictions).length === 0 && (
            <div style={{ 
              padding: 32,
              textAlign: 'center',
              background: '#1f1f1f',
              borderRadius: 8,
              color: '#666'
            }}>
              Нет прогнозов, соответствующих фильтрам
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionsManager; 