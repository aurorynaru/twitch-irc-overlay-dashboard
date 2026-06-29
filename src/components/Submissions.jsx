import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryInput = ({ type, apiUrl, categories, setCategories }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cleanUrl = apiUrl.replace(/\/$/, '');
        const res = await axios.get(`${cleanUrl}/api/categories/${type}`);
        if (res.data.success) {
          setAvailableCategories(res.data.categories);
        }
      } catch (e) {
        console.error('Failed to fetch categories', e);
      }
    };
    if (apiUrl) fetchCategories();
  }, [type, apiUrl]);

  const handleInputChange = (e) => {
    const val = e.target.value.toLowerCase();
    setInputValue(val);
    if (val.trim()) {
      setSuggestions(availableCategories.filter(c => c.toLowerCase().includes(val.toLowerCase()) && !categories.includes(c)));
    } else {
      setSuggestions([]);
    }
  };

  const addCategory = (cat) => {
    const lowerCat = cat.trim().toLowerCase();
    if (categories.length < 3 && lowerCat && !categories.includes(lowerCat)) {
      setCategories([...categories, lowerCat]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory(inputValue);
    }
  };

  const removeCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <label style={{ fontWeight: 'bold' }}>Categories (Required, Max 5) - Press Enter to add</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: categories.length > 0 ? '5px' : '0' }}>
        {categories.map(c => (
          <span key={c} style={{ background: 'var(--accent)', padding: '5px 10px', borderRadius: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {c}
            <button type="button" onClick={() => removeCategory(c)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', fontSize: '14px' }}>&times;</button>
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={categories.length >= 5 ? "Limit reached" : "e.g. funny"}
          disabled={categories.length >= 5}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white', boxSizing: 'border-box' }}
        />
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 10, maxHeight: '150px', overflowY: 'auto', marginTop: '5px' }}>
            {suggestions.map(s => (
              <div 
                key={s} 
                onClick={() => addCategory(s)}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-color)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Submissions = ({ twitchUser, twitchToken, apiUrl }) => {
  const [activeTab, setActiveTab] = useState('playsound');
  
  const [playsoundLink, setPlaysoundLink] = useState('');
  const [playsoundName, setPlaysoundName] = useState('');
  const [playsoundDesc, setPlaysoundDesc] = useState('');
  
  const [triviaQuestion, setTriviaQuestion] = useState('');
  const [triviaAnswer, setTriviaAnswer] = useState('');
  const [triviaHint, setTriviaHint] = useState('');
  
  const [playsoundCategories, setPlaysoundCategories] = useState([]);
  const [triviaCategories, setTriviaCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const submitForm = async (e) => {
    e.preventDefault();
    if (!twitchToken) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const cleanUrl = apiUrl.replace(/\/$/, '');
      let content = '';
      let answer = '';

      if (activeTab === 'playsound') {
        if (!playsoundLink || !playsoundName) throw new Error('Link and Playsound Name are required');
        if (playsoundCategories.length === 0) throw new Error('At least one Category is required');
        
        const linkLower = playsoundLink.toLowerCase();
        if (!linkLower.includes('nuuls.com')) {
          throw new Error('Only nuuls.com links are allowed for playsounds!');
        }
        if (!linkLower.endsWith('.mp3') && !linkLower.endsWith('.ogg')) {
          throw new Error('The nuuls link must end with .mp3 or .ogg!');
        }

        const catStr = playsoundCategories.length > 0 ? `\nCategories: ${playsoundCategories.join(', ')}` : '';
        content = `Command Name: !playsound ${playsoundName}\nLink: ${playsoundLink}\nDescription: ${playsoundDesc}${catStr}`;
      } else {
        if (!triviaQuestion || !triviaAnswer) throw new Error('Question and Answer are required');
        if (triviaCategories.length === 0) throw new Error('At least one Category is required');
        content = JSON.stringify({ question: triviaQuestion, hint: triviaHint, categories: triviaCategories });
        answer = triviaAnswer;
      }

      const res = await axios.post(`${cleanUrl}/api/submissions`, {
        token: twitchToken,
        type: activeTab,
        content,
        answer
      });

      if (res.data.success) {
        setMessage({ text: 'Successfully submitted for review!', type: 'success' });
        setPlaysoundLink('');
        setPlaysoundName('');
        setPlaysoundDesc('');
        setPlaysoundCategories([]);
        setTriviaQuestion('');
        setTriviaAnswer('');
        setTriviaHint('');
        setTriviaCategories([]);
      } else {
        setMessage({ text: res.data.error || 'Failed to submit', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.error || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!twitchUser) {
    return (
      <div className="section">
        <h2>Contribute</h2>
        <div className="section-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>You must be logged in to submit content.</h3>
          <p>Please use the <strong>Login with Twitch</strong> button in the header above to authenticate your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span>Contribute</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('playsound'); setMessage({text:'', type:''}); }}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: activeTab === 'playsound' ? 'var(--accent)' : 'var(--panel-bg)',
              color: 'white'
            }}
          >
            Submit Playsound
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('trivia'); setMessage({text:'', type:''}); }}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold',
              background: activeTab === 'trivia' ? 'var(--accent)' : 'var(--panel-bg)',
              color: 'white'
            }}
          >
            Submit Trivia
          </button>
        </div>
      </h2>
      
      <div className="section-content">
        <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
          
          {message.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              background: message.type === 'success' ? 'rgba(0, 200, 81, 0.2)' : 'rgba(255, 68, 68, 0.2)',
              color: message.type === 'success' ? '#00C851' : '#ff4444',
              border: `1px solid ${message.type === 'success' ? '#00C851' : '#ff4444'}`
            }}>
              {message.text}
            </div>
          )}

          {activeTab === 'playsound' ? (
            <>
              <div style={{ background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
                <strong>Tip:</strong> A link to <code>https://nuuls.com/</code> with an already clipped and edited audio file (mp3 or ogg) is highly preferred!
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Audio Link</label>
                <input 
                  type="url" 
                  value={playsoundLink}
                  onChange={(e) => setPlaysoundLink(e.target.value)}
                  placeholder="https://nuuls.com/..."
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Playsound Name</label>
                <input 
                  type="text" 
                  value={playsoundName}
                  onChange={(e) => setPlaysoundName(e.target.value)}
                  placeholder="e.g. bonk"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Description / Timestamp (Optional)</label>
                <textarea 
                  value={playsoundDesc}
                  onChange={(e) => setPlaysoundDesc(e.target.value)}
                  placeholder="e.g. Please clip from 0:15 to 0:18, command name could be !wow"
                  rows={4}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white', resize: 'vertical' }}
                />
              </div>
              <CategoryInput type="playsound" apiUrl={apiUrl} categories={playsoundCategories} setCategories={setPlaysoundCategories} />
            </>
          ) : (
            <>
              <div style={{ background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
                Submit fun trivia questions for chat to guess! Be sure the answer isn't too long or hard to spell.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Trivia Question</label>
                <input 
                  type="text" 
                  value={triviaQuestion}
                  onChange={(e) => setTriviaQuestion(e.target.value)}
                  placeholder="1+1"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Correct Answer</label>
                <input 
                  type="text" 
                  value={triviaAnswer}
                  onChange={(e) => setTriviaAnswer(e.target.value)}
                  placeholder="2"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Hint (Optional)</label>
                <input 
                  type="text" 
                  value={triviaHint}
                  onChange={(e) => setTriviaHint(e.target.value)}
                  placeholder="3-1"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white' }}
                />
              </div>
              <CategoryInput type="trivia" apiUrl={apiUrl} categories={triviaCategories} setCategories={setTriviaCategories} />
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px', 
              background: loading ? 'var(--text-muted)' : 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Submissions;
