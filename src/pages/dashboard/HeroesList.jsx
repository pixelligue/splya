import React, { useEffect, useState } from 'react'
import { pushrApiService } from '../../services/pushrApiService'
import { heroesService } from '../../services/heroesService'
import { message } from 'antd'

const HeroesList = () => {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true)
        let allHeroes = []
        let page = 1

        while (true) {
          try {
            console.log(`Загрузка страницы ${page} героев...`)
            const response = await pushrApiService.heroes.getAll({ 
              per_page: 100,
              page: page
            })
            
            if (response && response.length > 0) {
              allHeroes = [...allHeroes, ...response]
              page++
            } else {
              break
            }
          } catch (error) {
            if (error.response && error.response.status === 400) {
              break
            }
            throw error
          }
        }
        
        console.log(`Всего получено ${allHeroes.length} героев`)
        
        // Сортируем героев по ID
        const sortedHeroes = allHeroes.sort((a, b) => 
          parseInt(a.hero_id) - parseInt(b.hero_id)
        )
        
        // Сохраняем героев в Firebase
        await heroesService.saveHeroesFromWordPress(sortedHeroes)
        message.success(`Сохранено ${sortedHeroes.length} героев в базе данных`)
        
        setHeroes(sortedHeroes)
      } catch (error) {
        console.error('Ошибка при загрузке героев:', error)
        setError('Не удалось загрузить список героев')
        message.error('Ошибка при сохранении героев в базе данных')
      } finally {
        setLoading(false)
      }
    }

    fetchHeroes()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Список героев</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroes.map(hero => (
          <div key={hero.id} className="bg-[#2C2C2E] p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-medium">{hero.title.rendered}</div>
                <div className="text-sm text-zinc-400">ID: {hero.hero_id}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Slug: {hero.slug.replace('npc_dota_hero_', '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroesList 