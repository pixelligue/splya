import React from 'react'
import { Form, Input, Button, Select, message } from 'antd'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import teamAnalyticsService from '../../services/teamAnalyticsService'

const MatchResultForm = ({ match, onSuccess, onCancel }) => {
  const [form] = Form.useForm()

  if (!match || !match.teams) {
    return null
  }

  const handleSubmit = async (values) => {
    try {
      const matchRef = doc(db, 'matches', match.id)
      const matchData = {
        ...match,
        status: 'finished',
        winner_id: values.winner_id,
        score: values.score,
        end_at: new Date()
      }
      
      // Обновляем матч
      await updateDoc(matchRef, matchData)
      
      // Обновляем статистику команд
      await teamAnalyticsService.updateTeamStats(values.winner_id, matchData)
      await teamAnalyticsService.updateTeamStats(
        match.teams.find(t => t.team_id !== values.winner_id).team_id, 
        matchData
      )

      message.success('Результат матча обновлен')
      onSuccess()
    } catch (error) {
      console.error('Ошибка при обновлении результата:', error)
      message.error('Ошибка при обновлении результата')
    }
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="winner_id"
        label="Победитель"
        rules={[{ required: true, message: 'Выберите победителя' }]}
      >
        <Select>
          {match.teams.map(team => (
            <Select.Option key={team.team_id} value={team.team_id}>
              {team.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="score"
        label="Счет"
        rules={[{ required: true, message: 'Введите счет' }]}
      >
        <Input placeholder="Например: 2-1" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Сохранить
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: 8 }}>
          Отмена
        </Button>
      </Form.Item>
    </Form>
  )
}

export default MatchResultForm 