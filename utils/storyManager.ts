import { Story } from '../types';
// 1. 引入 constants.ts 裡的故事作為「預設資料」
import { STORIES as DEFAULT_STORIES } from '../constants';

const STORAGE_KEY = 'slow_listen_custom_stories';

// 預設頭像 (當使用者沒上傳圖片時使用)
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100";

// --- 輔助函式：確保故事資料欄位完整 ---
const sanitizeStory = (story: Partial<Story>): Story => {
  const content = story.content || '';
  return {
    id: story.id || Date.now().toString(),
    type: 'STORY', // 強制設為 STORY
    title: story.title || '無標題',
    content: content,
    // 如果沒有摘要，自動抓內容前 50 字
    excerpt: story.excerpt || (content.length > 50 ? content.substring(0, 50) + '...' : content),
    author: story.author || '匿名',
    // 如果沒頭像，用預設圖
    avatarUrl: story.avatarUrl || DEFAULT_AVATAR,
    date: story.date || new Date().toISOString().split('T')[0]
  };
};

// 取得「使用者自己新增」的故事
const getCustomStories = (): Story[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("解析舊資料失敗", e);
    }
  }
  return [];
};

// --- 主函式：取得「所有」故事 (包含預設 + 使用者新增) ---
export const getAllStories = (): Story[] => {
  const customStories = getCustomStories();
  // 把「使用者新增的」放在前面，「系統預設的」放在後面
  return [...customStories, ...DEFAULT_STORIES];
};

// 儲存故事
export const saveStory = (storyData: Partial<Story>): void => {
  const customStories = getCustomStories();
  
  // 補齊資料
  const newStory = sanitizeStory(storyData);

  const newStories = [newStory, ...customStories];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
};

// 更新故事
export const updateStory = (updatedStory: Story): void => {
  const customStories = getCustomStories();
  
  // 檢查這個故事是不是「使用者新增的」
  const index = customStories.findIndex(s => s.id === updatedStory.id);

  if (index !== -1) {
    // 如果是使用者新增的，直接更新
    customStories[index] = sanitizeStory(updatedStory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customStories));
  } else {
    // 如果 ID 找不到，代表使用者試圖編輯「系統預設故事」
    // 我們把它當作一則「新故事」存起來 (不覆蓋原始檔案，而是另存新檔的概念)
    saveStory(updatedStory);
  }
};

// 刪除故事
export const deleteStory = (id: string): void => {
  const customStories = getCustomStories();
  const newStories = customStories.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
  
  // 注意：我們無法刪除 constants.ts 裡的預設故事，
  // 這裡只會刪除 LocalStorage 裡的資料，這是正常的設計。
};