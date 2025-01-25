import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { heroesService } from '../../../services/heroesService';

interface Talent {
  left: string;
  right: string;
  level: number;
}

interface Ability {
  name: string;
  description: string;
  target?: string;
  type?: string;
  isUltimate: boolean;
  stats: Record<string, string>;
  notes: string[];
}

interface HeroStats {
  baseStr: number;
  baseAgi: number;
  baseInt: number;
  strGain: number;
  agiGain: number;
  intGain: number;
  moveSpeed: number;
  armor: number;
  attackRange: number;
  attackDamageMin: number;
  attackDamageMax: number;
  attackRate: number;
}

interface Hero {
  id: string;
  name: string;
  localizedName: string;
  description: string;
  attackType: string;
  primaryAttr: string;
  roles: string[];
  stats: HeroStats;
  abilities: Ability[];
  talents: Talent[];
  updatedAt: Date | null;
}

const HeroDetails = () => {
  const { id } = useParams();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const heroData = await heroesService.getHeroById(id);
        setHero(heroData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, [id]);

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">Ошибка: {error}</div>;
  if (!hero) return <div className="p-6">Герой не найден</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{hero.localizedName}</h1>
        
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Основная информация</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Тип атаки:</span> {hero.attackType}</li>
              <li><span className="font-medium">Основной атрибут:</span> {hero.primaryAttr}</li>
              <li><span className="font-medium">Роли:</span> {hero.roles.join(', ')}</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Характеристики</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Сила:</span> {hero.stats.baseStr} + {hero.stats.strGain}</li>
              <li><span className="font-medium">Ловкость:</span> {hero.stats.baseAgi} + {hero.stats.agiGain}</li>
              <li><span className="font-medium">Интеллект:</span> {hero.stats.baseInt} + {hero.stats.intGain}</li>
              <li><span className="font-medium">Скорость:</span> {hero.stats.moveSpeed}</li>
              <li><span className="font-medium">Броня:</span> {hero.stats.armor}</li>
              <li><span className="font-medium">Урон:</span> {hero.stats.attackDamageMin}-{hero.stats.attackDamageMax}</li>
              <li><span className="font-medium">Скорость атаки:</span> {hero.stats.attackRate}</li>
              <li><span className="font-medium">Дальность атаки:</span> {hero.stats.attackRange}</li>
            </ul>
          </div>
        </div>

        {/* Способности */}
        {hero.abilities && hero.abilities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Способности</h2>
            <div className="grid gap-4">
              {hero.abilities.map((ability, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{ability.name}</h3>
                    {ability.isUltimate && (
                      <span className="bg-yellow-500 text-white text-sm px-2 py-1 rounded">Ультимейт</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{ability.description}</p>
                  {ability.target && (
                    <p className="text-sm text-gray-500 mb-1">{ability.target}</p>
                  )}
                  {ability.type && (
                    <p className="text-sm text-gray-500 mb-1">{ability.type}</p>
                  )}
                  {Object.entries(ability.stats).length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium mb-1">Характеристики:</h4>
                      <ul className="text-sm text-gray-600">
                        {Object.entries(ability.stats).map(([key, value]) => (
                          <li key={key}>{key}: {value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Таланты */}
        {hero.talents && hero.talents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Таланты</h2>
            <div className="space-y-4">
              {hero.talents
                .sort((a, b) => b.level - a.level)
                .map((talent, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="font-medium mb-2">Уровень {talent.level}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-left">{talent.left}</div>
                      <div className="text-right">{talent.right}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Время обновления */}
        {hero.updatedAt && (
          <div className="text-sm text-gray-500 mt-4">
            Последнее обновление: {hero.updatedAt.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroDetails; 