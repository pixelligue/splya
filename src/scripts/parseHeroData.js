import { db } from '../config/firebase-node.js';
import { doc, setDoc } from 'firebase/firestore';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const WIKI_URL = 'https://dota2.fandom.com';

/**
 * Получение списка всех героев
 */
async function getHeroesList() {
  try {
    const response = await fetch(`${WIKI_URL}/ru/wiki/Герои`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Используем Set для хранения уникальных героев
    const heroesMap = new Map();
    
    // Функция для добавления героев
    const addHeroes = (selector, primaryAttr) => {
      $(selector).each((i, element) => {
        const heroName = $(element).attr('title');
        const heroUrl = $(element).attr('href');
        
        if (heroName && heroUrl && 
            !heroName.includes('attribute') && 
            !heroName.includes('Сила') && 
            !heroName.includes('Ловкость') && 
            !heroName.includes('Интеллект') && 
            !heroName.includes('Универсальные')) {
          
          // Используем имя героя как ключ
          if (!heroesMap.has(heroName)) {
            heroesMap.set(heroName, {
              name: heroName,
              url: `${WIKI_URL}${heroUrl}`,
              primaryAttr
            });
          }
        }
      });
    };

    // Парсим героев по атрибутам
    addHeroes('table:contains("Сила") a[title]', 'strength');
    addHeroes('table:contains("Ловкость") a[title]', 'agility');
    addHeroes('table:contains("Интеллект") a[title]', 'intelligence');
    addHeroes('table:contains("Универсальные") a[title]', 'universal');

    const heroes = Array.from(heroesMap.values());
    console.log('Найденные герои:', heroes.map(h => h.name).join(', '));
    console.log('Всего уникальных героев:', heroes.length);
    
    return heroes;
  } catch (error) {
    console.error('Ошибка при получении списка героев:', error);
    return [];
  }
}

/**
 * Парсинг данных героя
 */
async function parseHeroData(heroUrl, primaryAttr) {
  try {
    const response = await fetch(heroUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Базовая информация
    const heroInfo = {
      name: $('.page-header__title').text().trim(),
      localizedName: $('.page-header__title').text().trim(),
      primaryAttr: primaryAttr,
      attackType: getAttackType($),
      roles: getRoles($),
      description: getHeroDescription($),
      stats: getHeroStats($),
      abilities: await getHeroAbilities($),
      talents: getTalents($),
      updatedAt: new Date()
    };
    
    return heroInfo;
  } catch (error) {
    console.error('Ошибка при парсинге данных героя:', error);
    return null;
  }
}

/**
 * Получение типа атаки
 */
function getAttackType($) {
  // Проверяем наличие иконки ближнего или дальнего боя
  if ($('img[alt="Ближний бой"]').length > 0) return 'melee';
  if ($('img[alt="Дальний бой"]').length > 0) return 'ranged';
  return 'unknown';
}

/**
 * Получение ролей героя
 */
function getRoles($) {
  const roles = [];
  // Ищем ссылки в категориях
  $('div.page-content a[title]').each((i, element) => {
    const role = $(element).attr('title');
    if (role && (
      role.includes('Керри') ||
      role.includes('Поддержка') ||
      role.includes('Инициатор') ||
      role.includes('Контроль') ||
      role.includes('Быстрый урон') ||
      role.includes('Стойкость') ||
      role.includes('Побег') ||
      role.includes('Осада') ||
      role.includes('Сложность')
    )) {
      roles.push(role);
    }
  });
  return [...new Set(roles)]; // Убираем дубликаты
}

/**
 * Получение описания героя
 */
function getHeroDescription($) {
  // Ищем первый параграф после заголовка "Биография"
  const description = $('h2:contains("Биография")').next('p').text().trim();
  return description || '';
}

/**
 * Получение характеристик героя
 */
function getHeroStats($) {
  const stats = {
    baseStr: 0,
    baseAgi: 0,
    baseInt: 0,
    strGain: 0,
    agiGain: 0,
    intGain: 0,
    moveSpeed: 0,
    armor: 0,
    attackDamageMin: 0,
    attackDamageMax: 0,
    attackRate: 0,
    attackRange: 0
  };

  // Находим значения атрибутов в div с grid-template-columns
  const attributeValues = $('div[style*="grid-template-columns"]').find('div[style*="color:#fff"]').map((i, el) => $(el).text()).get();
  if (attributeValues.length >= 3) {
    // Сила
    const strMatch = attributeValues[0].match(/(\d+)\s*\+\s*([\d,.]+)/);
    if (strMatch) {
      stats.baseStr = parseInt(strMatch[1]);
      stats.strGain = parseFloat(strMatch[2].replace(',', '.'));
    }

    // Ловкость
    const agiMatch = attributeValues[1].match(/(\d+)\s*\+\s*([\d,.]+)/);
    if (agiMatch) {
      stats.baseAgi = parseInt(agiMatch[1]);
      stats.agiGain = parseFloat(agiMatch[2].replace(',', '.'));
    }

    // Интеллект
    const intMatch = attributeValues[2].match(/(\d+)\s*\+\s*([\d,.]+)/);
    if (intMatch) {
      stats.baseInt = parseInt(intMatch[1]);
      stats.intGain = parseFloat(intMatch[2].replace(',', '.'));
    }
  }

  // Получаем скорость передвижения
  const moveSpeedText = $('th:contains("Скорость передв.")').next().next().next().text();
  const moveSpeedMatch = moveSpeedText.match(/(\d+)/);
  if (moveSpeedMatch) {
    stats.moveSpeed = parseInt(moveSpeedMatch[1]);
  }

  // Получаем броню
  const armorText = $('th:contains("Броня")').next().next().text();
  const armorMatch = armorText.match(/([\d,.]+)/);
  if (armorMatch) {
    stats.armor = parseFloat(armorMatch[1].replace(',', '.'));
  }

  // Получаем урон
  const damageRow = $('th:contains("Урон")').next();
  if (damageRow.length) {
    const damageText = damageRow.text();
    const damageMatch = damageText.match(/(\d+)\s*\n\s*(\d+)/);
    if (damageMatch) {
      stats.attackDamageMin = parseInt(damageMatch[1]);
      stats.attackDamageMax = parseInt(damageMatch[2]);
    }
  }

  // Получаем скорость атаки
  const attackRateText = $('th:contains("Атак/с")').next().text();
  const attackRateMatch = attackRateText.match(/([\d,.]+)/);
  if (attackRateMatch) {
    stats.attackRate = parseFloat(attackRateMatch[1].replace(',', '.'));
  }

  // Получаем дальность атаки
  const attackRangeText = $('th:contains("Дальность атаки")').next().next().next().text();
  const attackRangeMatch = attackRangeText.match(/(\d+)/);
  if (attackRangeMatch) {
    stats.attackRange = parseInt(attackRangeMatch[1]);
  }

  return stats;
}

/**
 * Получение способностей героя
 */
async function getHeroAbilities($) {
  const abilities = [];
  
  // Находим все div с классом ability-background
  $('.ability-background').each((i, element) => {
    const $ability = $(element);
    
    // Получаем название способности
    const name = $ability.find('span[style*="color:#fff"]').first().text().trim();
    
    // Получаем описание
    const description = $ability.find('.ability-description div[style*="border-top"]').text().trim();
    
    // Получаем тип способности и цель
    const abilityType = $ability.find('div[style*="display:inline-block"] div').first().text().trim();
    const target = $ability.find('div[style*="display:inline-block"] div').eq(1).text().trim();
    
    // Получаем характеристики способности
    const stats = {};
    $ability.find('div[style*="font-size:98%"]').each((i, stat) => {
      const $stat = $(stat);
      const text = $stat.text();
      
      if (text.includes('Мана:')) {
        stats.manaCost = text.match(/\d+/)?.[0] || '';
      }
      if (text.includes('Перезарядка:')) {
        stats.cooldown = text.match(/[\d/]+/)?.[0] || '';
      }
      if (text.includes('Радиус:')) {
        stats.radius = text.match(/[\d/]+/)?.[0] || '';
      }
      if (text.includes('Урон')) {
        stats.damage = text.match(/[\d/]+/)?.[0] || '';
      }
    });

    // Получаем примечания
    const notes = [];
    $ability.find('ul li').each((i, note) => {
      notes.push($(note).text().trim());
    });

    if (name) {
      abilities.push({
        name,
        description,
        type: abilityType,
        target,
        stats,
        notes,
        isUltimate: name.toLowerCase().includes('rage') || i === 3
      });
    }
  });
  
  return abilities;
}

/**
 * Получение талантов героя
 */
function getTalents($) {
  const talents = [];
  
  // Находим таблицу талантов
  $('th:contains("Таланты героя")').closest('table').find('tr').each((i, row) => {
    if (i === 0) return; // Пропускаем заголовок
    
    const $row = $(row);
    const level = $row.find('th').text().trim();
    const leftTalent = $row.find('td').first().text().trim();
    const rightTalent = $row.find('td').last().text().trim();
    
    if (level && leftTalent && rightTalent) {
      talents.push({
        level: parseInt(level),
        left: leftTalent,
        right: rightTalent
      });
    }
  });
  
  return talents;
}

/**
 * Проверка прав доступа к Firebase
 */
async function checkFirebaseAccess() {
  try {
    // Пробуем создать тестовый документ
    const testRef = doc(db, 'heroes', 'test');
    await setDoc(testRef, { test: true });
    console.log('Доступ к Firebase подтвержден');
    return true;
  } catch (error) {
    console.error('Ошибка доступа к Firebase:', error);
    return false;
  }
}

/**
 * Сохранение данных героя в Firebase
 */
async function saveHeroToFirebase(heroId, heroData) {
  console.log(`\nСохранение героя ${heroData.name} (ID: ${heroId}) в Firebase...`);
  try {
    const heroRef = doc(db, 'heroes', heroId);
    await setDoc(heroRef, {
      ...heroData,
      id: heroId,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Герой ${heroData.name} успешно сохранен в Firebase`);
    console.log(`📊 Сохраненные данные:
- ID: ${heroId}
- Имя: ${heroData.name}
- Способностей: ${heroData.abilities.length}
- Талантов: ${heroData.talents.length}
- Размер данных: ${JSON.stringify(heroData).length} байт`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при сохранении героя ${heroData.name}:`, error);
    return false;
  }
}

/**
 * Основная функция парсинга
 */
async function parseAndSaveHeroes() {
  try {
    // Проверяем доступ к Firebase
    const hasAccess = await checkFirebaseAccess();
    if (!hasAccess) {
      console.error('Нет доступа к Firebase. Убедитесь, что у вас есть необходимые права.');
      return;
    }

    console.log('Получаем список героев...');
    const heroes = await getHeroesList();
    
    if (heroes.length === 0) {
      console.error('Не удалось получить список героев');
      return;
    }
    
    console.log(`Найдено ${heroes.length} героев`);
    
    // Берем только первого героя для теста
    const firstHero = heroes[0];
    console.log('\nТестируем парсинг на первом герое:', firstHero.name);
    console.log('URL героя:', firstHero.url);
    
    const heroData = await parseHeroData(firstHero.url, firstHero.primaryAttr);
    if (heroData) {
      console.log('\nПолученные данные:');
      console.log('- Имя:', heroData.name);
      console.log('- Атрибут:', heroData.primaryAttr);
      console.log('- Тип атаки:', heroData.attackType);
      console.log('- Роли:', heroData.roles.join(', '));
      console.log('\nХарактеристики:');
      console.log('- Базовая сила:', heroData.stats.baseStr);
      console.log('- Базовая ловкость:', heroData.stats.baseAgi);
      console.log('- Базовый интеллект:', heroData.stats.baseInt);
      console.log('- Прирост силы:', heroData.stats.strGain);
      console.log('- Прирост ловкости:', heroData.stats.agiGain);
      console.log('- Прирост интеллекта:', heroData.stats.intGain);
      console.log('- Скорость:', heroData.stats.moveSpeed);
      console.log('- Броня:', heroData.stats.armor);
      console.log('\nСпособности:');
      heroData.abilities.forEach((ability, index) => {
        console.log(`\n${index + 1}. ${ability.name}`);
        console.log('   Описание:', ability.description);
        console.log('   Мана:', ability.manaCost);
        console.log('   Перезарядка:', ability.cooldown);
      });
      console.log('\nТаланты:');
      heroData.talents.forEach(talent => {
        console.log(`- Уровень ${talent.level}:`);
        console.log(`  Левый: ${talent.left}`);
        console.log(`  Правый: ${talent.right}`);
      });

      console.log('\nПродолжить парсинг всех героев? (y/n)');
      // Здесь можно добавить интерактивный ввод, но пока просто продолжим
      console.log('Автоматически продолжаем через 10 секунд...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Парсим остальных героев
      let savedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < heroes.length; i++) {
        const hero = heroes[i];
        console.log(`\n📝 Обрабатываем героя: ${hero.name} (${i + 1}/${heroes.length})`);
        
        const heroData = await parseHeroData(hero.url, hero.primaryAttr);
        if (!heroData) {
          console.log(`⚠️ Пропускаем героя ${hero.name} из-за ошибки парсинга`);
          errorCount++;
          continue;
        }
        
        // Генерируем ID героя из имени (только латинские буквы и цифры)
        const heroId = hero.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .replace(/\s+/g, '');
        
        // Сохраняем в Firebase
        const saved = await saveHeroToFirebase(heroId, heroData);
        if (saved) {
          savedCount++;
        } else {
          errorCount++;
        }
        
        // Добавляем задержку между запросами
        console.log('⏳ Ждем 5 секунд перед следующим героем...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      console.log(`\n🎉 Парсинг и сохранение героев завершено:
✅ Успешно сохранено: ${savedCount}
❌ Ошибок: ${errorCount}
📊 Всего обработано: ${heroes.length}`);
      
    } else {
      console.error('Не удалось получить данные первого героя');
    }
    
    console.log('\nПарсинг и сохранение героев завершено');
    
  } catch (error) {
    console.error('❌ Критическая ошибка при парсинге:', error);
  }
}

// Запускаем парсинг
parseAndSaveHeroes().catch(console.error); 