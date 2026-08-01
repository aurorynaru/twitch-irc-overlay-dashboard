import React from 'react';
import { Shield, Fish } from 'lucide-react';

const PatchNotes = () => {
  return (
    <div className="section">
      <h2>Patch Notes</h2>
      <div className="section-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="card" style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginTop: 0 }}>
            <Shield size={24} />  Spam Protection
          </h3>
          <p>Command spam protection</p>
          <ul style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <li><strong>Smart Detection:</strong> Spam limits are now active to prevent both focused command spam and keyboard smashing:
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li><strong>Same Command Limits (e.g. 3 times in 60s):</strong> If you repeatedly use the exact same command over and over again (like using <code>!gamble</code> 4 times in 60 seconds), you will receive a timeout.</li>
                <li><strong>Different Command Limits (e.g. 5 times in 5s):</strong> If you rapidly fire many different commands back-to-back (like using <code>!fish</code>, <code>!points</code>, <code>!inv</code>, <code>!use</code>, <code>!gamble</code>, and <code>!duel</code> all within 5 seconds), you will also receive a timeout.</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981', paddingLeft: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginTop: 0 }}>
            <Fish size={24} /> Fishing Timers
          </h3>
          <p>The <code>!fish</code> command now reacts to whether the stream is live or offline!</p>
          <ul style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <li><strong>Split Base Timers:</strong> The fishing cooldown now depends on the stream status:
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li><strong>Online:</strong> Cooldown is 60 minutes.</li>
                <li><strong>Offline:</strong> Cooldown is 10 minutes.</li>
              </ul>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PatchNotes;
