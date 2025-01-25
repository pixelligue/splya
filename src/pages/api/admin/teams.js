import { connectDB } from '../../../src/config/mongodb.js';
import { TeamStats } from '../../../server/models/TeamStats.js';

export default async function handler(req, res) {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully');

    switch (req.method) {
      case 'GET':
        console.log('Processing GET request...');
        const teams = await TeamStats.find().sort({ name: 1 });
        console.log('Found teams:', teams.length);
        res.status(200).json(teams);
        break;

      case 'POST':
        console.log('Processing POST request:', req.body);
        const newTeam = new TeamStats({
          ...req.body,
          parsed_at: new Date(),
          updated_at: new Date()
        });
        await newTeam.save();
        console.log('Team saved:', newTeam);
        res.status(201).json(newTeam);
        break;

      case 'PUT':
        console.log('Processing PUT request:', req.query.id, req.body);
        const { id } = req.query;
        const updateData = {
          ...req.body,
          updated_at: new Date()
        };

        const updatedTeam = await TeamStats.findOneAndUpdate(
          { team_id: id },
          { $set: updateData },
          { new: true }
        );

        if (!updatedTeam) {
          console.log('Team not found:', id);
          return res.status(404).json({ error: 'Команда не найдена' });
        }

        console.log('Team updated:', updatedTeam);
        res.status(200).json(updatedTeam);
        break;

      case 'DELETE':
        console.log('Processing DELETE request:', req.query.id);
        const { id: teamId } = req.query;
        const deletedTeam = await TeamStats.findOneAndDelete({ team_id: teamId });
        
        if (!deletedTeam) {
          console.log('Team not found:', teamId);
          return res.status(404).json({ error: 'Команда не найдена' });
        }

        console.log('Team deleted:', deletedTeam);
        res.status(200).json({ message: 'Команда удалена' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
  }
} 