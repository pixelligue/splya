import { query, transaction } from '../config/database';

export const teamService = {
  // Получение команды по ID
  async getTeamById(teamId) {
    const team = await query(
      'SELECT * FROM teams WHERE team_id = ?',
      [teamId]
    );
    
    if (!team.length) return null;

    // Получаем внешние ID
    const externalIds = await query(
      'SELECT * FROM team_external_ids WHERE team_id = ?',
      [teamId]
    );

    // Получаем статистику
    const stats = await query(
      'SELECT * FROM team_stats WHERE team_id = ?',
      [teamId]
    );

    // Получаем игроков
    const players = await query(
      'SELECT p.*, ps.* FROM players p ' +
      'LEFT JOIN player_stats ps ON ps.player_id = p.id ' +
      'WHERE p.team_id = ?',
      [teamId]
    );

    // Получаем турниры
    const tournaments = await query(
      'SELECT t.*, tt.place FROM tournaments t ' +
      'JOIN team_tournaments tt ON tt.tournament_id = t.tournament_id ' +
      'WHERE tt.team_id = ?',
      [teamId]
    );

    // Форматируем данные как в MongoDB
    return {
      ...team[0],
      external_ids: externalIds,
      stats: stats[0] || {},
      roster: {
        main: players.filter(p => p.is_main).map(p => ({
          nickname: p.nickname,
          role: p.role,
          heroes: {
            name: p.hero_name,
            matches_played: p.matches_played,
            matches_won: p.matches_won,
            kda: p.kda
          }
        })),
        other: players.filter(p => !p.is_main).map(p => ({
          nickname: p.nickname,
          role: p.role
        }))
      },
      tournaments: tournaments.map(t => ({
        id: t.tournament_id,
        name: t.name,
        begin_at: t.begin_at,
        end_at: t.end_at,
        place: t.place
      }))
    };
  },

  // Создание команды
  async createTeam(teamData) {
    return await transaction(async (connection) => {
      // Создаем команду
      const [teamResult] = await connection.execute(
        'INSERT INTO teams (team_id, name, logo, country) VALUES (?, ?, ?, ?)',
        [teamData.team_id, teamData.name, teamData.logo, teamData.country]
      );

      // Добавляем внешние ID
      if (teamData.external_ids?.length) {
        for (const extId of teamData.external_ids) {
          await connection.execute(
            'INSERT INTO team_external_ids (team_id, external_id, source) VALUES (?, ?, ?)',
            [teamData.team_id, extId.id, extId.source]
          );
        }
      }

      // Добавляем статистику
      if (teamData.stats) {
        await connection.execute(
          'INSERT INTO team_stats (team_id, maps_played, maps_won, matches_played, matches_won, first_places, losses) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            teamData.team_id,
            teamData.stats.maps_played || 0,
            teamData.stats.maps_won || 0,
            teamData.stats.matches_played || 0,
            teamData.stats.matches_won || 0,
            teamData.stats.first_places || 0,
            teamData.stats.losses || 0
          ]
        );
      }

      // Добавляем игроков
      if (teamData.roster?.main) {
        for (const player of teamData.roster.main) {
          const [playerResult] = await connection.execute(
            'INSERT INTO players (team_id, nickname, role, is_main) VALUES (?, ?, ?, true)',
            [teamData.team_id, player.nickname, player.role]
          );

          // Добавляем статистику героев
          if (player.heroes) {
            for (const hero of player.heroes) {
              await connection.execute(
                'INSERT INTO player_stats (player_id, hero_name, matches_played, matches_won, kda) VALUES (?, ?, ?, ?, ?)',
                [playerResult.insertId, hero.name, hero.matches_played, hero.matches_won, hero.kda]
              );
            }
          }
        }
      }

      return teamResult.insertId;
    });
  },

  // Получение всех команд
  async getAllTeams() {
    const teams = await query('SELECT * FROM teams');
    return Promise.all(teams.map(team => this.getTeamById(team.team_id)));
  },

  // Обновление команды
  async updateTeam(teamId, teamData) {
    return await transaction(async (connection) => {
      // Обновляем основные данные команды
      await connection.execute(
        'UPDATE teams SET name = ?, logo = ?, country = ? WHERE team_id = ?',
        [teamData.name, teamData.logo, teamData.country, teamId]
      );

      // Обновляем статистику
      if (teamData.stats) {
        await connection.execute(
          'UPDATE team_stats SET maps_played = ?, maps_won = ?, matches_played = ?, matches_won = ?, first_places = ?, losses = ? WHERE team_id = ?',
          [
            teamData.stats.maps_played || 0,
            teamData.stats.maps_won || 0,
            teamData.stats.matches_played || 0,
            teamData.stats.matches_won || 0,
            teamData.stats.first_places || 0,
            teamData.stats.losses || 0,
            teamId
          ]
        );
      }

      return await this.getTeamById(teamId);
    });
  },

  // Удаление команды
  async deleteTeam(teamId) {
    return await transaction(async (connection) => {
      // Удаляем связанные данные
      await connection.execute('DELETE FROM player_stats WHERE player_id IN (SELECT id FROM players WHERE team_id = ?)', [teamId]);
      await connection.execute('DELETE FROM players WHERE team_id = ?', [teamId]);
      await connection.execute('DELETE FROM team_stats WHERE team_id = ?', [teamId]);
      await connection.execute('DELETE FROM team_external_ids WHERE team_id = ?', [teamId]);
      await connection.execute('DELETE FROM team_tournaments WHERE team_id = ?', [teamId]);
      
      // Удаляем саму команду
      return await connection.execute('DELETE FROM teams WHERE team_id = ?', [teamId]);
    });
  }
}; 