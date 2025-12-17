import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Story } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, story }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !story) return null;

  // Helper function to render content with mixed text and images
  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, idx) => {
      // Check for image pattern: ![img](data:...)
      const imgMatch = paragraph.match(/!\[img\]\((.*?)\)/);
      
      if (imgMatch && imgMatch[1]) {
        return (
          <div key={idx} className="my-8">
            <img 
              src={imgMatch[1]} 
              alt="Story illustration" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
        );
      }
      
      return (
        <p key={idx} className="mb-4 text-justify opacity-90 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-2xl bg-warm-50 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-warm-200 transition-colors z-10 bg-white/50 backdrop-blur-md text-warm-800"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="relative h-64 w-full group">
            <img 
              src={story.avatarUrl} 
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-900/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <span className="text-sm font-sans tracking-widest uppercase opacity-90">{story.date}</span>
              <h2 className="text-3xl font-serif font-bold mt-2">{story.title}</h2>
              {story.author && <p className="text-lg opacity-90 mt-1">by {story.author}</p>}
            </div>
          </div>
          
          <div className="p-8 md:p-10">
            <div className="prose prose-stone prose-lg max-w-none font-serif text-warm-800">
              {renderContent(story.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};