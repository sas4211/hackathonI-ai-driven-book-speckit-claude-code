import React, {useEffect, useRef, useState} from 'react';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Focus search input when pressing the '/' key
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')
      ) {
        inputRef.current?.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search page with query parameter
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit} role="search">
      <div className={styles.searchBarInput}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder={translate({
            id: 'theme.SearchBar.placeholder',
            message: 'Search the book...',
            description: 'The placeholder of the search bar',
          })}
          value={query}
          onChange={handleInput}
          aria-label={translate({
            id: 'theme.SearchBar.placeholder',
            message: 'Search the book...',
            description: 'The placeholder of the search bar',
          })}
        />
        {query && (
          <button
            className={styles.clearButton}
            type="button"
            onClick={clearQuery}
            aria-label={translate({
              id: 'theme.SearchBar.clearButtonLabel',
              message: 'Clear search query',
              description: 'The label of the button to clear the search query',
            })}
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}