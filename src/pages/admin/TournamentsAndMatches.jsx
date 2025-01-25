import React, { useState, useEffect } from 'react'
import { Card, Table, Tabs, Button, Spin, Tag, Modal, Input, message, Popconfirm, Space } from 'antd'
import { collection, query, getDocs, where, orderBy, doc, updateDoc, serverTimestamp, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { pandaScoreService } from '../../services/pandaScoreService'
import MatchResultForm from './MatchResultForm'
import teamAnalyticsService from '../../services/teamAnalyticsService'

const TournamentsAndMatches = () => {
  const [tournaments, setTournaments] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [predictedMatches, setPredictedMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [resultModalVisible, setResultModalVisible] = useState(false)

  // Загрузка матчей с прогнозами
  const fetchPredictedMatches = async () => {
    try {
      setLoading(true)
      const predictionsRef = collection(db, 'predictions')
      const q = query(
        predictionsRef,
        orderBy('startTime', 'desc')
      )
      const snapshot = await getDocs(q)
      
      const matches = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          matchId: data.matchId,
          tournament: data.tournament,
          team1: data.team1,
          team2: data.team2,
          format: data.format || 'BO3',
          startTime: data.startTime?.toDate?.() || new Date(data.startTime),
          startTimeFormatted: new Date(data.startTime?.toDate?.() || data.startTime).toLocaleString(),
          prediction: data.prediction,
          confidence: data.confidence,
          status: data.status,
          result: data.result,
          score: data.score,
          predictionCorrect: data.predictionCorrect,
          detailed_stats: data.detailed_stats,
          game: data.game || 'dota2'
        }
      })
      
      setPredictedMatches(matches)
    } catch (error) {
      console.error('Ошибка при загрузке матчей с прогнозами:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка турниров
  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const tournamentsData = await pandaScoreService.getActiveTournaments()
      setTournaments(tournamentsData)
    } catch (error) {
      console.error('Ошибка при загрузке турниров:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка предстоящих матчей
  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true)
      const matchesData = await pandaScoreService.getUpcomingDota2Matches()
      setUpcomingMatches(matchesData)
    } catch (error) {
      console.error('Ошибка при загрузке предстоящих матчей:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchTournaments()
    fetchUpcomingMatches()
    fetchPredictedMatches()
  }, [])

  // Автообновление каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPredictedMatches()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Колонки для таблицы турниров
  const tournamentColumns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Призовой фонд',
      dataIndex: 'prize_pool',
      key: 'prize_pool',
      render: (prize_pool) => prize_pool ? `$${prize_pool.toLocaleString()}` : 'Не указан'
    },
    {
      title: 'Тир',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier) => <Tag color={tier === 'S' ? 'gold' : tier === 'A' ? 'blue' : 'green'}>{tier}</Tag>
    }
  ]

  // Колонки для таблицы матчей
  const matchColumns = [
    {
      title: 'Турнир',
      dataIndex: 'tournament',
      key: 'tournament'
    },
    {
      title: 'Команда 1',
      dataIndex: ['radiant_team', 'name'],
      key: 'team1'
    },
    {
      title: 'Команда 2',
      dataIndex: ['dire_team', 'name'],
      key: 'team2'
    },
    {
      title: 'Формат',
      dataIndex: 'format',
      key: 'format'
    },
    {
      title: 'Дата',
      dataIndex: 'start_time_formatted',
      key: 'start_time',
      sorter: (a, b) => new Date(a.start_time) - new Date(b.start_time)
    }
  ]

  // Колонки для матчей с прогнозами
  const predictedMatchColumns = [
    {
      title: 'ID',
      dataIndex: 'matchId',
      key: 'matchId',
      width: 100,
    },
    {
      title: 'Турнир',
      dataIndex: 'tournament',
      key: 'tournament',
      width: 200,
    },
    {
      title: 'Команды',
      key: 'teams',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Tag color={record.prediction === 'team1' ? 'green' : 'default'}>
              {record.team1}
            </Tag>
          </div>
          <div>
            <Tag color={record.prediction === 'team2' ? 'green' : 'default'}>
              {record.team2}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Формат',
      dataIndex: 'format',
      key: 'format',
      width: 100,
    },
    {
      title: 'Дата',
      dataIndex: 'startTimeFormatted',
      key: 'startTime',
      width: 180,
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime)
    },
    {
      title: 'Прогноз',
      key: 'prediction',
      width: 200,
      render: (_, record) => (
        <div>
          <Tag color="blue">
            {record.prediction === 'team1' ? record.team1 : record.team2}
          </Tag>
          <div style={{ marginTop: 4 }}>
            <Tag color="orange">
              {Math.round(record.confidence * 100)}%
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Результат',
      key: 'result',
      width: 150,
      render: (_, record) => (
        <div>
          {record.score && (
            <Tag color={record.predictionCorrect ? 'green' : 'red'}>
              {record.score}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Статус',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={
          record.status === 'live' ? 'green' : 
          record.status === 'finished' ? 'blue' :
          'orange'
        }>
          {record.status === 'live' ? 'LIVE' : 
           record.status === 'finished' ? 'Завершен' : 
           'Ожидание'}
        </Tag>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary"
            onClick={() => {
              setSelectedMatch(record)
              setResultModalVisible(true)
            }}
            disabled={record.status === 'finished'}
          >
            Ввести результат
          </Button>
          <Popconfirm
            title="Удалить матч?"
            description="Вы уверены, что хотите удалить этот матч?"
            onConfirm={() => handleDeleteMatch(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="primary" danger>
              Удалить
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  const items = [
    {
      key: 'predicted',
      label: 'Матчи с прогнозами',
      children: (
        <Table
          dataSource={predictedMatches}
          columns={predictedMatchColumns}
          rowKey={(record) => record.matchId}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1300 }}
          size="small"
        />
      )
    },
    {
      key: 'tournaments',
      label: 'Турниры',
      children: (
        <Table
          dataSource={tournaments}
          columns={tournamentColumns}
          rowKey={(record) => record.name + record.start_timestamp}
          pagination={{ pageSize: 50 }}
        />
      )
    },
    {
      key: 'upcoming',
      label: 'Предстоящие матчи',
      children: (
        <Table
          dataSource={upcomingMatches}
          columns={matchColumns}
          rowKey={(record) => record.match_id || `${record.radiant_team.name}-${record.dire_team.name}-${record.start_time}`}
          pagination={{ pageSize: 50 }}
        />
      )
    }
  ]

  const handleManualResult = async (result) => {
    try {
      if (!selectedMatch) return

      const predictionRef = doc(db, 'predictions', selectedMatch.id)
      
      // Определяем, был ли прогноз верным
      let predictionCorrect = false
      if (selectedMatch.prediction === 'team1' && result.score.team1 > result.score.team2) {
        predictionCorrect = true
      } else if (selectedMatch.prediction === 'team2' && result.score.team2 > result.score.team1) {
        predictionCorrect = true
      }
      
      await updateDoc(predictionRef, {
        score: `${result.score.team1}:${result.score.team2}`,
        result: true,
        winner: result.winner,
        predictionCorrect,
        status: 'finished',
        detailed_stats: result.detailed_stats,
        updatedAt: serverTimestamp()
      })

      message.success('Результат матча обновлен')
      setResultModalVisible(false)
      setSelectedMatch(null)
      fetchPredictedMatches() // Обновляем список матчей
    } catch (error) {
      console.error('Ошибка при сохранении результата:', error)
      message.error('Ошибка при сохранении результата')
    }
  }

  // Функция удаления матча
  const handleDeleteMatch = async (matchId) => {
    try {
      setLoading(true)
      const predictionRef = doc(db, 'predictions', matchId)
      await deleteDoc(predictionRef)
      message.success('Матч успешно удален')
      fetchPredictedMatches() // Обновляем список матчей
    } catch (error) {
      console.error('Ошибка при удалении матча:', error)
      message.error('Ошибка при удалении матча')
    } finally {
      setLoading(false)
    }
  }

  // Создание нового матча
  const handleCreateMatch = async (matchData) => {
    try {
      const matchRef = await addDoc(collection(db, 'matches'), {
        ...matchData,
        status: 'upcoming',
        created_at: serverTimestamp()
      })

      // Обновляем статистику команд
      await teamAnalyticsService.updateTeamsForNewMatch({
        id: matchRef.id,
        ...matchData
      })

      message.success('Матч успешно создан')
      fetchUpcomingMatches()
    } catch (error) {
      console.error('Ошибка при создании матча:', error)
      message.error('Ошибка при создании матча')
    }
  }

  // Обновление результата матча
  const handleUpdateMatchResult = async (matchId, result) => {
    try {
      const matchRef = doc(db, 'matches', matchId)
      const matchData = {
        status: 'finished',
        winner_id: result.winner_id,
        score: result.score,
        end_at: serverTimestamp()
      }

      await updateDoc(matchRef, matchData)

      // Обновляем статистику команд
      await teamAnalyticsService.updateTeamStats(result.winner_id, {
        id: matchId,
        ...matchData
      })

      message.success('Результат матча обновлен')
      fetchPredictedMatches()
    } catch (error) {
      console.error('Ошибка при обновлении результата:', error)
      message.error('Ошибка при обновлении результата')
    }
  }

  return (
    <Spin spinning={loading}>
      <Card title="Профессиональные турниры и матчи">
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            onClick={() => {
              fetchTournaments()
              fetchUpcomingMatches()
              fetchPredictedMatches()
            }}
          >
            Обновить данные
          </Button>
          <Popconfirm
            title="Удалить все матчи?"
            description="Вы уверены, что хотите удалить все матчи? Это действие нельзя отменить."
            onConfirm={async () => {
              try {
                setLoading(true)
                await pandaScoreService.deleteAllMatches()
                message.success('Все матчи успешно удалены')
                fetchUpcomingMatches()
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
                fetchUpcomingMatches()
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
        <Tabs defaultActiveKey="predicted" items={items} />

        <MatchResultForm
          match={selectedMatch}
          onSuccess={() => {
            setResultModalVisible(false)
            setSelectedMatch(null)
            fetchPredictedMatches()
          }}
          onCancel={() => {
            setResultModalVisible(false)
            setSelectedMatch(null)
          }}
        />
      </Card>
    </Spin>
  )
}

export default TournamentsAndMatches 