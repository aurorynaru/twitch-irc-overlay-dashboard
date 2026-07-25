import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Play, Pause, Volume2, Database, Terminal, Settings, ChevronDown, ChevronRight, Copy, RefreshCw, Shield } from 'lucide-react';
import Leaderboards from './components/Leaderboards';
import ItemsDirectory from './components/ItemsDirectory';
import Submissions from './components/Submissions';
import UserInventory from './components/UserInventory';

const commandInstructions = {
  '!playsound': 'Play an audio file. Usage: !playsound <sound_name>',
  '!showemote': 'Display an emote on the overlay. Usage: !showemote <emote> <modifier> | Examples: !showemote PogChamp RainTime hyper',
  '!betstart': 'Start a betting session. Usage: !betstart <Description> <choice1,choice2> <time_in_seconds> ',
  '!betstop': 'Resolve a bet. Usage: !betstop <winning_choice>',
  '!betstatus': 'Check current bet info. Usage: !betstatus',
  '!betcancel': 'Cancel a bet and refund points (Admin). Usage: !betcancel',
  '!bet': 'Place a bet on an active betting session. Usage: !bet <choice> <amount>',
  '!points': 'Check your points. Usage: !points',
  '!gamble': 'Gamble your points. Usage: !gamble <amount>',
  '!chatwar': 'Start a chat war. Usage: !chatwar <emote1> <emote2> <cost> <time_in_minutes>',
  '!chatwarcancel': 'Cancel the chat war. Usage: !chatwarcancel',
  '!global': 'Global command settings (cooldown).',
  '!commandlist': 'Show all commands.',
  '!addcommand': 'Add a custom command (Admin). Usage: !addcommand <cmd> <action>',
  '!removecommand': 'Remove a custom command (Admin). Usage: !removecommand <cmd>',
  '!editcommand': 'Edit custom command cost/cooldown (Admin). Usage: !editcommand <cmd> <setting> <value> !editcommand !gamble offlineonly true | !editcommand !gamble sub true',
  '!duel': 'Challenge another user for points! Usage: !duel @user <amount>',
  '!acceptduel': 'Accept a pending duel request.',
  '!declineduel': 'Decline a pending duel request.',
  '!disable': '!disable a command. Usage !disable  <cmd> optional<time>. sample !disable !playsound 10m',
  '!enable': 'Enable a command. Usage !enable <cmd>.  sample !enable !playsound',
  '!subonly': 'Make a command subscriber-only (Admin). Usage: !subonly <cmd> <true/false>. sample: !subonly !playsound true',
  '!raffle': 'Start a raffle. Usage !raffle <points amount> <time_in_minutes>. Use -<amount> to deduct points.',
  '!multiraffle': 'Start a multi-winner raffle. Usage !multiraffle <points amount> <time_in_minutes> <number_of_winners>. Use -<amount> to deduct points.',
  '!join': 'Join a raffle. Usage !join',
  '!toppoints': 'Display the top point earners. Usage: !toppoints [number] (default: 5)',
  '!editpoints': 'Edit user points. Usage: !editpoints <username> <amount>',
  '!masspointsadd': 'Add points to all users who chatted in the last <time>. Usage !masspointsadd <amount> <time>. sample !masspointsadd 1000 10m',
  '!masspointssub': 'Remove points from all users who chatted in the last <time>. Usage !masspointssub <amount> <time>. sample !masspointssub 1000 10m',
  '!chatcooldown': 'set global cooldown for chat commands. Usage: !chatcooldown <time>. sample !chatcooldown 10s or !chatcooldown !playsound 10s',
  '!givepoints': 'Give points to users. Usage !givepoints <amount> <username>. sample !givepoints 50 username',
  '!removepoints': 'Remove points from users (Admin). Usage: !removepoints <amount> <username>',
  '!deleteplaysound': 'Delete a playsound. Usage !deleteplaysound <soundname>. sample !deleteplaysound 5dollars',
  '!editrewards': 'Edit rewards. Usage !editrewards <type> <val1> [val2]. Types: sub, giftsub, watchstreak, raffle, multiraffle | !editrewards raffle 5000 50000 | !editrewards multiraffle 5 20 | !editrewards sub 10000',
  '!lvlup': 'Level up using points. Usage: !lvlup <amount>, !lvlup 30%, or !lvlup all',
  '!use': 'Use an item from your inventory. Usage: !use <item> [qty] or !use all <item>',
  '!shoot': 'Pay points to timeout a user. Usage: !shoot @username',
  '!fish': 'Go fishing to earn items. Usage: !fish',
  '!inventory': 'Check your items. Usage: !inventory or !inv',
  '!buffs': 'Check your active buffs and effects. Usage: !buffs',
  '!emotesize': 'Set the size of emotes on the overlay (Admin). Usage: !emotesize <size>',
  '!emoteduration': 'Set how long emotes stay on the overlay (Admin). Usage: !emoteduration <seconds>',
  '!clearoverlay': 'Clear all emotes and sounds from the screen (Admin). Usage: !clearoverlay',
  '!editconfig': 'Edit configuration variables (Admin). Usage: !editconfig <key> <value>',
  '!refreshemotes': 'Refresh third party emotes (Admin). Usage: !refreshemotes',
  '!dueltax': 'Check or set the duel tax percentage (Admin). Usage: !dueltax [percentage]',
  '!giveitem': 'Give an item to a user (Admin). Usage: !giveitem <username> <item name> [amount]',
  '!reloaditems': 'Reload items from items.json (Admin). Usage: !reloaditems',
};

