import React, { useState } from 'react';
import { Search, Archive, Clock, Zap } from 'lucide-react';

const UserInventory = ({ inventory = [], items, activeEffects = [], userModifiers = [] }) => {
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
    if (type.includes('boost') || type.includes('debuff') || type.includes('tax') || type.includes('multiplier')) {
      if (val >= 1 && val <= 10) return `${val}x`;
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

  return (
    <div className="section">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Archive size={24} style={{ marginRight: '8px' }} /> User Inventory Lookup
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
            <p>Type a username to view their inventory and active buffs.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
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
                      <span style={{ marginLeft: '8px', color: '#f8f8f2' }}>{eff.value}</span>
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
                      <span style={{ marginLeft: '8px', color: '#f8f8f2' }}>{mod.value} uses</span>
                      <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>@{mod.username}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div className="table-container">
              <table>
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
                      <td style={{ opacity: 0.7 }}>{item.username}</td>
                      <td style={{ fontWeight: 'bold' }}>{item.item_name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.9em', maxWidth: '300px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {getDescription(item.item_name)}
                      </td>
                      <td>
                        <span className={`rarity-badge rarity-${getRarity(item.item_name).toLowerCase()}`}>
                          {getRarity(item.item_name)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>x{item.quantity}</td>
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
