import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Save, PenTool, Loader2, Upload, User, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { Story, CardType } from '../types';
import { draftStoryContent } from '../services/geminiService';
import { processImageFile } from '../utils/fileHelpers';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (story: Story) => void;
  initialData?: Story | null;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [topic, setTopic] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<CardType>('STORY');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  // Avatar State
  const [avatarMode, setAvatarMode] = useState<'PRESET' | 'UPLOAD'>('PRESET');
  const [imageId, setImageId] = useState('10'); 
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author || '');
      setType(initialData.type);
      setExcerpt(initialData.excerpt);
      setContent(initialData.content);
      
      // Determine avatar mode
      if (initialData.avatarUrl.startsWith('data:')) {
        setAvatarMode('UPLOAD');
        setCustomAvatar(initialData.avatarUrl);
      } else {
        setAvatarMode('PRESET');
        setCustomAvatar(null);
        const match = initialData.avatarUrl.match(/\/id\/(\d+)\//);
        if (match && match[1]) {
          setImageId(match[1]);
        }
      }
    } else if (isOpen && !initialData) {
      // Reset form
      setTopic('');
      setTitle('');
      setAuthor('');
      setType('STORY');
      setExcerpt('');
      setContent('');
      setAvatarMode('PRESET');
      setCustomAvatar(null);
      setImageId(Math.floor(Math.random() * 200).toString());
    }
  }, [isOpen, initialData]);

  const handleAIDraft = async () => {
    if (!topic.trim()) return;
    setIsDrafting(true);
    try {
      const draft = await draftStoryContent(topic);
      setTitle(draft.title);
      setAuthor(draft.author);
      setType(draft.type as CardType);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      if (!initialData) {
         setAvatarMode('PRESET');
         setImageId(Math.floor(Math.random() * 200).toString());
      }
    } catch (e) {
      console.error(e);
      alert("Failed to draft story. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file, 200); // Resize avatar to small
        setCustomAvatar(base64);
        setAvatarMode('UPLOAD');
      } catch (err) {
        alert("Failed to process image");
      }
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImageFile(file, 800); // Resize content image
        // Insert Markdown style image tag
        const imageTag = `\n\n![img](${base64})\n\n`;
        
        const textarea = contentInputRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = content.substring(0, start) + imageTag + content.substring(end);
          setContent(newContent);
        } else {
          setContent(prev => prev + imageTag);
        }
      } catch (err) {
        alert("Failed to process content image");
      }
    }
    // Reset input
    if (contentImageInputRef.current) contentImageInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAvatarUrl = `https://picsum.photos/id/${imageId}/200/200`;
    if (avatarMode === 'UPLOAD' && customAvatar) {
      finalAvatarUrl = customAvatar;
    }

    const newStory: Story = {
      id: initialData ? initialData.id : Date.now().toString(),
      type,
      title,
      author,
      excerpt,
      content,
      avatarUrl: finalAvatarUrl,
      date: initialData ? initialData.date : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
    };
    onSave(newStory);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-warm-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 bg-warm-100 border-b border-warm-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-warm-800" />
            <h2 className="font-serif font-bold text-xl text-warm-900">
              {initialData ? '編輯貼文' : '書寫貼文'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-warm-200 rounded-full text-warm-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* AI Draft */}
          <div className="bg-warm-50 p-6 rounded-xl border border-warm-100">
            <label className="block text-sm font-bold text-warm-700 mb-2 font-sans">
              {initialData ? 'AI 改寫' : '需要靈感嗎？讓 AI 幫您撰寫'}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：遠處雷聲的聲音..."
                className="flex-1 px-4 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-300 font-sans"
              />
              <button 
                onClick={handleAIDraft}
                disabled={isDrafting || !topic.trim()}
                className="bg-warm-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-warm-900 disabled:opacity-50 transition-colors"
              >
                {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {initialData ? '改寫' : '草稿'}
              </button>
            </div>
          </div>

          <form id="storyForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-warm-500 mb-1">標題 (Title)</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-warm-200 rounded font-serif font-bold text-warm-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-warm-500 mb-1">作者 (Author)</label>
                  <input required type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-2 border border-warm-200 rounded font-sans" />
                </div>
                 <div>
                  <label className="block text-xs font-bold uppercase text-warm-500 mb-1">類型 (Type)</label>
                  <select value={type} onChange={e => setType(e.target.value as CardType)} className="w-full p-2 border border-warm-200 rounded font-sans bg-white">
                    <option value="STORY">故事 (Story)</option>
                    <option value="QUOTE">語錄 (Quote)</option>
                  </select>
               </div>
              </div>

              {/* Avatar Section */}
              <div className="bg-white border border-warm-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase text-warm-500 w-full justify-between">
                    <span>頭像</span>
                    <div className="flex bg-warm-100 rounded-lg p-0.5">
                      <button 
                        type="button"
                        onClick={() => setAvatarMode('PRESET')}
                        className={`px-2 py-1 rounded-md text-[10px] transition-all ${avatarMode === 'PRESET' ? 'bg-white shadow text-warm-900' : 'text-warm-500 hover:text-warm-700'}`}
                      >
                        預設
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAvatarMode('UPLOAD')}
                        className={`px-2 py-1 rounded-md text-[10px] transition-all ${avatarMode === 'UPLOAD' ? 'bg-white shadow text-warm-900' : 'text-warm-500 hover:text-warm-700'}`}
                      >
                        上傳
                      </button>
                    </div>
                 </div>

                 <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-warm-100 bg-warm-50 group">
                    <img 
                      src={avatarMode === 'PRESET' ? `https://picsum.photos/id/${imageId}/200/200` : (customAvatar || 'https://via.placeholder.com/200?text=Upload')} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                    {avatarMode === 'PRESET' && (
                       <button 
                        type="button"
                        onClick={() => setImageId(Math.floor(Math.random() * 200).toString())}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <RefreshCcw className="w-6 h-6 text-white" />
                       </button>
                    )}
                 </div>

                 {avatarMode === 'PRESET' ? (
                   <div className="w-full">
                     <label className="block text-[10px] font-bold uppercase text-warm-400 mb-1">Picsum ID</label>
                     <input type="text" value={imageId} onChange={e => setImageId(e.target.value)} className="w-full p-1.5 text-center text-sm border border-warm-200 rounded font-sans" />
                   </div>
                 ) : (
                   <div className="w-full">
                     <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                     />
                     <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full py-1.5 flex items-center justify-center gap-2 bg-warm-100 hover:bg-warm-200 text-warm-800 text-xs font-bold rounded transition-colors"
                     >
                        <Upload className="w-3 h-3" />
                        選擇檔案
                     </button>
                   </div>
                 )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-warm-500 mb-1">摘要 (Excerpt)</label>
              <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className="w-full p-2 border border-warm-200 rounded font-sans text-sm" />
            </div>

            <div className="relative">
              <div className="flex justify-between items-end mb-1">
                 <label className="block text-xs font-bold uppercase text-warm-500">內容 (Content)</label>
                 <button 
                  type="button" 
                  onClick={() => contentImageInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-bold text-warm-600 hover:text-warm-900 bg-warm-100 px-2 py-1 rounded hover:bg-warm-200 transition-colors"
                 >
                   <ImageIcon className="w-3 h-3" />
                   插入圖片
                 </button>
                 <input 
                   ref={contentImageInputRef}
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handleContentImageUpload}
                 />
              </div>
              <textarea 
                ref={contentInputRef}
                required 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                rows={10} 
                className="w-full p-3 border border-warm-200 rounded font-serif leading-relaxed" 
                placeholder="在此書寫您的故事... 使用上方按鈕插入圖片。"
              />
              <p className="text-[10px] text-warm-400 mt-1">
                 圖片將以 `![img](data:...)` 代碼形式插入，請勿手動修改該代碼。
              </p>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-warm-200 bg-white flex justify-end">
          <button 
            type="submit" 
            form="storyForm"
            className="bg-warm-800 text-white px-6 py-2 rounded-full font-bold hover:bg-warm-900 flex items-center gap-2 transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            {initialData ? '更新貼文' : '發布貼文'}
          </button>
        </div>
      </div>
    </div>
  );
};