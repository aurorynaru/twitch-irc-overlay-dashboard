import React from 'react';
import { Package } from 'lucide-react';

const ITEMS_DESCRIPTION = {
  "gold coin": "Grants 100 points instantly.",
  "gold pouch": "Grants 500 points instantly.",
  "fishing ticket": "Grants a free_fish modifier. The next time you type !fish, it bypasses the 2000 point cost.",
  "knife": "Grants an auto_duel modifier. The next time you type !duel <user> <amount>, it bypasses the accept phase. Max amount capped at 2500."
};

const ItemsDirectory = ({ items, rarities }) => {
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

  // Sort legendary -> common
  const rarityOrder = { 'Legendary': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };
  allItems.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  return (
    <div className="section">
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        <Package size={24} style={{ marginRight: '8px' }} /> Fishing Items Directory
      </h2>
      <div className="section-content">
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Rarity</th>
                <th>Drop Chance</th>
                <th>Effect (!redeem / !use)</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                  <td>
                    <span className={`rarity-badge rarity-${item.rarity.toLowerCase()}`}>
                      {item.rarity}
                    </span>
                  </td>
                  <td>{item.chance}%</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.description}</td>
                </tr>
              ))}
              {allItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No items loaded
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
