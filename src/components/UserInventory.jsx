import React, { useState } from 'react';
import { Search, Archive } from 'lucide-react';

const UserInventory = ({ inventory, items }) => {
  const [search, setSearch] = useState('');

  // Extract rarities helper
  const getRarity = (itemName) => {
    if (!items) return 'Common';
    for (const [r, list] of Object.entries(items)) {
      if (list.some(i => i.name === itemName)) return list[0].rarity;
    }
    return 'Common';
  };

  const rarityOrder = { 'Legendary': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };

  const filteredInventory = inventory.filter(item => 
    item.username.toLowerCase().includes(search.toLowerCase()) || 
    item.item_name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (a.username !== b.username) return a.username.localeCompare(b.username);
    const rarityA = getRarity(a.item_name);
    const rarityB = getRarity(b.item_name);
    return rarityOrder[rarityA] - rarityOrder[rarityB];
  });

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
            placeholder="Search username or item..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </h2>
      <div className="section-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Item Name</th>
                <th>Rarity</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{item.username}</td>
                  <td>{item.item_name}</td>
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
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No inventory records found.
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

export default UserInventory;
