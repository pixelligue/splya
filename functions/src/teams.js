const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Инициализируем Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

// Функция для получения данных о команде из OpenDota
const getTeamData = async (teamId) => {
  try {
    const response = await fetch(`https://api.opendota.com/api/teams/${teamId}`)
    if (!response.ok) throw new Error(`OpenDota API error: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error)
    return null
  }
}

// Функция для обновления команд
exports.updateTeams = functions.pubsub
  .schedule('0 0 * * *') // Каждый день в полночь
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Starting daily team update')
      
      // Получаем все команды из Firestore
      const teamsSnapshot = await db.collection('teams').get()
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log(`Found ${teams.length} teams to check`)
      
      // Обновляем каждую команду
      const batch = db.batch()
      let updatedCount = 0
      
      for (const team of teams) {
        // Проверяем, нужно ли обновление
        const lastUpdate = team.lastUpdated ? new Date(team.lastUpdated) : new Date(0)
        const now = new Date()
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60)
        
        if (hoursSinceUpdate >= 24) {
          // Получаем свежие данные
          const newData = await getTeamData(team.team_id)
          
          if (newData) {
            const teamRef = db.collection('teams').doc(team.team_id.toString())
            batch.update(teamRef, {
              ...newData,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            })
            updatedCount++
          }
          
          // Добавляем задержку между запросами
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // Применяем все обновления
      if (updatedCount > 0) {
        await batch.commit()
      }
      
      console.log(`Updated ${updatedCount} teams`)
      return null
    } catch (error) {
      console.error('Error updating teams:', error)
      throw error
    }
  })

// Функция для ручного запуска обновления (через HTTP trigger)
exports.manualUpdateTeams = functions.https.onRequest(async (req, res) => {
  try {
    // Проверяем авторизацию
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized')
      return
    }
    
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    
    // Проверяем права администратора
    const userSnapshot = await db.collection('users').doc(decodedToken.uid).get()
    const userData = userSnapshot.data()
    
    if (!userData || !userData.isAdmin) {
      res.status(403).send('Forbidden')
      return
    }
    
    // Запускаем обновление
    console.log('Starting manual team update')
    
    const teamsSnapshot = await db.collection('teams').get()
    const teams = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log(`Found ${teams.length} teams to update`)
    
    const batch = db.batch()
    let updatedCount = 0
    
    for (const team of teams) {
      const newData = await getTeamData(team.team_id)
      
      if (newData) {
        const teamRef = db.collection('teams').doc(team.team_id.toString())
        batch.update(teamRef, {
          ...newData,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        })
        updatedCount++
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    if (updatedCount > 0) {
      await batch.commit()
    }
    
    res.json({
      status: 'success',
      updatedTeams: updatedCount
    })
  } catch (error) {
    console.error('Error in manual update:', error)
    res.status(500).json({
      status: 'error',
      message: error.message
    })
  }
}) 