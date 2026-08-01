import React from 'react';
import { Shield, Fish, Clock, AlertTriangle } from 'lucide-react';

const PatchNotes = () => {
  return (
    <div className="section">
      <h2>Patch Notes</h2>
      <div className="section-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>


        <div className="card" style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginTop: 0 }}>
            <Shield size={24} /> Advanced Spam Protection
          </h3>
          <p>Command spam protection has been entirely overhauled to give you much finer control, plus added stream-state awareness!</p>
          <ul style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <li><strong>Smart Detection Windows:</strong> Spam limits are now split into two categories to prevent both focused command spam and keyboard smashing:
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li><strong>Same Command Limits:</strong> Configurable limits (e.g., 3 times in 8 seconds) for when a user repeatedly spams the <em>exact same</em> command.</li>
                <li><strong>Different Command Limits:</strong> Configurable limits (e.g., 5 times in 10 seconds) for when a user rapidly fires <em>different</em> commands back-to-back.</li>
              </ul>
            </li>
            <li><strong>Custom Command Support:</strong> The spam protection applies to <strong>both built-in and custom commands</strong>. Just make sure the command is listed in your "Commands to Monitor" config.</li>
            <li><strong>Stream State Awareness:</strong> You can now toggle Spam Protection to only be active when your stream is Online, Offline, or both, using the new checkboxes in the Admin Dashboard!</li>
            <li><strong>Fixes:</strong> Resolved an issue where saving checkbox values as text prevented the system from correctly enforcing the spam checks.</li>
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981', paddingLeft: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginTop: 0 }}>
            <Fish size={24} /> Dynamic Fishing Timers (Online vs Offline)
          </h3>
          <p>The <code>!fish</code> command and its related ecosystem now react to whether your stream is live or offline!</p>
          <ul style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <li><strong>Split Base Timers:</strong> The single "Base Fish Time" has been replaced with two distinct settings in the Admin Dashboard:
              <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                <li><strong>Base Fish Time (Online):</strong> Defaults to 5 minutes.</li>
                <li><strong>Base Fish Time (Offline):</strong> Defaults to 15 minutes.</li>
              </ul>
            </li>
            <li><strong>Command Updating:</strong> <code>!setfishtime</code> has been upgraded. You must now specify which mode you are modifying (e.g., <code>!setfishtime online 10</code> or <code>!setfishtime offline 25</code>).</li>
            <li><strong>Item Scaling:</strong> Items that increase or decrease fishing time by a percentage (like sabotages / <code>fishing_debuff_target</code>) now dynamically scale their penalties based on whether the stream is live or offline at the exact moment the item is used.</li>
            <li><strong>Fair Play Logic:</strong> Timers are calculated at the moment a user casts their line. If they cast while offline and get a 15-minute timer, but you go live 5 minutes later, they still have to wait the remaining 10 minutes (to prevent exploiting stream status changes). Only new casts use the new stream state!</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PatchNotes;
