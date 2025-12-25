import React, { useState } from 'react';
import { useProgress } from './useProgress';
import styles from './InlineNotes.module.css';

interface InlineNotesProps {
  contentPath: string;
  chapter?: string;
  section?: string;
  children?: React.ReactNode;
}

const InlineNotes: React.FC<InlineNotesProps> = ({
  contentPath,
  chapter,
  section,
  children
}) => {
  const { addNote, updateNote, deleteNote, progress } = useProgress();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Filter notes for this specific content path
  const contentNotes = Object.entries(progress.notes).filter(([noteId]) =>
    noteId.includes(contentPath)
  );

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    addNote(contentPath, noteContent);
    setNoteContent('');
    setShowNoteForm(false);
  };

  const handleUpdateNote = (noteId: string) => {
    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    updateNote(noteId, noteContent);
    setEditingNoteId(null);
    setNoteContent('');
  };

  const handleEditNote = (noteId: string, currentContent: string) => {
    setEditingNoteId(noteId);
    setNoteContent(currentContent);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const startEditing = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setNoteContent(content);
  };

  return (
    <div className={styles.inlineNotes}>
      {children}

      {/* Notes Display */}
      {contentNotes.length > 0 && (
        <div className={styles.notesContainer}>
          <h4>📝 Your Notes</h4>
          {contentNotes.map(([noteId, content]) => (
            <div key={noteId} className={styles.noteCard}>
              {editingNoteId === noteId ? (
                <div className={styles.editingNote}>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className={styles.editTextarea}
                    rows={4}
                  />
                  <div className={styles.editActions}>
                    <button
                      onClick={() => handleUpdateNote(noteId)}
                      className={styles.saveEditBtn}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteContent('');
                      }}
                      className={styles.cancelEditBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.noteContent}>
                    <p>{content}</p>
                  </div>
                  <div className={styles.noteActions}>
                    <button
                      onClick={() => startEditing(noteId, content)}
                      className={styles.editBtn}
                      title="Edit note"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteNote(noteId)}
                      className={styles.deleteBtn}
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className={styles.noteMeta}>
                    <span className={styles.noteTimestamp}>
                      {new Date(parseInt(noteId.split('_')[1])).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Button */}
      <div className={styles.addNoteSection}>
        {showNoteForm ? (
          <div className={styles.noteForm}>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note here..."
              className={styles.noteTextarea}
              rows={4}
            />
            <div className={styles.formActions}>
              <button onClick={handleAddNote} className={styles.saveNoteBtn}>
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteContent('');
                }}
                className={styles.cancelNoteBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNoteForm(true)}
            className={styles.addNoteBtn}
          >
            ➕ Add Note
          </button>
        )}
      </div>

      {/* Context Info */}
      {(chapter || section) && (
        <div className={styles.contextInfo}>
          {chapter && <span className={styles.chapterTag}>{chapter}</span>}
          {section && <span className={styles.sectionTag}>{section}</span>}
        </div>
      )}
    </div>
  );
};

export default InlineNotes;