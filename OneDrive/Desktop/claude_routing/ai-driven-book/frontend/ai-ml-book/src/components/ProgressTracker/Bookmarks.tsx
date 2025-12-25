import React, { useState } from 'react';
import { useProgress } from './useProgress';
import styles from './Bookmarks.module.css';

interface BookmarkForm {
  chapter: string;
  section: string;
  title: string;
  content: string;
  tags: string;
  isPublic: boolean;
}

const Bookmarks: React.FC = () => {
  const {
    progress,
    addBookmark,
    removeBookmark,
    updateBookmark,
    addNote,
    updateNote,
    deleteNote,
  } = useProgress();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookmarkForm>({
    chapter: '',
    section: '',
    title: '',
    content: '',
    tags: '',
    isPublic: false,
  });

  const [noteContent, setNoteContent] = useState<string>('');

  const chaptersData = [
    { id: 'intro', name: 'Introduction' },
    { id: 'chapter-1', name: 'Chapter 1: Foundations of AI' },
    { id: 'chapter-2', name: 'Chapter 2: Mathematical Foundations' },
    { id: 'chapter-3', name: 'Chapter 3: Linear Regression' },
    { id: 'chapter-4', name: 'Chapter 4: Classification' },
    { id: 'chapter-5', name: 'Chapter 5: Unsupervised Learning' },
    { id: 'chapter-6', name: 'Chapter 6: Neural Networks' },
    { id: 'chapter-7', name: 'Chapter 7: Deep Learning' },
    { id: 'chapter-8', name: 'Chapter 8: NLP' },
    { id: 'chapter-9', name: 'Chapter 9: Computer Vision' },
    { id: 'chapter-10', name: 'Chapter 10: Reinforcement Learning' },
    { id: 'chapter-11', name: 'Chapter 11: Model Deployment' },
    { id: 'chapter-12', name: 'Chapter 12: Ethics & Future' },
  ];

  const handleAddBookmark = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in the title and content');
      return;
    }

    addBookmark({
      chapter: formData.chapter,
      section: formData.section,
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic: formData.isPublic,
    });

    setFormData({
      chapter: '',
      section: '',
      title: '',
      content: '',
      tags: '',
      isPublic: false,
    });
    setShowForm(false);
  };

  const handleEditBookmark = (bookmarkId: string) => {
    const bookmark = progress.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      setFormData({
        chapter: bookmark.chapter,
        section: bookmark.section,
        title: bookmark.title,
        content: bookmark.content,
        tags: bookmark.tags.join(', '),
        isPublic: bookmark.isPublic,
      });
      setIsEditing(bookmarkId);
    }
  };

  const handleUpdateBookmark = () => {
    if (!isEditing) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in the title and content');
      return;
    }

    updateBookmark(isEditing, {
      chapter: formData.chapter,
      section: formData.section,
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic: formData.isPublic,
    });

    setIsEditing(null);
    setFormData({
      chapter: '',
      section: '',
      title: '',
      content: '',
      tags: '',
      isPublic: false,
    });
  };

  const handleAddNote = (path: string) => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    addNote(path, noteContent);
    setNoteContent('');
  };

  const handleUpdateNote = (noteId: string) => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    updateNote(noteId, noteContent);
    setEditingNote(null);
    setNoteContent('');
  };

  const getChapterName = (chapterId: string) => {
    const chapter = chaptersData.find(ch => ch.id === chapterId);
    return chapter ? chapter.name : chapterId;
  };

  return (
    <div className={styles.bookmarks}>
      <div className={styles.bookmarksHeader}>
        <h3>🔖 Bookmarks & Notes</h3>
        <button
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '➕ Add Bookmark'}
        </button>
      </div>

      {/* Add/Edit Bookmark Form */}
      {(showForm || isEditing) && (
        <div className={styles.bookmarkForm}>
          <h4>{isEditing ? 'Edit Bookmark' : 'Add New Bookmark'}</h4>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Chapter</label>
              <select
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
              >
                <option value="">Select Chapter</option>
                {chaptersData.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g., 3.2, 4.1, etc."
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Bookmark title"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Bookmark content or summary"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., important, concept, example"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              Make this bookmark public
            </label>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.saveButton}
              onClick={isEditing ? handleUpdateBookmark : handleAddBookmark}
            >
              {isEditing ? 'Update Bookmark' : 'Save Bookmark'}
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setShowForm(false);
                setIsEditing(null);
                setFormData({
                  chapter: '',
                  section: '',
                  title: '',
                  content: '',
                  tags: '',
                  isPublic: false,
                });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      <div className={styles.bookmarksList}>
        <h4>Bookmarks ({progress.bookmarks.length})</h4>
        {progress.bookmarks.length === 0 ? (
          <p className={styles.noBookmarks}>No bookmarks yet. Create your first bookmark!</p>
        ) : (
          progress.bookmarks
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(bookmark => (
              <div key={bookmark.id} className={styles.bookmarkItem}>
                <div className={styles.bookmarkHeader}>
                  <div className={styles.bookmarkTitle}>
                    <h5>{bookmark.title}</h5>
                    <span className={styles.bookmarkChapter}>
                      {getChapterName(bookmark.chapter)}
                      {bookmark.section && ` • ${bookmark.section}`}
                    </span>
                  </div>
                  <div className={styles.bookmarkActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditBookmark(bookmark.id)}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={styles.bookmarkContent}>
                  <p>{bookmark.content}</p>
                </div>

                <div className={styles.bookmarkMeta}>
                  <div className={styles.tags}>
                    {bookmark.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.metaInfo}>
                    <span className={styles.timestamp}>
                      {new Date(bookmark.timestamp).toLocaleDateString()}
                    </span>
                    {bookmark.isPublic && (
                      <span className={styles.publicBadge}>Public</span>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Notes List */}
      <div className={styles.notesList}>
        <h4>Notes ({Object.keys(progress.notes).length})</h4>
        {Object.entries(progress.notes).length === 0 ? (
          <p className={styles.noNotes}>No notes yet. Add your first note!</p>
        ) : (
          Object.entries(progress.notes)
            .sort(([, a], [, b]) => b.localeCompare(a))
            .map(([noteId, content]) => (
              <div key={noteId} className={styles.noteItem}>
                <div className={styles.noteHeader}>
                  <span className={styles.notePath}>{noteId.split('_')[0]}</span>
                  <div className={styles.noteActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setEditingNote(noteId);
                        setNoteContent(content);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteNote(noteId)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {editingNote === noteId ? (
                  <div className={styles.noteEdit}>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Edit note content..."
                      rows={3}
                    />
                    <div className={styles.noteActions}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleUpdateNote(noteId)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          setEditingNote(null);
                          setNoteContent('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noteContent}>
                    <p>{content}</p>
                  </div>
                )}

                <div className={styles.noteMeta}>
                  <span className={styles.timestamp}>
                    {new Date(parseInt(noteId.split('_')[1])).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
        )}

        {/* Add Note Form */}
        <div className={styles.addNoteForm}>
          <h5>Add Note</h5>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Path/Location</label>
              <input
                type="text"
                placeholder="e.g., chapter-3/section-2, page-45, etc."
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Note Content</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add your note here..."
              rows={3}
            />
          </div>
          <button
            className={styles.addButton}
            onClick={() => handleAddNote('custom')}
          >
            ➕ Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;