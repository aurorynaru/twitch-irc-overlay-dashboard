import React, { useState, useEffect } from 'react';

const Leaderboards = ({ userStats, emoteStats, statsSort, setStatsSort }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pages, setPages] = useState({
    level: 1, points: 1, duels: 1, raffles: 1, gamble: 1, bets: 1, chatwar: 1, emotes: 1
  });
  const [economyRates, setEconomyRates] = useState(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetch('/api/economy-rates')
      .then(res => res.json())
      .then(data => setEconomyRates(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setPages({ level: 1, points: 1, duels: 1, raffles: 1, gamble: 1, bets: 1, chatwar: 1, emotes: 1 });
  }, [searchTerm]);

  const handleSort = (table, key) => {
    setStatsSort(prev => {
      const current = prev[table];
      if (current.key === key) {
        return { ...prev, [table]: { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } };
      }
      return { ...prev, [table]: { key, dir: 'desc' } };
    });
  };

  const SortIndicator = ({ table, column }) => {
    const config = statsSort[table];
    if (config?.key === column) {
      return <span>{config.dir === 'asc' ? ' ▲' : ' ▼'}</span>;
    }
    return null;
  };

  const getTableData = (table, isEmotes = false) => {
    const sourceData = isEmotes ? emoteStats : userStats;
    const sortConfig = statsSort[table];
    
    // 1. Sort
    let sorted = [...sourceData];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const valA = a[sortConfig.key] || 0;
        const valB = b[sortConfig.key] || 0;
        if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 2. Rank
    let ranked = sorted.map((item, index) => ({ ...item, _rank: index + 1 }));

    // 3. Filter
    if (searchTerm) {
      ranked = ranked.filter(item => {
        const name = isEmotes ? item.emote : item.username;
        return name && name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return ranked;
  };

  const handlePageChange = (table, delta) => {
    setPages(prev => ({
      ...prev,
      [table]: Math.max(1, (prev[table] || 1) + delta)
    }));
  };

  const PaginationControls = ({ table, totalItems }) => {
    const currentPage = pages[table] || 1;
    const maxPage = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px', alignItems: 'center', background: 'var(--panel-bg)', borderTop: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => handlePageChange(table, -1)} 
          disabled={currentPage === 1}
          style={{ padding: '6px 16px', background: 'var(--bg-color)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: '0.2s' }}
        >
          Previous
        </button>
        <span style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>Page {currentPage} of {maxPage}</span>
        <button 
          onClick={() => handlePageChange(table, 1)} 
          disabled={currentPage >= maxPage}
          style={{ padding: '6px 16px', background: 'var(--bg-color)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: currentPage >= maxPage ? 'not-allowed' : 'pointer', opacity: currentPage >= maxPage ? 0.5 : 1, transition: '0.2s' }}
        >
          Next
        </button>
      </div>
    );
  };

  const getVisibleData = (data, table) => {
    const page = pages[table] || 1;
    return data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  };

  const levelData = getTableData('level');
  const pointsData = getTableData('points');
  const duelsData = getTableData('duels');
  const rafflesData = getTableData('raffles');
  const gambleData = getTableData('gamble');
  const betsData = getTableData('bets');
  const chatwarData = getTableData('chatwar');
  const emotesData = getTableData('emotes', true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search by username..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px', padding: '10px 16px', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
          />
      </div>
      
      {/* Top Chatters Level Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">🌟 Top Chatters (Level)</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('level', 'level')}>Level <SortIndicator table="level" column="level"/></th>
              <th onClick={() => handleSort('level', 'xp')}>Total XP <SortIndicator table="level" column="xp"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(levelData, 'level').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.xp || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="level" totalItems={levelData.length} />
      </div>

      {/* Top Chatters Points Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">💰 Top Chatters (Points)</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('points', 'points')}>Points <SortIndicator table="points" column="points"/></th>
              <th onClick={() => handleSort('points', 'level')}>Level <SortIndicator table="points" column="level"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(pointsData, 'points').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--success-color, #4ade80)' }}>{u.points || 0}</td>
                <td>{u.level || 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="points" totalItems={pointsData.length} />
      </div>

      {/* Duels Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">⚔️ Duels</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('duels', 'level')}>Level <SortIndicator table="duels" column="level"/></th>
              <th onClick={() => handleSort('duels', 'duels_played')}>Played <SortIndicator table="duels" column="duels_played"/></th>
              <th onClick={() => handleSort('duels', 'duels_won')}>Won <SortIndicator table="duels" column="duels_won"/></th>
              <th onClick={() => handleSort('duels', 'duels_lost')}>Lost <SortIndicator table="duels" column="duels_lost"/></th>
              <th onClick={() => handleSort('duels', 'duels_points_won')}>Pts Won <SortIndicator table="duels" column="duels_points_won"/></th>
              <th onClick={() => handleSort('duels', 'duels_points_lost')}>Pts Lost <SortIndicator table="duels" column="duels_points_lost"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(duelsData, 'duels').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.duels_played}</td>
                <td>{u.duels_won}</td>
                <td>{u.duels_lost}</td>
                <td style={{ color: 'var(--success-color, #4ade80)' }}>+{u.duels_points_won}</td>
                <td style={{ color: 'var(--danger-color, #ef4444)' }}>-{u.duels_points_lost}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="duels" totalItems={duelsData.length} />
      </div>

      {/* Raffles Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">🎟️ Raffles</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('raffles', 'level')}>Level <SortIndicator table="raffles" column="level"/></th>
              <th onClick={() => handleSort('raffles', 'raffles_joined')}>Joined <SortIndicator table="raffles" column="raffles_joined"/></th>
              <th onClick={() => handleSort('raffles', 'raffles_won')}>Won <SortIndicator table="raffles" column="raffles_won"/></th>
              <th onClick={() => handleSort('raffles', 'raffles_points_won')}>Pts Won <SortIndicator table="raffles" column="raffles_points_won"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(rafflesData, 'raffles').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.raffles_joined}</td>
                <td>{u.raffles_won}</td>
                <td style={{ color: 'var(--success-color, #4ade80)' }}>+{u.raffles_points_won}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="raffles" totalItems={rafflesData.length} />
      </div>

      {/* Gamble Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">🎲 Gamble</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('gamble', 'level')}>Level <SortIndicator table="gamble" column="level"/></th>
              <th onClick={() => handleSort('gamble', 'gamble_played')}>Played <SortIndicator table="gamble" column="gamble_played"/></th>
              <th onClick={() => handleSort('gamble', 'gamble_won')}>Won <SortIndicator table="gamble" column="gamble_won"/></th>
              <th onClick={() => handleSort('gamble', 'gamble_lost')}>Lost <SortIndicator table="gamble" column="gamble_lost"/></th>
              <th onClick={() => handleSort('gamble', 'gamble_points_won')}>Pts Won <SortIndicator table="gamble" column="gamble_points_won"/></th>
              <th onClick={() => handleSort('gamble', 'gamble_points_lost')}>Pts Lost <SortIndicator table="gamble" column="gamble_points_lost"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(gambleData, 'gamble').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.gamble_played}</td>
                <td>{u.gamble_won}</td>
                <td>{u.gamble_lost}</td>
                <td style={{ color: 'var(--success-color, #4ade80)' }}>+{u.gamble_points_won}</td>
                <td style={{ color: 'var(--danger-color, #ef4444)' }}>-{u.gamble_points_lost}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="gamble" totalItems={gambleData.length} />
      </div>

      {/* Bets Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">📈 Bets</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('bets', 'level')}>Level <SortIndicator table="bets" column="level"/></th>
              <th onClick={() => handleSort('bets', 'bets_played')}>Played <SortIndicator table="bets" column="bets_played"/></th>
              <th onClick={() => handleSort('bets', 'bets_won')}>Won <SortIndicator table="bets" column="bets_won"/></th>
              <th onClick={() => handleSort('bets', 'bets_lost')}>Lost <SortIndicator table="bets" column="bets_lost"/></th>
              <th onClick={() => handleSort('bets', 'bets_points_bet')}>Pts Bet <SortIndicator table="bets" column="bets_points_bet"/></th>
              <th onClick={() => handleSort('bets', 'bets_points_won')}>Pts Won <SortIndicator table="bets" column="bets_points_won"/></th>
              <th onClick={() => handleSort('bets', 'bets_points_lost')}>Pts Lost <SortIndicator table="bets" column="bets_points_lost"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(betsData, 'bets').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.bets_played}</td>
                <td>{u.bets_won}</td>
                <td>{u.bets_lost}</td>
                <td>{u.bets_points_bet}</td>
                <td style={{ color: 'var(--success-color, #4ade80)' }}>+{u.bets_points_won}</td>
                <td style={{ color: 'var(--danger-color, #ef4444)' }}>-{u.bets_points_lost}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="bets" totalItems={betsData.length} />
      </div>

      {/* Chatwar (Users) */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">⚔️ Chatwar (Users)</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th onClick={() => handleSort('chatwar', 'level')}>Level <SortIndicator table="chatwar" column="level"/></th>
              <th onClick={() => handleSort('chatwar', 'chatwar_spent')}>Pts Spent <SortIndicator table="chatwar" column="chatwar_spent"/></th>
              <th onClick={() => handleSort('chatwar', 'chatwar_lost')}>Pts Lost <SortIndicator table="chatwar" column="chatwar_lost"/></th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(chatwarData, 'chatwar').map(u => (
              <tr key={u.username}>
                <td style={{ color: 'var(--text-muted)' }}>#{u._rank}</td>
                <td style={{ fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ color: 'var(--accent-color, #c97cff)' }}>{u.level || 1}</td>
                <td>{u.chatwar_spent}</td>
                <td style={{ color: 'var(--danger-color, #ef4444)' }}>-{u.chatwar_lost}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls table="chatwar" totalItems={chatwarData.length} />
      </div>

      {/* Chatwar (Emotes) */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <div className="card-header" style={{ padding: '20px' }}><h3 className="card-title">🔥 Chatwar (Emote Ratios)</h3></div>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Emote</th>
              <th onClick={() => handleSort('emotes', 'chatwar_battles')}>Battles <SortIndicator table="emotes" column="chatwar_battles"/></th>
              <th onClick={() => handleSort('emotes', 'chatwar_wins')}>Wins <SortIndicator table="emotes" column="chatwar_wins"/></th>
              <th>Win %</th>
            </tr>
          </thead>
          <tbody>
            {getVisibleData(emotesData, 'emotes').map(e => {
              const winRatio = e.chatwar_battles > 0 ? ((e.chatwar_wins / e.chatwar_battles) * 100).toFixed(1) : 0;
              return (
                <tr key={e.emote}>
                  <td style={{ color: 'var(--text-muted)' }}>#{e._rank}</td>
                  <td>{e.emote}</td>
                  <td>{e.chatwar_battles}</td>
                  <td>{e.chatwar_wins}</td>
                  <td>{winRatio}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <PaginationControls table="emotes" totalItems={emotesData.length} />
      </div>

    </div>
  );
};

export default Leaderboards;
