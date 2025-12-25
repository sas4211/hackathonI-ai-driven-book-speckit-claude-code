# Search Integration Guide

This guide explains how to integrate search functionality into the AI & ML Interactive Book.

## Quick Start

To enable search functionality, follow these steps:

### 1. Install Dependencies

```bash
npm install @cmfcmf/docusaurus-search-local
```

### 2. Configure Plugin

Add the search plugin to your `docusaurus.config.ts`:

```typescript
plugins: [
  [
    '@cmfcmf/docusaurus-search-local',
    {
      indexDocs: true,
      indexBlog: true,
      indexPages: false,
      language: 'en',
    },
  ],
],
```

### 3. Add Search to Navbar

Include the search component in your navbar configuration:

```typescript
navbar: {
  items: [
    // ... other items
    {
      type: 'search',
      position: 'right',
    },
  ],
},
```

### 4. Create Search Page

Create a custom search results page at `src/pages/search.tsx`:

```typescript
import React from 'react';
import Layout from '@theme/Layout';

export default function SearchPage() {
  return (
    <Layout title="Search" description="Search the AI & ML Interactive Book">
      <div>Search functionality is provided by the local search plugin</div>
    </Layout>
  );
}
```

### 5. Custom Search Bar (Optional)

For a custom search bar, create `src/theme/SearchBar/index.tsx`:

```typescript
import React, {useEffect, useRef} from 'react';
import {useSearchLink} from '@docusaurus/theme-common';

export default function SearchBar() {
  const searchLink = useSearchLink();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) {
        inputRef.current?.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      window.location.href = searchLink(input.value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} placeholder="Search the book..." />
    </form>
  );
}
```

## Configuration Options

### Plugin Options

```typescript
{
  indexDocs: boolean,        // Index documentation pages (default: true)
  indexBlog: boolean,        // Index blog posts (default: true)
  indexPages: boolean,       // Index other pages (default: false)
  language: string,          // Language for indexing (default: 'en')
  maxSearchResults: number,  // Max results to show (default: '8')
  style: object,             // Custom styling options
  removeDefaultStyling: boolean, // Remove default CSS (default: false)
}
```

### Algolia Integration (Alternative)

For production deployments with higher search requirements:

```typescript
algolia: {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_API_KEY',
  indexName: 'YOUR_INDEX_NAME',
  contextualSearch: true,
  searchPagePath: 'search',
},
```

## Customization

### Styling Search Components

Create custom CSS modules to style search components:

```css
/* src/theme/SearchBar/styles.module.css */
.searchBar {
  /* Custom search bar styles */
}

.searchInput {
  /* Custom input styles */
}
```

### Search Results Page

Customize the search results page:

```typescript
// src/pages/search.tsx
interface SearchHit {
  title: string;
  url: string;
  excerpt?: string;
  // ... other properties
}

function SearchResults() {
  // Custom search results logic
}
```

## API Reference

### useSearchLink Hook

```typescript
import {useSearchLink} from '@docusaurus/theme-common';

const SearchComponent = () => {
  const searchLink = useSearchLink();
  // Use searchLink(query) to get search URL
};
```

### Search Events

Listen for search events:

```javascript
window.addEventListener('search:open', () => {
  // Search modal opened
});

window.addEventListener('search:close', () => {
  // Search modal closed
});
```

## Best Practices

1. **Content Structure**: Use proper heading hierarchy for better search results
2. **Frontmatter**: Include relevant keywords in page frontmatter
3. **Performance**: Limit indexing to essential content only
4. **Accessibility**: Ensure search components are keyboard accessible
5. **Mobile**: Test search functionality on mobile devices

## Common Issues

### Search Not Working
- Check plugin installation
- Verify configuration syntax
- Ensure content is properly indexed

### Poor Search Results
- Review content structure and headings
- Check language configuration
- Consider adding more descriptive content

### Performance Issues
- Limit indexed content
- Check for very large documents
- Monitor bundle size

## Advanced Features

### Custom Search Indexing

```typescript
{
  indexDocs: true,
  indexBlog: true,
  indexPages: false,
  language: 'en',
  hashed: true,  // Enable hashed filenames for better caching
}
```

### Multiple Languages

```typescript
{
  language: ['en', 'es', 'fr'],  // Support multiple languages
}
```

### Custom Search Components

Create custom search components for specific needs:

```typescript
// Custom search component
const CustomSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Custom search logic
  return <div>Custom search UI</div>;
};
```