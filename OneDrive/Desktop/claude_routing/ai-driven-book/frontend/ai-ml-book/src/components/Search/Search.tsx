import React, { useState, useEffect, useRef } from 'react';
import { useBookStore } from '../store/bookStore';
import styles from './Search.module.css';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  chapter: string;
  section: string;
  relevance: number;
}

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const progress = useBookStore((state) => state.progress);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setSelectedIndex(-1);

    try {
      // Use the chat API to search
      const response = await fetch('/api/chat/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: searchQuery,
          context_level: 'detailed'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const formattedResults = data.results.map((result: any) => ({
          id: result.source_id,
          title: result.metadata?.section_title || `Content ${result.source_id}`,
          content: result.content.substring(0, 200) + '...',
          chapter: result.metadata?.chapter_title || 'Unknown Chapter',
          section: result.metadata?.section_title || 'Unknown Section',
          relevance: result.score
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((query: string) => handleSearch(query), 300)
  );

  useEffect(() => {
    debouncedSearch.current(query);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the specific section or highlight it
    console.log('Navigating to:', result);
    setShowResults(false);
    setQuery('');
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return '#10b981';
    if (relevance >= 0.6) return '#3b82f6';
    if (relevance >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <div className={styles.searchWrapper}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setShowResults(true)}
            placeholder="Search book content..."
            className={styles.searchInput}
          />
          {query && (
            <button
              className={styles.clearButton}
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
            >
              ✕
            </button>
          )}
        </div>

        {showResults && (
          <div className={styles.resultsContainer}>
            {isSearching ? (
              <div className={styles.loading}>
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    className={`${styles.resultItem} ${
                      index === selectedIndex ? styles.selected : ''
                    }`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={styles.resultHeader}>
                      <span
                        className={styles.relevanceBadge}
                        style={{ backgroundColor: getRelevanceColor(result.relevance) }}
                      >
                        {Math.round(result.relevance * 100)}%
                      </span>
                      <span className={styles.resultTitle}>{result.title}</span>
                    </div>
                    <div className={styles.resultMeta}>
                      <span className={styles.chapter}>{result.chapter}</span>
                      <span className={styles.section}>{result.section}</span>
                    </div>
                    <div className={styles.resultContent}>
                      {result.content}
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className={styles.noResults}>
                <span>❌</span>
                <p>No results found</p>
                <p className={styles.suggestion}>
                  Try using different keywords or ask the AI assistant for help
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}