const builtInAliases = {
  '!point': '!points',
  '!pts': '!points',
  '!givepoint': '!givepoints',
  '!givept': '!givepoints',
  '!givepts': '!givepoints',
  '!startbet': '!betstart',
  '!stopbet': '!betstop',
  '!checkbet': '!betstatus',
  '!statusbet': '!betstatus',
  '!editpoint': '!editpoints',
  '!toppoint': '!toppoints',
  '!top': '!toppoints',
  '!leaderboard': '!toppoints',
  '!addpoint': '!masspointsadd',
  '!subpoint': '!masspointssub',
  '!delcommand': '!removecommand',
  '!deletecommand': '!removecommand',
  '!commands': '!commandlist',
  '!cmds': '!commandlist',
  '!cmdlist': '!commandlist',
  '!roulette': '!gamble',
  '!roll': '!gamble',
  '!setrewards': '!editrewards',
   '!buylvl': '!lvlup',
  '!buylevel': '!lvlup',
  '!buylevels': '!lvlup',
  '!levelup': '!lvlup',
  '!inv': '!inventory',
  '!redeem': '!use'
};

const adminCommands = [
  '!betcancel', '!addcommand', '!removecommand', '!editcommand', 
  '!disable', '!enable', '!subonly', '!editpoints', '!masspointsadd', 
  '!masspointssub', '!chatcooldown', '!givepoints', '!removepoints', 
  '!deleteplaysound', '!editrewards', '!emotesize', '!emoteduration', 
  '!clearoverlay', '!editconfig', '!refreshemotes', '!dueltax', 
  '!giveitem', '!reloaditems', '!global', '!raffle', '!multiraffle', 
  '!chatwar', '!chatwarcancel', '!betstart', '!betstop'
];

