import React from 'react'

const PredictionFilters = ({ 
  dateFilter, 
  setDateFilter, 
  gameFilter, 
  setGameFilter,
  tournamentFilter,
  setTournamentFilter,
  statusFilter,
  setStatusFilter,
  tournaments
}) => {
  return (
    <div className="mb-6 flex gap-4">
      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2"
      />
      <select 
        className="border border-gray-300 rounded-lg px-4 py-2"
        value={gameFilter}
        onChange={(e) => setGameFilter(e.target.value)}
      >
        <option value="all">Все игры</option>
        <option value="cs2">CS2</option>
        <option value="dota2">Dota 2</option>
        <option value="lol">League of Legends</option>
      </select>
      <select
        className="border border-gray-300 rounded-lg px-4 py-2"
        value={tournamentFilter}
        onChange={(e) => setTournamentFilter(e.target.value)}
      >
        <option value="all">Все турниры</option>
        {tournaments.map(tournament => (
          <option key={tournament} value={tournament}>{tournament}</option>
        ))}
      </select>
      <select
        className="border border-gray-300 rounded-lg px-4 py-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">Все статусы</option>
        <option value="pending">В ожидании</option>
        <option value="win">Выигрыш</option>
        <option value="lose">Проигрыш</option>
      </select>
    </div>
  )
}

export default PredictionFilters 