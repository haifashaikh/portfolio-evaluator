import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar({ initialValue = '', compact = false }) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = value.trim();
    if (!username) return;
    navigate(`/report/${username}`);
  };

  return (
    <form
      className={`search-bar ${focused ? 'search-bar--focused' : ''} ${compact ? 'search-bar--compact' : ''}`}
      onSubmit={handleSubmit}
    >
      <span className="search-bar__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>

      <input
        className="search-bar__input"
        type="text"
        placeholder="Enter GitHub username…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        spellCheck="false"
        aria-label="GitHub username"
      />

      <button className="search-bar__btn" type="submit" disabled={!value.trim()}>
        <span>Analyse</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
