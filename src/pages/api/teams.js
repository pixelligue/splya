import { connectDB, Team } from '../../config/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const teams = await Team.find({}).sort({ matches: -1 });
    
    return res.status(200).json({
      success: true,
      teams: teams
    });
  } catch (error) {
    console.error('Ошибка при получении команд:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при получении команд'
    });
  }
} 