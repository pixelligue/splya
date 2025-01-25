const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Получение всех команд
export const getAllTeams = async () => {
  try {
    const response = await fetch(`${API_URL}/api/teams`);
    if (!response.ok) {
      throw new Error('Ошибка при получении команд');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении команд:', error);
    throw error;
  }
};

// Получение команды по ID
export const getTeamById = async (teamId) => {
  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}`);
    if (!response.ok) {
      throw new Error('Команда не найдена');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении команды:', error);
    throw error;
  }
};

// Поиск команды по имени
export const findTeamByName = async (name) => {
  try {
    const response = await fetch(`${API_URL}/api/teams/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error('Команда не найдена');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при поиске команды:', error);
    throw error;
  }
};

// Создание новой команды
export const createTeam = async (teamData) => {
  try {
    const response = await fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) {
      throw new Error('Ошибка при создании команды');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании команды:', error);
    throw error;
  }
};

// Обновление команды
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) {
      throw new Error('Ошибка при обновлении команды');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении команды:', error);
    throw error;
  }
};

// Удаление команды
export const deleteTeam = async (teamId) => {
  try {
    const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка при удалении команды');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при удалении команды:', error);
    throw error;
  }
}; 