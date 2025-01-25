import { db } from '../config/firebase'
import { collection, getDocs, doc, query, orderBy, getDoc, Timestamp, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Базовые данные о героях
const initialHeroes = [
  {
    id: 'abaddon',
    name: 'abaddon',
    localizedName: 'Abaddon',
    primaryAttr: 'strength',
    attackType: 'melee',
    roles: ['Поддержка', 'Керри', 'Стойкость', 'Сложность героев'],
    stats: {
      baseStr: 22,
      baseAgi: 23,
      baseInt: 19,
      strGain: 2.7,
      agiGain: 1.5,
      intGain: 2.0,
      moveSpeed: 325,
      armor: 2,
      attackRange: 600,
      attackDamageMin: 50,
      attackDamageMax: 60,
      attackRate: 1.7
    },
    abilities: [
      {
        name: 'Mist Coil',
        description: 'Ценой собственного здоровья выпускает смертельный туман, который наносит урон врагу или лечит союзника.',
        target: 'Дальность применения: 600/625/650/675',
        isUltimate: false,
        stats: {
          manaCost: '50/60/70/80',
          cooldown: '4.5'
        }
      },
      {
        name: 'Aphotic Shield',
        description: 'Окружает союзника барьером из тёмной энергии, который блокирует определённое количество урона и взрывается по истечении времени действия или при поглощении достаточного урона. Взрыв наносит урон всем врагам поблизости. При применении снимает с цели большинство отрицательных эффектов.',
        isUltimate: false,
        target: 'Дальность применения: 550',
        stats: {
          manaCost: '100/105/110/115',
          cooldown: '12/10/8/6'
        }
      }
    ],
    talents: [
      {
        name: '+15% Mist Coil heal/damage',
        level: 10
      },
      {
        name: '+50 Damage',
        level: 15
      },
      {
        name: '-2s Aphotic Shield Cooldown',
        level: 20
      },
      {
        name: '+200 Borrowed Time Threshold',
        level: 25
      }
    ]
  }
];

// Временно отключена проверка админ прав
const checkAdminRights = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Пользователь не авторизован');
  }

  return true;
};

