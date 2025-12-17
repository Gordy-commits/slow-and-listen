import { Story } from '../types';
import { STORIES as DEFAULT_STORIES } from '../constants';

const STORAGE_KEY = 'slow_listen_custom_stories';

export const getStoredStories = (): Story[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load stories", e);
  }
  return [];
};

export const getAllStories = (): Story[] => {
  const customStories = getStoredStories();
  // Combine custom stories with default ones. 
  // We put custom stories first so the user sees their creation immediately.
  return [...customStories, ...DEFAULT_STORIES];
};

export const saveStory = (newStory: Story) => {
  const currentCustom = getStoredStories();
  const updated = [newStory, ...currentCustom];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateStory = (updatedStory: Story) => {
  const currentCustom = getStoredStories();
  const index = currentCustom.findIndex(s => s.id === updatedStory.id);
  
  if (index !== -1) {
    // Update existing
    currentCustom[index] = updatedStory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCustom));
    return currentCustom;
  } else {
    // Fallback if not found (shouldn't happen for edits), treat as new
    return saveStory(updatedStory);
  }
};

export const deleteStory = (id: string) => {
  const currentCustom = getStoredStories();
  const updated = currentCustom.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearCustomStories = () => {
  localStorage.removeItem(STORAGE_KEY);
};