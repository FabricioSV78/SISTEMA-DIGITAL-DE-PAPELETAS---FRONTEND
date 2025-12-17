import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Autocomplete simple component
 * Props:
 * - name, value, onChange(eventLike), suggestions: string[]
 */
const Autocomplete = ({ name, value, onChange, suggestions = [], placeholder = '', className = '', required = false }) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Helper para normalizar (quitar tildes/diacríticos) y comparar
  const normalize = (str) => {
    if (!str) return '';
    try {
      return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    } catch (err) {
      return String(str).toLowerCase();
    }
  };

  useEffect(() => {
    if (!query) {
      setFiltered(suggestions.slice(0, 10));
      return;
    }

    const q = query.trim();
    const qNorm = normalize(q);

    const results = suggestions
      .map(s => ({ s, n: normalize(s) }))
      .map(x => ({ s: x.s, i: x.n.indexOf(qNorm), n: x.n }))
      .filter(x => x.i !== -1)
      .sort((a, b) => a.i - b.i || a.n.localeCompare(b.n))
      .map(x => x.s)
      .slice(0, 8);

    setFiltered(results);
  }, [query, suggestions]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const emitChange = (val) => {
    if (onChange) {
      // call like a real event
      onChange({ target: { name, value: val } });
    }
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    setActiveIndex(-1);
    emitChange(v);
  };

  const handleSelect = (val) => {
    setQuery(val);
    setOpen(false);
    setActiveIndex(-1);
    emitChange(val);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`position-relative ${className}`} ref={containerRef}>
      <input
        type="text"
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        required={required}
      />

      {open && filtered && filtered.length > 0 && (
        <ul
          className="list-group position-absolute w-100 shadow"
          role="listbox"
          aria-label="Sugerencias"
          style={{ zIndex: 1100, maxHeight: 220, overflowY: 'auto' }}
        >
          {filtered.map((s, idx) => (
            <li
              id={`${name}-option-${idx}`}
              key={s}
              className={`list-group-item list-group-item-action ${idx === activeIndex ? 'active' : ''}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(ev) => { ev.preventDefault(); handleSelect(s); }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Autocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  suggestions: PropTypes.array,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool
};

export default Autocomplete;