export const heroesService = {
  // Инициализация базы данных героев
  initializeHeroesDatabase: async () => {
    try {
      console.log('Начинаем инициализацию базы данных героев...');
      
      // Сначала получим все существующие документы
      const heroesRef = collection(db, 'heroes');
      const snapshot = await getDocs(heroesRef);
      
      // Проверим существующие данные
      const existingHeroes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Существующие герои:', existingHeroes);
      
      // Удалим все существующие документы
      console.log('Очищаем существующие данные...');
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // Проверим на дубликаты в initialHeroes
      const uniqueHeroes = initialHeroes.reduce((acc, hero) => {
        const existingHero = acc.find(h => 
          h.name === hero.name || 
          h.id === hero.id || 
          h.localizedName === hero.localizedName
        );
        
        if (!existingHero) {
          acc.push(hero);
        } else {
          console.log('Найден дубликат:', {
            existing: existingHero,
            duplicate: hero
          });
        }
        return acc;
      }, []);
      
      // Добавим новые данные
      console.log('Добавляем новые данные...');
      for (const hero of uniqueHeroes) {
        // Генерируем ID из имени героя (только латинские буквы и цифры)
        const heroId = hero.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .replace(/\s+/g, '');
          
        console.log(`Сохраняем героя ${hero.name} с ID: ${heroId}`);
        
        const heroRef = doc(db, 'heroes', heroId);
        await setDoc(heroRef, {
          ...hero,
          id: heroId, // Добавляем ID в данные
          updatedAt: Timestamp.fromDate(new Date())
        });
      }

      console.log('База данных героев успешно инициализирована');
      return true;
    } catch (error) {
      console.error('Ошибка при инициализации базы данных:', error);
      throw error;
    }
  },

  // Получение героев из Firebase
  getHeroesFromFirebase: async () => {
    try {
      console.log('=== Загрузка всех героев из Firebase ===');
      
      const heroesRef = collection(db, 'heroes')
      const q = query(heroesRef, orderBy('localizedName'))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        console.log('❌ База героев пуста');
        return []; 
      }
      
      console.log(`📊 Найдено героев: ${snapshot.size}`);
      
      const heroes = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log(`\n🦸 Герой: ${doc.id}`);
        console.log(JSON.stringify(data, null, 2));
        
        return {
          id: doc.id,
          ...data,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null
        }
      })

      console.log(`\n✅ Загружено ${heroes.length} героев`);
      console.log('=== Конец загрузки героев ===\n');
      
      return heroes
    } catch (error) {
      console.error('Подробная ошибка при получении героев:', error)
      if (error.code === 'permission-denied') {
        throw new Error('Отказано в доступе к Firebase. Проверьте права доступа.');
      }
      throw error
    }
  },

  // Получение информации о конкретном герое по ID
  getHeroById: async (heroId) => {
    try {
      console.log('=== Получение героя по ID ===');
      console.log('ID героя:', heroId);
      
      const heroRef = doc(db, 'heroes', heroId);
      const heroDoc = await getDoc(heroRef);
      
      if (!heroDoc.exists()) {
        console.log('❌ Герой не найден в базе');
        throw new Error('Герой не найден');
      }

      const data = heroDoc.data();
      console.log('✅ Данные героя в БД:', JSON.stringify(data, null, 2));
      
      const hero = {
        id: heroDoc.id,
        ...data,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : null
      };
      
      console.log('🔄 Преобразованные данные героя:', JSON.stringify(hero, null, 2));
      console.log('=== Конец получения героя ===');
      
      return hero;
    } catch (error) {
      console.error('❌ Ошибка при получении героя:', error);
      throw error;
    }
  },

  // Получение героя по имени
  async getHeroByName(heroName) {
    try {
      console.log('Получение героя по имени:', heroName);
      
      // Сначала попробуем получить напрямую по ID
      const heroRef = doc(db, 'heroes', heroName);
      const heroDoc = await getDoc(heroRef);
      
      if (!heroDoc.exists()) {
        console.log('Герой не найден по ID, ищем по имени...');
        
        // Если не нашли по ID, поищем по полю name
        const heroesRef = collection(db, 'heroes');
        const q = query(heroesRef);
        const snapshot = await getDocs(q);
        
        const hero = snapshot.docs.find(doc => {
          const data = doc.data();
          return data.name === heroName;
        });

        if (!hero) {
          console.log('Герой не найден ни по ID, ни по имени');
          throw new Error('Герой не найден');
        }

        const data = hero.data();
        console.log('Найден герой по имени:', data);
        return {
          id: hero.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || null
        };
      }

      const data = heroDoc.data();
      console.log('Найден герой по ID:', data);
      
      return {
        id: heroDoc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || null
      };
    } catch (error) {
      console.error('Ошибка при получении героя:', error);
      throw error;
    }
  },

  // Удаление всех героев
  deleteAllHeroes: async () => {
    try {
      console.log('Начинаем удаление всех героев...');
      
      const heroesRef = collection(db, 'heroes');
      const snapshot = await getDocs(heroesRef);
      
      if (snapshot.empty) {
        console.log('База героев уже пуста');
        return;
      }

      console.log(`Удаляем ${snapshot.size} героев...`);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Все герои успешно удалены');
    } catch (error) {
      console.error('Ошибка при удалении героев:', error);
      throw error;
    }
  },

  // Сохранение героев из WordPress API
  saveHeroesFromWordPress: async (heroes) => {
    try {
      console.log('=== Сохранение героев из WordPress ===');
      console.log(`Получено ${heroes.length} героев для сохранения`);
      
      const batch = writeBatch(db);
      const heroesRef = collection(db, 'heroes');
      
      // Очищаем существующих героев
      const existingHeroes = await getDocs(heroesRef);
      existingHeroes.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Добавляем новых героев
      heroes.forEach(hero => {
        const heroDoc = doc(heroesRef);
        batch.set(heroDoc, {
          hero_id: hero.hero_id,
          title: hero.title,
          slug: hero.slug,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
      console.log('✅ Герои успешно сохранены в Firebase');
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка при сохранении героев:', error);
      throw error;
    }
  },

  // Получение всех героев из Firebase для аналитики
  getHeroesForAnalytics: async () => {
    try {
      console.log('=== Загрузка героев для аналитики ===');
      
      const heroesRef = collection(db, 'heroes');
      const snapshot = await getDocs(heroesRef);
      
      if (snapshot.empty) {
        console.log('❌ База героев пуста');
        return {}; 
      }
      
      const heroesMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.hero_id) {
          heroesMap[data.hero_id] = data;
        }
      });
      
      console.log(`✅ Загружено ${Object.keys(heroesMap).length} героев`);
      console.log('Пример данных героя:', Object.values(heroesMap)[0]);
      return heroesMap;
      
    } catch (error) {
      console.error('❌ Ошибка при получении героев:', error);
      throw error;
    }
  }
}

export default heroesService 