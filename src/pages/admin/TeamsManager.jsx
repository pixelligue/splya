import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Input, Modal, Form, Tabs, Card, Avatar, List, Tag, Progress, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined, TrophyOutlined, HistoryOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;

const TeamsManager = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [form] = Form.useForm();
  const [parsingTeam, setParsingTeam] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    country: '',
    tournament: ''
  });
  const [rawDataModalVisible, setRawDataModalVisible] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState(null);

  // Загрузка команд
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/admin/teams');
      const teamsData = response.data;
      
      // Нормализуем данные
      const normalizedTeams = teamsData.map(team => ({
        key: team.team_id,
        ...team,
        stats: {
          losses: team.stats?.losses || 0,
          first_places: team.stats?.first_places || 0
        }
      }));

      setTeams(normalizedTeams);
      message.success('Команды успешно загружены');
    } catch (error) {
      console.error('Error fetching teams:', error);
      message.error('Ошибка при загрузке команд');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Удаление команды
  const handleDelete = async (teamId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/admin/teams?id=${teamId}`);
      message.success('Команда успешно удалена');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      message.error('Ошибка при удалении команды');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация команд
  const filterTeams = (record) => {
    const matchName = record.name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchCountry = !filters.country || record.country?.toLowerCase().includes(filters.country.toLowerCase());
    const matchTournament = !filters.tournament || record.tournaments?.some(t => 
      t.name.toLowerCase().includes(filters.tournament.toLowerCase())
    );
    return matchName && matchCountry && matchTournament;
  };

  // Получение сырых данных команды
  const showRawData = async (teamId) => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/stats`);
      setSelectedTeamData(response.data);
      setRawDataModalVisible(true);
    } catch (error) {
      console.error('Error fetching team raw data:', error);
      message.error('Ошибка при получении данных команды');
    }
  };

  // Колонки таблицы
  const columns = [
    {
      title: 'Логотип',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => logo ? <Avatar src={logo} size={40} /> : '-'
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 'bold' }}>{name}</span>
          {record.country && (
            <Tag color="blue" style={{ marginTop: 4 }}>{record.country}</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Состав',
      key: 'roster',
      render: (_, record) => {
        const mainRoster = record.roster?.main || [];
        const otherRoster = record.roster?.other || [];
        return (
          <Space direction="vertical" size={4}>
            <Tag icon={<TeamOutlined />} color="blue">
              Основа: {mainRoster.length}
            </Tag>
            {mainRoster.map(player => (
              <div key={player.nickname} style={{ fontSize: '12px' }}>
                {player.nickname} {player.role && <Tag size="small">{player.role}</Tag>}
              </div>
            ))}
            {otherRoster.length > 0 && (
              <Tag icon={<TeamOutlined />} color="default">
                Запас: {otherRoster.length}
              </Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Статистика',
      key: 'stats',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Progress
            percent={Math.round((record.stats?.maps_won || 0) / (record.stats?.maps_played || 1) * 100)}
            size="small"
            format={percent => `${percent}% WR`}
          />
          <Tag color="red">
            Поражения: {record.stats?.losses || 0}
          </Tag>
          <Tag icon={<TrophyOutlined />} color="gold">
            Первые места: {record.stats?.first_places || 0}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Турниры',
      key: 'tournaments',
      render: (_, record) => {
        const tournaments = record.tournaments || [];
        const recentTournaments = tournaments.slice(0, 3);
        return (
          <Space direction="vertical" size={4}>
            <Tag icon={<HistoryOutlined />} color="purple">
              Всего: {tournaments.length}
            </Tag>
            {recentTournaments.map((tournament, index) => (
              <div key={index} style={{ fontSize: '12px' }}>
                {tournament.name}
                <br />
                <small>{tournament.date}</small>
              </div>
            ))}
          </Space>
        );
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTeam(record);
              form.setFieldsValue(record);
              setEditModalVisible(true);
            }}
          />
          <Button
            icon={<FileTextOutlined />}
            onClick={() => showRawData(record.team_id)}
          />
          <Popconfirm
            title="Удалить команду?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.team_id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleCreate = async (values) => {
    try {
      setParsingTeam(true);
      const response = await fetch('http://localhost:3001/api/admin/teams/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          pandascore_id: values.pandascore_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при создании команды');
      }

      const team = await response.json();
      message.success('Команда успешно добавлена');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchTeams();
    } catch (error) {
      console.error('Ошибка при создании команды:', error);
      message.error(error.message || 'Не удалось создать команду');
    } finally {
      setParsingTeam(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }} size="middle">
        <Search
          placeholder="Поиск по названию"
          allowClear
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
          style={{ width: 200 }}
        />
        <Search
          placeholder="Поиск по стране"
          allowClear
          value={filters.country}
          onChange={e => setFilters({ ...filters, country: e.target.value })}
          style={{ width: 200 }}
        />
        <Search
          placeholder="Поиск по турнирам"
          allowClear
          value={filters.tournament}
          onChange={e => setFilters({ ...filters, tournament: e.target.value })}
          style={{ width: 200 }}
        />
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchTeams}
          loading={loading}
        >
          Обновить
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={teams.filter(filterTeams)}
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Всего ${total} команд`
        }}
        scroll={{ x: true }}
      />

      {/* Модальное окно создания команды */}
      <Modal
        title="Добавление новой команды"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Название команды"
            rules={[{ required: true, message: 'Введите название команды' }]}
          >
            <Input placeholder="Например: Team Spirit" />
          </Form.Item>

          <Form.Item
            name="pandascore_id"
            label="ID в Pandascore"
            tooltip="ID команды из API Pandascore"
          >
            <Input placeholder="Например: 136001" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => {
              setCreateModalVisible(false);
              createForm.resetFields();
            }}>
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={parsingTeam}>
              {parsingTeam ? 'Парсинг...' : 'Добавить'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Модальное окно с сырыми данными */}
      <Modal
        title="Сырые данные команды"
        open={rawDataModalVisible}
        onCancel={() => setRawDataModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setRawDataModalVisible(false)}>
            Закрыть
          </Button>
        ]}
      >
        {selectedTeamData && (
          <div style={{ maxHeight: '600px', overflow: 'auto' }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Основная информация" key="1">
                <div style={{ marginBottom: 16 }}>
                  <h4>ID команды:</h4>
                  <pre>{selectedTeamData.team_id}</pre>
                  
                  <h4>Внешние ID:</h4>
                  <pre>{JSON.stringify(selectedTeamData.external_ids, null, 2)}</pre>
                </div>
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="Статистика" key="2">
                <pre>{JSON.stringify(selectedTeamData.stats, null, 2)}</pre>
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="Состав" key="3">
                <pre>{JSON.stringify(selectedTeamData.roster, null, 2)}</pre>
              </Tabs.TabPane>
              
              <Tabs.TabPane tab="Турниры" key="4">
                <pre>{JSON.stringify(selectedTeamData.tournaments, null, 2)}</pre>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamsManager; 