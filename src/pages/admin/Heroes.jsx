import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { heroesService } from '../../services/heroesService';

export default function Heroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadHeroes = async () => {
    try {
      setLoading(true);
      const data = await heroesService.getHeroesFromFirebase();
      console.log('Полученные данные:', data);
      setHeroes(data);
      setError('');
    } catch (err) {
      console.error('Полная ошибка:', err);
      setError('Ошибка при загрузке героев: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setInitializing(true);
      await heroesService.initializeHeroesDatabase();
      await loadHeroes();
    } catch (err) {
      setError('Ошибка при инициализации базы данных');
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  const deleteAllHeroes = async () => {
    try {
      setDeleting(true);
      await heroesService.deleteAllHeroes();
      await loadHeroes();
    } catch (err) {
      setError('Ошибка при удалении героев: ' + err.message);
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    console.log('Heroes component mounted');
    loadHeroes();
  }, []);

  useEffect(() => {
    console.log('Heroes state updated:', { heroes, loading, error });
  }, [heroes, loading, error]);

  const getAttrColor = (attr) => {
    switch (attr) {
      case 'str': return 'red';
      case 'agi': return 'green';
      case 'int': return 'blue';
      case 'all': return 'purple';
      default: return 'black';
    }
  };

  const getAttrName = (attr) => {
    switch (attr) {
      case 'str': return 'Сила';
      case 'agi': return 'Ловкость';
      case 'int': return 'Интеллект';
      case 'all': return 'Универсальный';
      default: return attr;
    }
  };

  const columns = [
    {
      title: 'Герой',
      dataIndex: 'localizedName',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Атрибут',
      dataIndex: 'primaryAttr',
      key: 'primaryAttr',
      render: (attr) => (
        <span style={{ color: getAttrColor(attr) }}>
          {getAttrName(attr)}
        </span>
      ),
    },
    {
      title: 'Тип атаки',
      dataIndex: 'attackType',
      key: 'attackType',
      render: (type) => type === 'Melee' ? 'Ближний' : 'Дальний',
    },
    {
      title: 'Роли',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => roles?.join(', '),
    },
    {
      title: 'Последнее обновление',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'Никогда',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Link to={`/admin/heroes/${record.id}`} className="text-blue-500 hover:text-blue-700">
          Подробнее
        </Link>
      ),
    },
  ];

  return (
    <Card 
      title="База героев Dota 2" 
      extra={
        <div className="flex items-center gap-4">
          <div>Всего героев: {heroes.length}</div>
          <Button 
            type="primary"
            onClick={initializeDatabase}
            loading={initializing}
          >
            Реинициализировать базу
          </Button>
          <Button 
            type="primary"
            danger
            onClick={deleteAllHeroes}
            loading={deleting}
          >
            Удалить всех героев
          </Button>
        </div>
      }
    >
      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Table
        dataSource={heroes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </Card>
  );
} 