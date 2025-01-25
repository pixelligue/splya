import React from 'react';
import { Card, Tabs, Table, Space, Typography, Statistic, Row, Col } from 'antd';
import { Line } from '@ant-design/charts';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const MatchStats = ({ match }) => {
  if (!match) return null;

  // Колонки для таблицы игроков
  const playerColumns = [
    {
      title: 'Игрок',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: 'Герой',
      dataIndex: 'hero_id',
      key: 'hero_id',
      // TODO: Добавить рендер иконки героя
    },
    {
      title: 'K/D/A',
      key: 'kda',
      render: (_, record) => `${record.kills}/${record.deaths}/${record.assists}`,
    },
    {
      title: 'GPM',
      dataIndex: 'gpm',
      key: 'gpm',
      sorter: (a, b) => a.gpm - b.gpm,
    },
    {
      title: 'XPM',
      dataIndex: 'xpm',
      key: 'xpm',
      sorter: (a, b) => a.xpm - b.xpm,
    },
    {
      title: 'Урон',
      dataIndex: 'hero_damage',
      key: 'hero_damage',
      sorter: (a, b) => a.hero_damage - b.hero_damage,
    },
    {
      title: 'Лечение',
      dataIndex: 'hero_healing',
      key: 'hero_healing',
      sorter: (a, b) => a.hero_healing - b.hero_healing,
    },
    {
      title: 'Урон по строениям',
      dataIndex: 'tower_damage',
      key: 'tower_damage',
      sorter: (a, b) => a.tower_damage - b.tower_damage,
    },
  ];

  // Конфигурация для графика нетворса
  const networthConfig = {
    data: match.team_stats.radiant.networth_graph.map((value, index) => ({
      time: index,
      team: 'Radiant',
      value: value
    })).concat(
      match.team_stats.dire.networth_graph.map((value, index) => ({
        time: index,
        team: 'Dire',
        value: value
      }))
    ),
    xField: 'time',
    yField: 'value',
    seriesField: 'team',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Продолжительность"
                value={Math.floor(match.duration / 60)}
                suffix="мин"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Счет"
                value={`${match.score[0]} : ${match.score[1]}`}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Победитель"
                value={match.winner === match.radiant_team_id ? 'Radiant' : 'Dire'}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="overview">
          <TabPane tab="Обзор" key="overview">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Графики</Title>
              <Line {...networthConfig} />
              
              <Title level={4}>Статистика команд</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Radiant">
                    <Statistic title="Убийства" value={match.team_stats.radiant.total_kills} />
                    <Statistic title="Уничтожено башен" value={match.team_stats.radiant.towers_destroyed} />
                    <Statistic title="Нетворс" value={match.team_stats.radiant.total_networth} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Dire">
                    <Statistic title="Убийства" value={match.team_stats.dire.total_kills} />
                    <Statistic title="Уничтожено башен" value={match.team_stats.dire.towers_destroyed} />
                    <Statistic title="Нетворс" value={match.team_stats.dire.total_networth} />
                  </Card>
                </Col>
              </Row>
            </Space>
          </TabPane>

          <TabPane tab="Игроки" key="players">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Radiant</Title>
              <Table 
                columns={playerColumns} 
                dataSource={Object.values(match.player_stats).filter(
                  player => player.team_id === match.radiant_team_id
                )}
                pagination={false}
              />

              <Title level={4}>Dire</Title>
              <Table 
                columns={playerColumns} 
                dataSource={Object.values(match.player_stats).filter(
                  player => player.team_id === match.dire_team_id
                )}
                pagination={false}
              />
            </Space>
          </TabPane>

          <TabPane tab="Драфт" key="draft">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Radiant Picks">
                    {match.draft.picks
                      .filter(pick => pick.team_id === match.radiant_team_id)
                      .map(pick => (
                        <div key={pick.hero_id}>
                          Hero {pick.hero_id} (Pick {pick.order})
                        </div>
                      ))
                    }
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Dire Picks">
                    {match.draft.picks
                      .filter(pick => pick.team_id === match.dire_team_id)
                      .map(pick => (
                        <div key={pick.hero_id}>
                          Hero {pick.hero_id} (Pick {pick.order})
                        </div>
                      ))
                    }
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Radiant Bans">
                    {match.draft.bans
                      .filter(ban => ban.team_id === match.radiant_team_id)
                      .map(ban => (
                        <div key={ban.hero_id}>
                          Hero {ban.hero_id} (Ban {ban.order})
                        </div>
                      ))
                    }
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Dire Bans">
                    {match.draft.bans
                      .filter(ban => ban.team_id === match.dire_team_id)
                      .map(ban => (
                        <div key={ban.hero_id}>
                          Hero {ban.hero_id} (Ban {ban.order})
                        </div>
                      ))
                    }
                  </Card>
                </Col>
              </Row>
            </Space>
          </TabPane>
        </Tabs>
      </Space>
    </Card>
  );
};

export default MatchStats; 