function App() {
  const [data, setData] = useState({ defaultCommands: [], customCommands: [], sounds: [], rewards: {}, emoteModifiers: {}, userStats: [], emoteStats: [], items: {}, rarities: [], inventory: [], activeEffects: [], userModifiers: [], economyRates: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL); 
  const [collapsed, setCollapsed] = useState({ builtIn: false, admin: true, custom: true, sounds: false, stats: false, items: false, inventory: false });
  const [activeTab, setActiveTab] = useState('home');
  const [twitchToken, setTwitchToken] = useState(localStorage.getItem('twitchToken') || null);
  const [twitchUser, setTwitchUser] = useState(null);
  const [twitchClientId, setTwitchClientId] = useState(null);

  const [statsSort, setStatsSort] = useState({
    level: { key: 'level', dir: 'desc' },
    points: { key: 'points', dir: 'desc' },
    duels: { key: 'duels_points_won', dir: 'desc' },
    raffles: { key: 'raffles_points_won', dir: 'desc' },
    gamble: { key: 'gamble_points_won', dir: 'desc' },
    bets: { key: 'bets_points_won', dir: 'desc' },
    chatwar: { key: 'chatwar_spent', dir: 'desc' },
    emotes: { key: 'chatwar_wins', dir: 'desc' }
  });
  const [copiedId, setCopiedId] = useState(null);
  const [volume, setVolume] = useState(1); // Default 20% volume
  const [soundCategoryFilters, setSoundCategoryFilters] = useState([]);
  const [soundCategoryInput, setSoundCategoryInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [soundSortBy, setSoundSortBy] = useState('date-desc');
  
  const [playingSound, setPlayingSound] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchData(apiUrl);
    
    // Check for Twitch OAuth callback hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        localStorage.setItem('twitchToken', token);
        setTwitchToken(token);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // Cleanup audio on unmount
    return () => {
      audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!twitchToken) {
        setTwitchUser(null);
        return;
      }
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await axios.post(`${cleanUrl}/api/auth/verify`, { token: twitchToken });
        if (res.data.success) {
          setTwitchUser(res.data.username);
        } else {
          localStorage.removeItem('twitchToken');
          setTwitchToken(null);
          setTwitchUser(null);
        }
      } catch (err) {
        console.error('Failed to verify Twitch token', err);
        localStorage.removeItem('twitchToken');
        setTwitchToken(null);
        setTwitchUser(null);
      }
    };
    verifyToken();
  }, [twitchToken, apiUrl]);

  const fetchData = async (url) => {
    setLoading(true);
    setError('');
    try {
      const cleanUrl = url.replace(/\/$/, '');
      const [cmdRes, soundsRes, configRes, statsRes, itemsRes, invRes, economyRes, clientRes] = await Promise.all([
        axios.get(`${cleanUrl}/api/dashboard/commands`),
        axios.get(`${cleanUrl}/api/dashboard/sounds`),
        axios.get(`${cleanUrl}/api/dashboard/config`),
        axios.get(`${cleanUrl}/api/dashboard/stats`),
        axios.get(`${cleanUrl}/api/dashboard/items`).catch(() => ({ data: { success: false } })),
        axios.get(`${cleanUrl}/api/dashboard/inventory`).catch(() => ({ data: { success: false } })),
        axios.get(`${cleanUrl}/api/economy-rates`).catch(() => ({ data: null })),
        axios.get(`${cleanUrl}/api/config/client_id`).catch(() => ({ data: { client_id: null } }))
      ]);
      
      if (cmdRes.data.success && soundsRes.data.success && configRes.data.success && statsRes.data.success) {
        setData({
          defaultCommands: cmdRes.data.defaultCommands,
          customCommands: cmdRes.data.customCommands,
          sounds: soundsRes.data.sounds,
          rewards: configRes.data.rewards,
          emoteModifiers: configRes.data.emoteModifiers || {},
          userStats: statsRes.data.userStats,
          emoteStats: statsRes.data.emoteStats,
          items: itemsRes.data?.items || {},
          rarities: itemsRes.data?.rarities || [],
          inventory: invRes.data?.inventory || [],
          activeEffects: invRes.data?.activeEffects || [],
          userModifiers: invRes.data?.userModifiers || [],
          pendingFish: invRes.data?.pendingFish || [],
          economyRates: economyRes.data || null
        });
        if (clientRes && clientRes.data && clientRes.data.client_id) {
          setTwitchClientId(clientRes.data.client_id);
        }
      } else {
        setError('Failed to fetch data from one or more endpoints.');
      }
    } catch (err) {
      setError('Could not connect to the server. Make sure your server is running and CORS is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const playSound = (soundName) => {
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const soundUrl = `${cleanUrl}/playsounds/${soundName}`;
    
    if (playingSound === soundName) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        setPlayingSound(null);
      }
    } else {
      audioRef.current.src = soundUrl;
      audioRef.current.play();
      setPlayingSound(soundName);
      
      audioRef.current.onended = () => {
        setPlayingSound(null);
      };
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredDefaults = data.defaultCommands.filter(c => !adminCommands.includes(c.command) && c.command.toLowerCase().includes(searchTerm.toLowerCase()));
  const adminFromDefault = data.defaultCommands.filter(c => adminCommands.includes(c.command));
  const missingAdminCmdNames = adminCommands.filter(ac => !data.defaultCommands.some(c => c.command === ac));
  const missingAdminCmds = missingAdminCmdNames.map(ac => ({ command: ac, settings: {} }));
  const allAdminCmds = [...adminFromDefault, ...missingAdminCmds];
  const filteredAdmin = allAdminCmds.filter(c => c.command.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCustoms = data.customCommands.filter(c => c.command.toLowerCase().includes(searchTerm.toLowerCase()) || c.action.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const uniqueCategories = ['All', ...new Set(data.sounds.flatMap(s => (s.categories && s.categories.length > 0) ? s.categories : ['Uncategorized']).filter(Boolean))];

  const filteredSounds = data.sounds
    .filter(s => (s.filename || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => {
      if (soundCategoryFilters.length === 0) return true;
      const cats = (s.categories && s.categories.length > 0) ? s.categories : ['Uncategorized'];
      return soundCategoryFilters.some(filter => cats.includes(filter));
    })
    .sort((a, b) => {
      if (soundSortBy === 'name-asc') return (a.filename || '').localeCompare(b.filename || '');
      if (soundSortBy === 'name-desc') return (b.filename || '').localeCompare(a.filename || '');
      if (soundSortBy === 'date-asc') return (a.uploadedAt || 0) - (b.uploadedAt || 0);
      return (b.uploadedAt || 0) - (a.uploadedAt || 0); 
    });

  return (
    <div className="dashboard-container">
      <div className="sticky-header">
        <div className="nav-tabs">
          <select 
            className="nav-dropdown" 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="home">Home</option>
            <option value="sounds">Playsounds</option>
            <option value="stats">Leaderboards</option>
            <option value="items">Items</option>
            <option value="inventory">Users</option>
            <option value="contribute">Contribute</option>
          </select>
        </div>
        
        <div className="header-controls">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
            <button 
              className="play-button" 
              style={{ width: '40px', height: '40px', padding: 0, flexShrink: 0 }} 
              onClick={() => fetchData(apiUrl)} 
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "spin" : ""} style={{ marginLeft: 0 }} />
            </button>
            <div className="volume-control" style={{ flexGrow: 1 }}>
              <Volume2 size={24} color="#bf94ff" />
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
              <span>{Math.round(volume * 100)}%</span>
            </div>
          </div>

      
          <div className="search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

              <div className="twitch-auth" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {twitchUser ? (
              <>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{twitchUser}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('twitchToken');
                    setTwitchToken(null);
                    setTwitchUser(null);
                  }}
                  style={{ padding: '8px 12px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >Logout</button>
              </>
            ) : (
              <a 
                href={twitchClientId ? `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&response_type=token&scope=&force_verify=false` : '#'}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 16px', 
                  background: 'rgba(145, 70, 255, 0.1)', 
                  border: '1px solid #9146FF',
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap',
                  opacity: twitchClientId ? 1 : 0.5 
                }}
                title={twitchClientId ? '' : 'Loading Client ID...'}
              >
                <img src="/glitch_flat_purple.png" alt="Twitch Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                Login with Twitch
              </a>
            )}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Connecting to server...</div>
      ) : (
        <>
          {activeTab === 'home' && (
            <>
              {data.rewards && Object.keys(data.rewards).length > 0 && (
            <div className="section rewards-section">
              <h2><Settings size={24} style={{marginRight: '8px'}}/> Rewards Configuration</h2>
              <div className="grid">
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Subscription</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.sub} pts</span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Bits</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.bits} pts per bit</span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Gift Sub{data.rewards.giftsub_cap ? ` (max reward ${data.rewards.giftsub_cap.toLocaleString()})` : ''}</h3></div>
                  <div className="card-body"><span className="stat-value">({data.rewards.giftsub} × total gifted subs) {data.rewards.giftsub_scaling ? `+ ((total gifted subs × total gifted subs) × ${data.rewards.giftsub_scaling} )` : ''} </span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Max Buff Bonus (Gamble/Bets)</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.active_action_bonus_cap ? data.rewards.active_action_bonus_cap.toLocaleString() : '5,000'} pts</span></div>
                </div>
                <div className="card">
                        <div className="card-header"><h3 className="card-title">Watch Streak{data.rewards.watchstreak_cap ? ` (max reward ${data.rewards.watchstreak_cap.toLocaleString()})` : ''}</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.watchstreak} {data.rewards.watchstreak_scaling ? `+ ((streak amount × streak amount / 3 ) × ${data.rewards.watchstreak_scaling} )` : ''} </span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title" title="triggered when someone sub,re-sub,gift sub or donate bits" style={{ cursor: 'help', borderBottom: '1px dotted var(--text-muted)', display: 'inline-block' }}>Raffle Points</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.raffle_min} - {data.rewards.raffle_max} pts</span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title" title="triggered when someone sub,re-sub,gift sub or donate bits" style={{ cursor: 'help', borderBottom: '1px dotted var(--text-muted)', display: 'inline-block' }}>Multi-Raffle Winners</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.multiraffle_min} - {data.rewards.multiraffle_max} winners</span></div>
                </div>
                <div className="card">
                  <div className="card-header"><h3 className="card-title">Reward: Chat Cooldown (mins)</h3></div>
                  <div className="card-body"><span className="stat-value">{data.rewards.chat_cooldown} mins</span></div>
                </div>
                {data.economyRates && (
                  <>
                    <div className="card">
                      <div className="card-header"><h3 className="card-title">Point Gain Level Bonus</h3></div>
                      <div className="card-body"><span className="stat-value">{((data.economyRates.lvl_bonus_rate || 0.001) * 100).toFixed(1)}% per level</span></div>
                    </div>
                    <div className="card">
                      <div className="card-header"><h3 className="card-title">Legendary Catch Bonus</h3></div>
                      <div className="card-body"><span className="stat-value">+{data.economyRates.leg_bonus_rate || 0.01}% per level</span></div>
                    </div>
                    <div className="card">
                      <div className="card-header"><h3 className="card-title">Rare Catch Bonus</h3></div>
                      <div className="card-body"><span className="stat-value">+{data.economyRates.rare_bonus_rate || 0.05}% per level</span></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
       
          <div className="section">
            <h2 onClick={() => toggleSection('builtIn')}>
              {collapsed.builtIn ? <ChevronRight size={24} style={{marginRight: '8px'}} /> : <ChevronDown size={24} style={{marginRight: '8px'}} />}
              <Settings size={24} style={{marginRight: '8px'}}/> Built-in Commands
            </h2>
            <div className={`section-content ${collapsed.builtIn ? 'collapsed' : ''}`}>
              <div className="grid">
                {filteredDefaults.map(cmd => (
                  <div key={cmd.command} className="card" onClick={() => copyToClipboard(cmd.command, cmd.command)}>
                    {copiedId === cmd.command && <div className="copy-toast">Copied!</div>}
                    <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{cmd.command}</h3>
                      {cmd.isDisabled && <span style={{ background: '#ff4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Disabled</span>}
                      {cmd.isSubOnly && <span style={{ background: '#9146FF', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Sub Only</span>}
                      {cmd.isOfflineOnly && <span style={{ background: '#555', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Offline Only</span>}
                      <Copy size={18} className="copy-icon" style={{ marginLeft: 'auto' }} />
                    </div>
                    {commandInstructions[cmd.command] && (
                      <div className="card-instruction">{commandInstructions[cmd.command]}</div>
                    )}
                    {(() => {
                      const aliases = Object.keys(builtInAliases).filter(alias => builtInAliases[alias] === cmd.command);
                      if (aliases.length > 0) {
                        return (
                          <div className="card-instruction" style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                            <strong>Aliases: </strong> {aliases.join(', ')}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="card-body">
                      {Object.entries(cmd.settings).map(([key, val]) => {
                        let displayVal = val !== undefined ? val : 'Default';
                        if (val !== undefined && (key.toLowerCase().includes('cooldown') || key.toLowerCase().includes('duration')) && !isNaN(val)) {
                          displayVal = `${(Number(val) / 1000).toFixed(1).replace(/\.0$/, '')}s`;
                        }
                        return (
                          <div className="stat-row" key={key}>
                            <span className="stat-label">{key}:</span>
                            <span className="stat-value">{displayVal}</span>
                          </div>
                        );
                      })}
                      {cmd.command === '!showemote' && data.emoteModifiers && Object.keys(data.emoteModifiers).length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Available Modifiers</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[
                              { key: 'wide', desc: 'Stretches emote horizontally' },
                              { key: 'cursed', desc: 'Grayscale and distorted' },
                              { key: 'flipx', desc: 'Flips horizontally' },
                              { key: 'flipy', desc: 'Flips vertically' },
                              { key: 'bounce', desc: 'Bounces up and down' },
                              { key: 'leave', desc: 'Slides out' },
                              { key: 'arrive', desc: 'Slides in' },
                              { key: 'jam', desc: 'Tilts back and forth' },
                              { key: 'rainbow', desc: 'Rainbow hue effect' },
                              { key: 'hyper', desc: 'Deep fried + fast shaking effect' }
                            ].map(mod => {
                              const modData = data.emoteModifiers[mod.key] || {};
                              return (
                                <div className="stat-row" key={mod.key} title={mod.desc} style={{ cursor: 'help' }}>
                                  <span className="stat-label" style={{ borderBottom: '1px dotted var(--text-muted)' }}>{mod.key}:</span>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span className="stat-value">+{modData.cost || 0} pts</span>
                                    {modData.isDisabled ? (
                                      <span style={{ background: '#ff4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.70em', fontWeight: 'bold' }}>Disabled</span>
                                    ) : (
                                      <span style={{ background: '#00C851', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.70em', fontWeight: 'bold' }}>Enabled</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredDefaults.length === 0 && <p style={{color: 'var(--text-muted)'}}>No default commands found.</p>}
              </div>
            </div>
          </div>

          <div className="section">
            <h2 onClick={() => toggleSection('admin')}>
              {collapsed.admin ? <ChevronRight size={24} style={{marginRight: '8px'}} /> : <ChevronDown size={24} style={{marginRight: '8px'}} />}
              <Shield size={24} style={{marginRight: '8px'}}/> Admin Commands ({filteredAdmin.length})
            </h2>
            <div className={`section-content ${collapsed.admin ? 'collapsed' : ''}`}>
              <div className="grid">
                {filteredAdmin.map(cmd => (
                  <div key={cmd.command} className="card" onClick={() => copyToClipboard(cmd.command, cmd.command)}>
                    {copiedId === cmd.command && <div className="copy-toast">Copied!</div>}
                    <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{cmd.command}</h3>
                      <span style={{ background: '#e53e3e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Admin</span>
                      {cmd.isDisabled && <span style={{ background: '#ff4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Disabled</span>}
                      {cmd.isSubOnly && <span style={{ background: '#9146FF', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Sub Only</span>}
                      {cmd.isOfflineOnly && <span style={{ background: '#555', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Offline Only</span>}
                      <Copy size={18} className="copy-icon" style={{ marginLeft: 'auto' }} />
                    </div>
                    {commandInstructions[cmd.command] && (
                      <div className="card-instruction">{commandInstructions[cmd.command]}</div>
                    )}
                    {(() => {
                      const aliases = Object.keys(builtInAliases).filter(alias => builtInAliases[alias] === cmd.command);
                      if (aliases.length > 0) {
                        return (
                          <div className="card-instruction" style={{ marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                            <strong>Aliases: </strong> {aliases.join(', ')}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="card-body">
                      {cmd.settings && Object.entries(cmd.settings).map(([key, val]) => {
                        let displayVal = val !== undefined ? val : 'Default';
                        if (val !== undefined && (key.toLowerCase().includes('cooldown') || key.toLowerCase().includes('duration')) && !isNaN(val)) {
                          displayVal = `${(Number(val) / 1000).toFixed(1).replace(/\.0$/, '')}s`;
                        }
                        return (
                          <div className="stat-row" key={key}>
                            <span className="stat-label">{key}:</span>
                            <span className="stat-value">{displayVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filteredAdmin.length === 0 && <p style={{color: 'var(--text-muted)'}}>No admin commands found.</p>}
              </div>
            </div>
          </div>

     
          <div className="section">
            <h2 onClick={() => toggleSection('custom')}>
              {collapsed.custom ? <ChevronRight size={24} style={{marginRight: '8px'}} /> : <ChevronDown size={24} style={{marginRight: '8px'}} />}
              <Terminal size={24} style={{marginRight: '8px'}}/> Custom Commands ({filteredCustoms.length})
            </h2>
            <div className={`section-content ${collapsed.custom ? 'collapsed' : ''}`}>
              <div className="grid">
                {filteredCustoms.map(cmd => (
                  <div key={cmd.command} className="card" onClick={() => copyToClipboard(cmd.command, cmd.command)}>
                    {copiedId === cmd.command && <div className="copy-toast">Copied!</div>}
                    <div className="card-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{cmd.command}</h3>
                      {cmd.isDisabled && <span style={{ background: '#ff4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Disabled</span>}
                      {cmd.isSubOnly && <span style={{ background: '#9146FF', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Sub Only</span>}
                      {cmd.isOfflineOnly && <span style={{ background: '#555', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold' }}>Offline Only</span>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                        <span className="badge">{cmd.cost} pts</span>
                        <Copy size={18} className="copy-icon" />
                      </div>
                    </div>
                    <div className="card-body">
                      {cmd.action}
                    </div>
                  </div>
                ))}
                {filteredCustoms.length === 0 && <p style={{color: 'var(--text-muted)'}}>No custom commands found.</p>}
              </div>
            </div>
          </div>
          </>
          )}

          {activeTab === 'sounds' && (
            <div className="section">
            <div className="section-header-flex " onClick={() => toggleSection('sounds')} style={{marginBottom: '16px'}}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '1.4rem' }}>
                {collapsed.sounds ? <ChevronRight size={24} style={{marginRight: '8px', flexShrink: 0}} /> : <ChevronDown size={24} style={{marginRight: '8px', flexShrink: 0}} />}
                <Volume2 size={24} style={{marginRight: '8px', flexShrink: 0}}/>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Available Playsounds ({filteredSounds.length})</span>
              </h2>
              {!collapsed.sounds && (
                <div className="sort-controls" onClick={(e) => e.stopPropagation()} style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                      <label style={{ color: 'var(--text-muted)' }}>Categories:</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          value={soundCategoryInput} 
                          onChange={(e) => {
                            setSoundCategoryInput(e.target.value);
                            setShowCategoryDropdown(true);
                          }}
                          onFocus={() => setShowCategoryDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                          placeholder="Type or select..."
                          style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', padding: '5px 10px', borderRadius: '4px', width: '150px' }}
                        />
                        {showCategoryDropdown && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                            {uniqueCategories.filter(c => c !== 'All' && !soundCategoryFilters.includes(c) && c.toLowerCase().includes(soundCategoryInput.toLowerCase())).map(cat => (
                              <div 
                                key={cat}
                                style={{ padding: '8px 10px', cursor: 'pointer', color: 'white' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setSoundCategoryFilters(prev => [...prev, cat]);
                                  setSoundCategoryInput('');
                                  setShowCategoryDropdown(false);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                {cat}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                      <label style={{ color: 'var(--text-muted)' }}>Sort by:</label>
                      <select 
                        value={soundSortBy} 
                        onChange={(e) => setSoundSortBy(e.target.value)}
                        style={{ background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <option value="date-desc">Date (Newest)</option>
                        <option value="date-asc">Date (Oldest)</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                    </div>
                  </div>
                  {soundCategoryFilters.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'flex-end', maxWidth: '400px' }}>
                      {soundCategoryFilters.map(filter => (
                        <span key={filter} style={{ background: 'var(--accent-color, #c97cff)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#fff' }}>
                          {filter}
                          <button onClick={(e) => { e.stopPropagation(); setSoundCategoryFilters(prev => prev.filter(f => f !== filter)); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: '1' }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={`section-content ${collapsed.sounds ? 'collapsed' : ''}`}>
              <div className="grid">
                {filteredSounds.map(soundObj => {
                  const sound = soundObj.filename;
                  const soundName = sound.split('.').slice(0, -1).join('.');
                  const commandStr = `!playsound ${soundName}`;
                  return (
                    <div key={sound} className="card sound-card" onClick={() => copyToClipboard(commandStr, sound)}>
                      {copiedId === sound && <div className="copy-toast">Copied!</div>}
                      <button className="play-button" onClick={(e) => { e.stopPropagation(); playSound(sound); }}>
                        {playingSound === sound ? <Pause fill="white" /> : <Play fill="white" />}
                      </button>
                      <div className="sound-info">
                        <p className="sound-name" title={soundName}>{soundName}</p>
                        <p className="sound-command">{commandStr}</p>
                        <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {(soundObj.categories || (soundObj.category ? [soundObj.category] : ['Uncategorized'])).map(cat => (
                            <span 
                              key={cat}
                              title="Add to filter"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!soundCategoryFilters.includes(cat)) {
                                  setSoundCategoryFilters(prev => [...prev, cat]);
                                }
                              }}
                              style={{ fontSize: '0.7rem', background: 'rgba(201, 124, 255, 0.2)', color: 'var(--accent-color, #c97cff)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', border: '1px solid rgba(201, 124, 255, 0.4)' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 124, 255, 0.4)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 124, 255, 0.2)'}
                            >
                              {cat}
                            </span>
                          ))}
                          {soundObj.customCost && <span style={{ fontSize: '0.7rem', background: 'rgba(255,170,0,0.2)', color: '#ffaa00', padding: '2px 6px', borderRadius: '4px' }}>Cost: {soundObj.customCost}</span>}
                          {soundObj.customCooldown && <span style={{ fontSize: '0.7rem', background: 'rgba(46,139,87,0.2)', color: '#2e8b57', padding: '2px 6px', borderRadius: '4px' }}>CD: {!isNaN(soundObj.customCooldown) ? `${(Number(soundObj.customCooldown) / 1000).toFixed(1).replace(/\\.0$/, '')}s` : `${soundObj.customCooldown}ms`}</span>}
                        </div>
                      </div>
                      <Copy size={18} className="copy-icon" />
                    </div>
                  )
                })}
                {filteredSounds.length === 0 && <p style={{color: 'var(--text-muted)'}}>No sounds found.</p>}
              </div>
            </div>
          </div>
          )}

          {activeTab === 'stats' && (
          <div className="section">
            <h2 onClick={() => toggleSection('stats')}>
              {collapsed.stats ? <ChevronRight size={24} style={{marginRight: '8px'}} /> : <ChevronDown size={24} style={{marginRight: '8px'}} />}
              <Database size={24} style={{marginRight: '8px'}}/> Leaderboards & Stats
            </h2>
            <div className={`section-content ${collapsed.stats ? 'collapsed' : ''}`}>
              <Leaderboards 
                userStats={data.userStats} 
                emoteStats={data.emoteStats} 
                statsSort={statsSort} 
                setStatsSort={setStatsSort} 
              />
            </div>
          </div>
          )}

          {activeTab === 'items' && (
            <ItemsDirectory items={data.items} rarities={data.rarities} />
          )}

          {activeTab === 'contribute' && (
          <Submissions twitchUser={twitchUser} twitchToken={twitchToken} apiUrl={apiUrl} />
        )}

        {activeTab === 'inventory' && (
            <UserInventory inventory={data.inventory} items={data.items} activeEffects={data.activeEffects} userModifiers={data.userModifiers} pendingFish={data.pendingFish} userStats={data.userStats} economyRates={data.economyRates} twitchUser={twitchUser} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
