import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';

const ITEMS_DESCRIPTION = {
  "gold coin": "Grants 100 points instantly.",
  "gold pouch": "Grants 500 points instantly.",
  "fishing ticket": "Grants a free_fish modifier. The next time you type !fish, it bypasses the 2000 point cost.",
  "knife": "Grants an auto_duel modifier. The next time you type !duel <user> <amount>, it bypasses the accept phase. Max amount capped at 2500."
};

const ItemsDirectory = ({ items, rarities }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortMethod, setSortMethod] = useState('rarity');
  const [effectFilter, setEffectFilter] = useState('');

  const allItems = [];
  if (items) {
    for (const [rarityId, list] of Object.entries(items)) {
      const rarityData = rarities.find(r => r.rarity === rarityId);
      const threshold = rarityData ? rarityData.threshold : 0;
      
      let chance = threshold;
      if (rarityId === 'rare') chance = 10.0;
      if (rarityId === 'uncommon') chance = 35.0;
      if (rarityId === 'common') chance = 54.3;

      for (const item of list) {
        allItems.push({
          ...item,
          chance: chance,
          description: item.description || ITEMS_DESCRIPTION[item.name] || 'Unknown effect'
        });
      }
    }
  }

  let filteredItems = allItems;
  if (filterQuery.trim()) {
    const query = filterQuery.trim().toLowerCase();
    filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(query));
  }
  if (effectFilter) {
    filteredItems = filteredItems.filter(item => item.effectType === effectFilter);
  }

  const uniqueEffects = [...new Set(allItems.map(item => item.effectType))].filter(Boolean).sort();

  // Sort
  const rarityOrder = { 'Legendary': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };
  filteredItems.sort((a, b) => {
    if (sortMethod === 'rarity') {
      const diff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
      if (diff === 0) return a.name.localeCompare(b.name);
      return diff;
    } else if (sortMethod === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="section">
      <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Package size={24} style={{ marginRight: '8px' }} /> Fishing Items Directory
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className="search-bar" style={{ margin: 0, width: '250px' }}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
          <select 
            className="nav-dropdown" 
            style={{ margin: 0, padding: '8px 12px' }}
            value={effectFilter}
            onChange={(e) => setEffectFilter(e.target.value)}
          >
            <option value="">All Effects</option>
            {uniqueEffects.map(effect => (
              <option key={effect} value={effect}>{effect}</option>
            ))}
          </select>
          <select 
            className="nav-dropdown" 
            style={{ margin: 0, padding: '8px 12px' }}
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value)}
          >
            <option value="rarity">Sort by Rarity</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </h2>
      <div className="section-content">
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Rarity</th>
                <th>Drop Chance</th>
                <th>Description</th>
                <th>Effect</th>
                <th>Value</th>
                <th>Uses</th>
                <th>Duration</th>
                <th>Global</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                  <td>
                    <span className={`rarity-badge rarity-${item.rarity.toLowerCase()}`}>
                      {item.rarity}
                    </span>
                  </td>
                  <td>{item.chance}%</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.description}>{item.description}</td>
                  <td>{item.effectType}</td>
                  <td>{item.effectValue}</td>
                  <td>{item.uses}</td>
                  <td>{item.effectDurationMinutes ? `${item.effectDurationMinutes}m` : '-'}</td>
                  <td>{item.isGlobal === 1 ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemsDirectory;
