const fs = require('fs');
const path = require('path');

const chapters = {
  'chapter-1': ['history-of-ai', 'principles', 'lab-setup'],
  'chapter-2': ['data-cleaning', 'feature-engineering', 'data-normalization', 'handling-missing-data', 'practical-exercise'],
  'chapter-3': ['linear-regression', 'logistic-regression', 'decision-trees', 'random-forests', 'model-evaluation', 'hands-on-project'],
  'chapter-4': ['clustering', 'k-means', 'pca', 'uncommon-algorithms', 'visualization'],
  'chapter-5': ['neural-networks', 'cnn', 'rnn', 'training-techniques', 'build-your-own-network'],
  'chapter-6': ['tokenization', 'word-embeddings', 'transformers', 'llm-overview', 'fine-tuning'],
  'appendix': ['a-math-primer', 'python-basics', 'useful-libraries', 'further-reading']
};

const basePath = './docs';
let created = 0;

Object.keys(chapters).forEach(chapter => {
  const chapterPath = path.join(basePath, chapter);
  if (!fs.existsSync(chapterPath)) {
    fs.mkdirSync(chapterPath, { recursive: true });
  }

  chapters[chapter].forEach(file => {
    const filePath = path.join(chapterPath, `${file}.mdx`);
    if (!fs.existsSync(filePath)) {
      const content = `---
sidebar_position: ${chapters[chapter].indexOf(file) + 2}
---

# ${file.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}

// Content for ${file}

${file.toUpperCase()} section placeholder - interactive content will be added during implementation.
`;
      fs.writeFileSync(filePath, content);
      created++;
    }
  });
});

console.log(`Created ${created} placeholder files`);