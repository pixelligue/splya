import { teamDataService } from '../services/teamDataService.js'

// Список топовых команд для первоначального заполнения
const TOP_TEAMS = [
  { id: '1883502', name: 'Team Spirit', tag: 'TS' },
  { id: '8605863', name: 'Gaimin Gladiators', tag: 'GG' },
  { id: '8254400', name: 'Team Liquid', tag: 'Liquid' },
  { id: '8687717', name: 'BetBoom Team', tag: 'BB' },
  { id: '8944440', name: '9Pandas', tag: '9P' },
  { id: '8376426', name: 'Tundra Esports', tag: 'Tundra' },
  { id: '8255756', name: 'Entity', tag: 'Entity' },
  { id: '8599101', name: 'Virtus.pro', tag: 'VP' },
  { id: '8291895', name: 'PSG.LGD', tag: 'PSG.LGD' },
  { id: '8261500', name: 'Evil Geniuses', tag: 'EG' }
]

const updateTeams = async () => {
  try {
    console.log('Начинаем обновление данных команд...')
    
    const results = await teamDataService.updateAllTeams(TOP_TEAMS)
    
    console.log('\nОбновление завершено:')
    console.log(`Успешно: ${results.success.length}`)
    console.log(`Ошибок: ${results.failed.length}`)
    
    if (results.failed.length > 0) {
      console.log('\nСписок ошибок:')
      results.failed.forEach(team => {
        console.log(`${team.name}: ${team.error}`)
      })
    }
    
    return results
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error)
    throw error
  }
}

// Запускаем скрипт
updateTeams()
  .then(() => {
    console.log('Скрипт успешно завершен')
    process.exit(0)
  })
  .catch(error => {
    console.error('Ошибка при выполнении скрипта:', error)
    process.exit(1)
  }) 