// Frontend notes service

import axios from 'axios';
import { loadToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get all notes
const getNotes = async () => {
  try {
    loadToken();
    const response = await axios.get(`${API_URL}/notes`);
    return { success: true, notes: response.data.notes };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get notes'
    };
  }
};

// Get note by ID
const getNoteById = async (id) => {
  try {
    loadToken();
    const response = await axios.get(`${API_URL}/notes/${id}`);
    return { success: true, note: response.data.note };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get note'
    };
  }
};

// Create a new note
const createNote = async (title, content) => {
  try {
    loadToken();
    const response = await axios.post(`${API_URL}/notes`, { title, content });
    return { success: true, note: response.data.note };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create note',
      limitReached: error.response?.data?.limitReached || false
    };
  }
};

// Update a note
const updateNote = async (id, title, content) => {
  try {
    loadToken();
    const response = await axios.put(`${API_URL}/notes/${id}`, { title, content });
    return { success: true, note: response.data.note };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update note'
    };
  }
};

// Delete a note
const deleteNote = async (id) => {
  try {
    loadToken();
    await axios.delete(`${API_URL}/notes/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete note'
    };
  }
};

export {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};