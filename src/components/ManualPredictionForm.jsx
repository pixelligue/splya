import React, { useEffect } from 'react';
import { Form, Input, Button, InputNumber, message } from 'antd';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ManualPredictionForm = ({ onPredictionGenerated, initialData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        team1_name: initialData.team1_name,
        team2_name: initialData.team2_name,
        tournament_name: initialData.tournament_name,
        tournament_serie: initialData.tournament_serie,
        tournament_stage: initialData.tournament_stage,
      });
    }
  }, [initialData, form]);

  const onFinish = async (values) => {
    try {
      const predictionData = {
        match_id: initialData?.match_id || `manual_${Date.now()}`,
        tournament: {
          name: values.tournament_name,
          serie: values.tournament_serie || '',
          stage: values.tournament_stage || ''
        },
        teams: [
          {
            name: values.team1_name,
            chance: values.team1_chance
          },
          {
            name: values.team2_name,
            chance: values.team2_chance
          }
        ],
        predicted_winner: values.team1_chance > values.team2_chance ? values.team1_name : values.team2_name,
        created_at: new Date().toISOString(),
        status: 'manual',
        type: 'manual'
      };

      const predictionsRef = collection(db, 'predictions');
      await addDoc(predictionsRef, predictionData);

      message.success('Прогноз успешно создан');
      form.resetFields();
      
      if (onPredictionGenerated) {
        onPredictionGenerated();
      }
    } catch (error) {
      console.error('Ошибка:', error);
      message.error('Не удалось создать прогноз');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ 
          background: '#1f1f1f',
          padding: 24,
          borderRadius: 8
        }}
      >
        <Form.Item
          name="team1_name"
          label="Команда 1"
          rules={[{ required: true, message: 'Введите название первой команды' }]}
        >
          <Input placeholder="Название первой команды" />
        </Form.Item>

        <Form.Item
          name="team1_chance"
          label="Шанс победы команды 1 (%)"
          rules={[{ required: true, message: 'Введите шанс победы' }]}
        >
          <InputNumber 
            min={0} 
            max={100} 
            style={{ width: '100%' }} 
            placeholder="Например: 60"
          />
        </Form.Item>

        <Form.Item
          name="team2_name"
          label="Команда 2"
          rules={[{ required: true, message: 'Введите название второй команды' }]}
        >
          <Input placeholder="Название второй команды" />
        </Form.Item>

        <Form.Item
          name="team2_chance"
          label="Шанс победы команды 2 (%)"
          rules={[{ required: true, message: 'Введите шанс победы' }]}
        >
          <InputNumber 
            min={0} 
            max={100} 
            style={{ width: '100%' }} 
            placeholder="Например: 40"
          />
        </Form.Item>

        <Form.Item
          name="tournament_name"
          label="Название турнира"
          rules={[{ required: true, message: 'Введите название турнира' }]}
        >
          <Input placeholder="Название турнира" />
        </Form.Item>

        <Form.Item
          name="tournament_serie"
          label="Серия турнира"
        >
          <Input placeholder="Серия турнира (необязательно)" />
        </Form.Item>

        <Form.Item
          name="tournament_stage"
          label="Стадия турнира"
        >
          <Input placeholder="Стадия турнира (необязательно)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Создать прогноз
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ManualPredictionForm; 