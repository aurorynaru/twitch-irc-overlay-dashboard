import React, { useState } from 'react';
import { Search, Archive, Clock, Zap, User } from 'lucide-react';

const UserInventory = ({ inventory = [], items, activeEffects = [], userModifiers = [], userStats = [], economyRates }) => {
  const [search, setSearch] = useState('');

  // Extract rarities helper
  const getRarity = (itemName) => {
    if (!items) return 'Common';
    for (const [r, list] of Object.entries(items)) {
      if (list.some(i => i.name === itemName)) return list[0].rarity;
    }
    return 'Common';
  };

  const getDescription = (itemName) => {
    if (!items) return '';
    for (const [r, list] of Object.entries(items)) {
      const found = list.find(i => i.name === itemName);
      if (found) return found.description;
    }
    return '';
  };

  const rarityOrder = { 'Legendary': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };
  const searchTrimmed = search.trim().toLowerCase();

  const filteredInventory = inventory.filter(item => 
    item.username.toLowerCase().includes(searchTrimmed)
  ).sort((a, b) => {
    const rarityA = getRarity(a.item_name);
    const rarityB = getRarity(b.item_name);
    return rarityOrder[rarityA] - rarityOrder[rarityB];
  });

  const filteredEffects = activeEffects.filter(eff => eff.target_user.toLowerCase().includes(searchTrimmed) || eff.target_user === 'GLOBAL');
  const filteredModifiers = userModifiers.filter(mod => mod.username.toLowerCase().includes(searchTrimmed));

  const formatEffectValue = (type, val) => {
    if (type === 'gamble_multiplier' || type.includes('multiplier')) {
      return `${val}x`;
    }
    if (type === 'rarity_boost') {
      return `${val > 0 ? '+' : ''}${val}%`;
    }
    if (type.includes('boost') || type.includes('tax')) {
      return `${val > 0 ? '+' : ''}${Math.round(val * 100)}%`;
    }
    if (type.includes('debuff')) {
      return `${Math.round(val * 100)}%`;
    }
    return val;
  };

  const getEffectDisplay = (eff) => {
    const now = Date.now();
    let timeLeft = '';
    if (eff.expires_at) {
      const msLeft = eff.expires_at - now;
      if (msLeft <= 0) return null; // Expired
      const mins = Math.ceil(msLeft / 60000);
      timeLeft = `${mins}m left`;
    }

    let usesStr = '';
    if (eff.uses_left) {
      usesStr = `${eff.uses_left} uses`;
    }

    return {
      type: eff.effect_type,
      value: formatEffectValue(eff.effect_type, eff.effect_value),
      time: timeLeft,
      uses: usesStr,
      isGlobal: eff.target_user === 'GLOBAL',
      username: eff.target_user
    };
  };

  const validEffects = filteredEffects.map(getEffectDisplay).filter(Boolean);

  const matchedUser = searchTrimmed ? userStats.find(u => u.username && u.username.toLowerCase().includes(searchTrimmed)) : null;
  const renderUserStats = () => {
    if (!matchedUser) return null;
    
    const lvl = matchedUser.level || 1;
    const xp = matchedUser.xp || 0;
    
    let ptGain = '0.0';
    let legChance = '0.00';
    let rareChance = '0.00';
    let xpNeeded = 0;

    if (economyRates) {
      const base = economyRates.level_base_cost || 200;
      const nextLvl = lvl + 1;
      const nextXp = base * Math.pow(nextLvl - 1, 2);
      xpNeeded = Math.max(0, nextXp - xp);

      const lvlPtBonusRate = lvl * (economyRates.lvl_bonus_rate || 0.001);
      let multiplier = 1.0;
      
      const userEffects = activeEffects.filter(e => e.target_user.toLowerCase() === matchedUser.username.toLowerCase() || e.target_user === 'GLOBAL');
      const personalBoosts = userEffects.filter(e => e.effect_type === 'personal_point_boost');
      const globalBoosts = userEffects.filter(e => e.effect_type === 'global_point_boost');
      const globalDebuffs = userEffects.filter(e => e.effect_type === 'global_point_debuff');

      for (const b of personalBoosts) multiplier *= (1 + b.effect_value);
      for (const b of globalBoosts) multiplier *= (1 + b.effect_value);
      for (const b of globalDebuffs) multiplier *= (1 - b.effect_value);

      const totalBonusRate = lvlPtBonusRate + (multiplier - 1);

      const rarityBoosts = userEffects.filter(e => e.effect_type === 'rarity_boost');
      let rarityBoostVal = 0;
      for (const b of rarityBoosts) rarityBoostVal += b.effect_value;

      ptGain = (totalBonusRate * 100).toFixed(1);
      legChance = ((lvl * (economyRates.leg_bonus_rate || 0.01)) + (rarityBoostVal / 2)).toFixed(2);
      rareChance = ((lvl * (economyRates.rare_bonus_rate || 0.05)) + rarityBoostVal).toFixed(2);
    }

    let globalRank = '?';
    if (userStats && userStats.length > 0) {
      const sorted = [...userStats].sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const index = sorted.findIndex(u => u.username === matchedUser.username);
      if (index !== -1) globalRank = index + 1;
    }

    return (
      <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(201, 124, 255, 0.1), rgba(124, 58, 237, 0.1))', border: '1px solid var(--accent-color, #c97cff)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--accent-color, #c97cff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} /> {matchedUser.username}'s Profile
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Level</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: 'var(--accent-color, #c97cff)' }}>{lvl}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Current XP</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>{xp.toLocaleString()}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Rank</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#fbbf24' }}>#{globalRank}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Duels Won</div>
            <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: 'var(--success-color, #4ade80)' }}>{matchedUser.duels_won || 0}</div>
          </div>
        </div>

        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>✨ Active Passives & Bonuses</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Point Gain Bonus</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: parseFloat(ptGain) >= 0 ? 'var(--success-color, #4ade80)' : '#ef4444' }}>
              {parseFloat(ptGain) > 0 ? '+' : ''}{ptGain}%
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Legendary Catch</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#fbbf24' }}>+{legChance}%</div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Rare Catch</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#60a5fa' }}>+{rareChance}%</div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>Next Level In</div>
            <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{xpNeeded.toLocaleString()} XP</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="section">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <User size={24} style={{ marginRight: '8px' }} /> User Profiles
        </div>
        <div className="search-bar" style={{ width: '300px', margin: 0 }}>
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search username exactly..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </h2>
      <div className="section-content">
        {!searchTrimmed ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p>Type a username to view their stats, inventory, and buffs.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {renderUserStats()}
            
            {/* Buffs and Effects Section */}
            {(validEffects.length > 0 || filteredModifiers.length > 0) && (
              <div className="buffs-container" style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb86c' }}>
                  <Zap size={20} /> Active Buffs & Effects
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {validEffects.map((eff, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(255, 184, 108, 0.1)', 
                      border: '1px solid #ffb86c', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      <strong style={{ color: '#ffb86c' }}>{eff.type} {eff.isGlobal ? '(Global)' : ''}</strong>
                      <span style={{ marginLeft: '8px', color: (String(eff.value).startsWith('-') || eff.type.includes('debuff')) ? '#ef4444' : '#f8f8f2' }}>{eff.value}</span>
                      {(eff.time || eff.uses) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>
                          <Clock size={12} /> {eff.time} {eff.uses}
                        </div>
                      )}
                      {!eff.isGlobal && <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>@{eff.username}</div>}
                    </div>
                  ))}
                  {filteredModifiers.map((mod, i) => (
                    <div key={`mod-${i}`} style={{ 
                      background: 'rgba(189, 147, 249, 0.1)', 
                      border: '1px solid #bd93f9', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      <strong style={{ color: '#bd93f9' }}>{mod.modifier}</strong>
                      <span style={{ marginLeft: '8px', color: '#f8f8f2' }}>
                        {mod.modifier === 'delayed_fish' ? `+${Math.round(mod.value / 60000)} mins` : `${mod.value} uses`}
                      </span>
                      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>@{mod.username}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>Rarity</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)' }}>{item.username}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.item_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                        {getDescription(item.item_name)}
                      </td>
                      <td>
                        <span className={`rarity-badge rarity-${getRarity(item.item_name).toLowerCase()}`}>
                          {getRarity(item.item_name)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success-color, #4ade80)' }}>x{item.quantity}</td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No inventory items found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInventory;
