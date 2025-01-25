import axios from 'axios';
import 'dotenv/config';

const pandaScoreApi = axios.create({
  baseURL: 'https://api.pandascore.co',
  headers: {
    'Authorization': `Bearer ${process.env.PANDASCORE_API_KEY}`,
    'Accept': 'application/json'
  }
});

export const pandaScoreService = {
  getUpcomingMatches: async (limit = 50) => {
    try {
      const response = await pandaScoreApi.get('/dota2/matches/upcoming', {
        params: {
          per_page: limit,
          sort: 'begin_at',
          include: ['tournament', 'serie']
        }
      });

      console.log('Raw match data from PandaScore:', JSON.stringify(response.data[0], null, 2));

      return response.data
        .filter(match => {
          return match.opponents?.length === 2 && 
                 match.opponents[0]?.opponent?.name && 
                 match.opponents[1]?.opponent?.name;
        })
        .map(match => {
          console.log('Tournament data:', {
            tournament: match.tournament,
            serie: match.serie,
            league: match.league
          });

          return {
            external_id: match.id.toString(),
            teams: match.opponents.map(opponent => ({
              id: opponent.opponent.id.toString(),
              name: opponent.opponent.name,
              slug: opponent.opponent.acronym || opponent.opponent.name.toLowerCase().replace(/\s+/g, '-')
            })),
            tournament: {
              id: match.tournament?.id,
              name: match.league?.name || 'Unknown Tournament',
              serie: match.serie?.name || '',
              stage: match.tournament?.name || 'Unknown Stage',
              slug: match.tournament?.slug || 'unknown',
              format: `BO${match.number_of_games}`
            },
            begin_at: new Date(match.begin_at),
            status: match.status === 'not_started' ? 'pending' : match.status,
            game: 'dota2'
          };
        });
    } catch (error) {
      console.error('Ошибка при получении матчей из PandaScore:', error);
      throw error;
    }
  }
}; 