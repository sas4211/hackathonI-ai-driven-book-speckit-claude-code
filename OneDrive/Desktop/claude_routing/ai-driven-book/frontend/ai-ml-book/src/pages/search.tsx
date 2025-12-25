import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import styles from './search.module.css';

interface SearchHit {
  objectID: string;
  url: string;
  title: string;
  excerpt?: string;
  hierarchy: {
    lvl0?: string;
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
    lvl4?: string;
    lvl5?: string;
    lvl6?: string;
  };
  content?: string;
  anchor?: string;
}

function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setHits([]);
      return;
    }

    // Initialize search when the page loads
    // This will trigger Docusaurus's built-in search functionality
    setLoading(true);
    setError(null);

    // Check if the search plugin is loaded
    const checkSearchPlugin = () => {
      // Try to access the search plugin if it's available
      if (typeof window !== 'undefined' && (window as any).__docusaurus_search) {
        // Search plugin is available, use it
        const searchPlugin = (window as any).__docusaurus_search;
        if (searchPlugin.search) {
          try {
            const results = searchPlugin.search(query);
            setHits(results || []);
            setLoading(false);
          } catch (err) {
            setError('Search plugin error');
            setLoading(false);
          }
        }
      } else {
        // Fallback: use mock data for now
        setTimeout(() => {
          const mockHits: SearchHit[] = [
            {
              objectID: '1',
              url: '/intro',
              title: 'Introduction to Machine Learning',
              excerpt: 'Learn the basics of machine learning and AI concepts.',
              hierarchy: {
                lvl0: 'Book',
                lvl1: 'Introduction',
                lvl2: 'What is Machine Learning?'
              }
            },
            {
              objectID: '2',
              url: '/tutorial/linear-regression',
              title: 'Linear Regression Tutorial',
              excerpt: 'Step-by-step guide to implementing linear regression.',
              hierarchy: {
                lvl0: 'Tutorial',
                lvl1: 'Supervised Learning',
                lvl2: 'Linear Regression'
              }
            },
            {
              objectID: '3',
              url: '/docs/chapter1/linear-algebra',
              title: 'Linear Algebra Fundamentals',
              excerpt: 'Essential linear algebra concepts for machine learning.',
              hierarchy: {
                lvl0: 'Book',
                lvl1: 'Chapter 1',
                lvl2: 'Linear Algebra'
              }
            }
          ];

          setHits(mockHits);
          setLoading(false);
        }, 300);
      }
    };

    checkSearchPlugin();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const newQuery = input.value.trim();

    if (newQuery) {
      window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <h1>
          {translate({
            id: 'theme.SearchResults.title',
            message: 'Search',
            description: 'The title of the search page',
          })}
        </h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            defaultValue={query}
            placeholder={translate({
              id: 'theme.SearchBar.placeholder',
              message: 'Search the book...',
              description: 'The placeholder of the search bar',
            })}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            🔍
          </button>
        </form>
      </div>

      <div className={styles.resultsContainer}>
        {loading && (
          <div className={styles.loading}>
            {translate({
              id: 'theme.SearchResults.loading',
              message: 'Searching...',
              description: 'The loading text for search results',
            })}
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {translate({
              id: 'theme.SearchResults.error',
              message: 'An error occurred while searching. Please try again.',
              description: 'Error message when search fails',
            })}
          </div>
        )}

        {!loading && !error && hits.length === 0 && query && (
          <div className={styles.noResults}>
            {translate({
              id: 'theme.SearchResults.noResults',
              message: 'No results found for "{query}". Try adjusting your search terms.',
              description: 'The message when no search results are found',
              values: {query},
            })}
          </div>
        )}

        {!loading && !error && hits.length > 0 && (
          <div className={styles.resultsList}>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                {translate({
                  id: 'theme.SearchResults.count',
                  message: '{count} results found',
                  description: 'The number of search results found',
                  values: {count: hits.length},
                })}
              </span>
              <span className={styles.resultsQuery}>
                {translate({
                  id: 'theme.SearchResults.forQuery',
                  message: 'for "{query}"',
                  description: 'The query being searched for',
                  values: {query},
                })}
              </span>
            </div>

            <div className={styles.results}>
              {hits.map((hit) => (
                <div key={hit.objectID} className={styles.resultItem}>
                  <a href={hit.url + (hit.anchor ? `#${hit.anchor}` : '')} className={styles.resultLink}>
                    <h3 className={styles.resultTitle}>
                      {hit.hierarchy.lvl0 && (
                        <span className={styles.breadcrumb}>
                          {hit.hierarchy.lvl0}
                          {hit.hierarchy.lvl1 && ` › ${hit.hierarchy.lvl1}`}
                        </span>
                      )}
                      <span className={styles.titleText}>{hit.title}</span>
                    </h3>
                    {hit.excerpt && (
                      <p className={styles.resultExcerpt}>{hit.excerpt}</p>
                    )}
                    <div className={styles.resultUrl}>
                      {new URL(hit.url, window.location.origin).pathname}
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title="Search" description="Search the AI & ML Interactive Book">
      <div className={styles.pageContainer}>
        <SearchResults />
      </div>
    </Layout>
  );
}