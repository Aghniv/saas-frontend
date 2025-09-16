'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { upgradeToPro } from '../api/auth';

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      if (isAuthenticated()) {
        try {
          const { success, notes, message } = await getNotes();
          if (success) {
            setNotes(notes);
          } else {
            setError(message);
          }
        } catch (error) {
          setError('Failed to load notes');
        } finally {
          setLoading(false);
        }
      }
    };

    loadNotes();
  }, [isAuthenticated]);

  // Handle create/update note
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !content) {
      setError('Please enter both title and content');
      return;
    }

    try {
      if (editingNote) {
        // Update existing note
        const { success, note, message } = await updateNote(editingNote.id, title, content);
        if (success) {
          setNotes(notes.map(n => (n.id === note.id ? note : n)));
          setTitle('');
          setContent('');
          setEditingNote(null);
        } else {
          setError(message);
        }
      } else {
        // Create new note
        const { success, note, message, limitReached: reachedLimit } = await createNote(title, content);
        if (success) {
          setNotes([...notes, note]);
          setTitle('');
          setContent('');
        } else {
          setError(message);
          if (reachedLimit) {
            setLimitReached(true);
          }
        }
      }
    } catch (error) {
      setError('Failed to save note');
    }
  };

  // Handle edit note
  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  // Handle delete note
  const handleDelete = async (id) => {
    try {
      const { success, message } = await deleteNote(id);
      if (success) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        setError(message);
      }
    } catch (error) {
      setError('Failed to delete note');
    }
  };

  // Handle upgrade to Pro
  const handleUpgrade = async () => {
    try {
      const { success, tenant, message } = await upgradeToPro(user.tenant.slug);
      if (success) {
        // Update user's tenant subscription plan
        user.tenant.subscriptionPlan = tenant.subscriptionPlan;
        setLimitReached(false);
        setError('');
      } else {
        setError(message);
      }
    } catch (error) {
      setError('Failed to upgrade subscription');
    }
  };

  // If not authenticated, show loading
  if (!isAuthenticated() && loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes Dashboard</h1>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email} ({user.role}) - <span className="font-medium text-gray-700 dark:text-gray-300">{user.tenant.name}</span> ({user.tenant.subscriptionPlan === 'pro' ? <span className="text-accent dark:text-accent-hover font-medium">Pro Plan</span> : <span className="text-gray-600 dark:text-gray-400">Free Plan</span>})
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger hover:bg-red-700 transition-colors duration-200 btn-danger"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-md text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {limitReached && user.tenant.subscriptionPlan === 'free' && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Free Plan Limit Reached</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                    <p>You've reached the maximum of 3 notes on the Free Plan.</p>
                  </div>
                  {isAdmin() && (
                    <div className="mt-4">
                      <button
                        onClick={handleUpgrade}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 btn-primary"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                  {!isAdmin() && (
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                      <p>Please contact your administrator to upgrade to the Pro Plan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                    placeholder="Note title"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows="5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                    placeholder="Note content"
                  ></textarea>
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 btn-primary"
                  >
                    {editingNote ? 'Update Note' : 'Create Note'}
                  </button>
                  {editingNote && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNote(null);
                        setTitle('');
                        setContent('');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Notes</h2>
              {notes.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 card">
                  No notes yet. Create your first note!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 card">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{note.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{note.content}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-danger hover:bg-red-700 transition-colors duration-200 btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}