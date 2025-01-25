import React, { useState } from 'react'
import { Button, Card, Space, Spin, Typography } from 'antd'
import { pushrApiService } from '../services/pushrApiService'

const { Title, Text } = Typography

const ApiTest = () => {
  const [loading, setLoading] = useState({})
  const [results, setResults] = useState({})

  const testEndpoint = async (name, func) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    try {
      const data = await func()
      console.log(`${name} response:`, data)
      setResults(prev => ({ 
        ...prev, 
        [name]: {
          success: true,
          data: data
        }
      }))
    } catch (error) {
      console.error(`${name} error:`, error)
      setResults(prev => ({ 
        ...prev, 
        [name]: {
          success: false,
          error: error.message
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const tests = [
    {
      name: 'Получение матчей',
      func: () => pushrApiService.matches.getAll()
    },
    {
      name: 'Получение команд',
      func: () => pushrApiService.teams.getAll()
    },
    {
      name: 'Получение игроков',
      func: () => pushrApiService.players.getAll()
    },
    {
      name: 'Получение турниров',
      func: () => pushrApiService.tournaments.getAll()
    },
    {
      name: 'Получение героев',
      func: () => pushrApiService.heroes.getAll()
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Тестирование API</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {tests.map(test => (
          <Card 
            key={test.name}
            title={test.name}
            extra={
              <Button 
                type="primary" 
                onClick={() => testEndpoint(test.name, test.func)}
                loading={loading[test.name]}
              >
                Проверить
              </Button>
            }
          >
            {loading[test.name] ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : results[test.name] ? (
              <div>
                <Text type={results[test.name].success ? 'success' : 'danger'}>
                  {results[test.name].success ? 'Успешно' : 'Ошибка'}
                </Text>
                <pre style={{ 
                  marginTop: 16,
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(
                    results[test.name].success ? 
                      results[test.name].data : 
                      results[test.name].error, 
                    null, 
                    2
                  )}
                </pre>
              </div>
            ) : (
              <Text type="secondary">Нажмите кнопку для проверки</Text>
            )}
          </Card>
        ))}
      </Space>
    </div>
  )
}

export default ApiTest 