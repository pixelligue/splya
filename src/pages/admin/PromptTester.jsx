import React, { useState } from 'react';
import { Button, Form, Input, Card, Spin, message, Tabs, Select, Space } from 'antd';

const { TabPane } = Tabs;

const PromptTester = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [team1Options, setTeam1Options] = useState([]);
  const [team2Options, setTeam2Options] = useState([]);
  const [team1Data, setTeam1Data] = useState(null);
  const [team2Data, setTeam2Data] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Поиск команд
  const searchTeams = async (query, isTeam1 = true) => {
    if (!query || query.length < 2) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teams/search?name=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Ошибка при поиске команд');
      
      const data = await response.json();
      console.log('Результаты поиска команд:', data);
      
      const options = data.map(team => ({
        label: team.name,
        value: team.id,
        data: team
      }));

      if (isTeam1) {
        setTeam1Options(options);
      } else {
        setTeam2Options(options);
      }
    } catch (error) {
      console.error('Ошибка при поиске команд:', error);
      message.error('Не удалось найти команды');
    } finally {
      setSearchLoading(false);
    }
  };

  // Получение статистики команды
  const fetchTeamStats = async (teamId, isTeam1 = true) => {
    try {
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/stats`);
      if (!response.ok) throw new Error('Ошибка при получении статистики');
      
      const data = await response.json();
      console.log('Получена статистика команды:', data);
      
      if (!data.success) throw new Error('Не удалось получить статистику команды');

      if (isTeam1) {
        setTeam1Data(data.data);
      } else {
        setTeam2Data(data.data);
      }
      message.success(`Статистика ${isTeam1 ? 'первой' : 'второй'} команды получена`);
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      message.error('Не удалось получить статистику команды');
    }
  };

  // Генерация прогноза
  const generatePrediction = async () => {
    if (!team1Data || !team2Data) {
      message.error('Необходимо получить статистику обеих команд');
      return;
    }

    setLoading(true);
    try {
      const matchData = {
        match_info: {
          tournament: {
            name: form.getFieldValue('tournament'),
          },
          begin_at: new Date().toISOString()
        },
        team1: team1Data,
        team2: team2Data
      };

      console.log('Отправляем данные для прогноза:', matchData);

      const response = await fetch('http://localhost:3001/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при получении прогноза');
      }
      
      const result = await response.json();
      console.log('Получен результат прогноза:', result);
      
      setPrediction(result);
      message.success('Прогноз успешно получен');
    } catch (error) {
      console.error('Ошибка при генерации прогноза:', error);
      message.error(error.message || 'Не удалось получить прогноз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Тестирование прогнозов</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Выбор команд и турнира">
            <Form form={form} layout="vertical">
              <Form.Item label="Команда 1" required>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Select
                    showSearch
                    placeholder="Поиск первой команды"
                    loading={searchLoading}
                    options={team1Options}
                    onSearch={(value) => searchTeams(value, true)}
                    onChange={(value, option) => {
                      fetchTeamStats(value, true);
                    }}
                    filterOption={false}
                    style={{ width: '100%' }}
                  />
                </Space>
              </Form.Item>

              <Form.Item label="Команда 2" required>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Select
                    showSearch
                    placeholder="Поиск второй команды"
                    loading={searchLoading}
                    options={team2Options}
                    onSearch={(value) => searchTeams(value, false)}
                    onChange={(value, option) => {
                      fetchTeamStats(value, false);
                    }}
                    filterOption={false}
                    style={{ width: '100%' }}
                  />
                </Space>
              </Form.Item>

              <Form.Item
                name="tournament"
                label="Турнир"
                rules={[{ required: true, message: 'Введите название турнира' }]}
              >
                <Input placeholder="Например: The International 2023" />
              </Form.Item>
            </Form>

            <Button 
              type="primary" 
              onClick={generatePrediction}
              loading={loading}
              disabled={!team1Data || !team2Data}
            >
              Сгенерировать прогноз
            </Button>
          </Card>

          {prediction && (
            <Card title="Результат прогноза">
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Победитель:</div>
                  <div>{prediction.prediction}</div>
                </div>
                <div>
                  <div className="font-medium">Уверенность:</div>
                  <div>{prediction.confidence}%</div>
                </div>
                <div>
                  <div className="font-medium">Объяснение:</div>
                  <div className="whitespace-pre-wrap">{prediction.explanation}</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {(team1Data || team2Data) && (
            <Tabs defaultActiveKey="1">
              {team1Data && (
                <TabPane tab="Команда 1" key="1">
                  <Card title={team1Data.name}>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium">ID команды:</div>
                        <div>{team1Data.team_id}</div>
                      </div>
                      <div>
                        <div className="font-medium">Внешние ID:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team1Data.external_ids, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Статистика:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team1Data.stats, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Состав:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team1Data.roster, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Турниры:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team1Data.tournaments, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Card>
                </TabPane>
              )}
              
              {team2Data && (
                <TabPane tab="Команда 2" key="2">
                  <Card title={team2Data.name}>
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium">ID команды:</div>
                        <div>{team2Data.team_id}</div>
                      </div>
                      <div>
                        <div className="font-medium">Внешние ID:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team2Data.external_ids, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Статистика:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team2Data.stats, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Состав:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team2Data.roster, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="font-medium">Турниры:</div>
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(team2Data.tournaments, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Card>
                </TabPane>
              )}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTester; 