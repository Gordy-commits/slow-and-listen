import React from 'react';
import { Quote, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: (story: Story) => void;
  index: number;
  onEdit?: (story: Story) => void;
  onDelete?: (id: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, index, onEdit, onDelete }) => {
  const isQuote = story.type === 'QUOTE';
  const isEven = index % 2 === 0;
  
  // Basic check to see if story is custom (IDs are timestamps, so length > 5)
  const isCustom = story.id.length > 5;

  // Extract first image from content for the cover preview
  const contentImageMatch = story.content.match(/!\[img\]\((.*?)\)/);
  const contentImage = contentImageMatch ? contentImageMatch[1] : null;

  // Logic for Cover Image:
  // 1. Use the first image found in the content (Story Preview)
  // 2. Fallback to avatarUrl (Legacy behavior for default data)
  const coverImage = contentImage || story.avatarUrl;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(story);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Are you sure you want to delete this story?")) {
      onDelete(story.id);
    }
  };

  return (
    <div 
      className={`relative group w-full flex ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col items-center gap-8 mb-24`}
    >
      {/* Center Line Decoration Connector (Desktop) */}
      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-warm-300 rounded-full z-10 border-4 border-warm-50 shadow-sm" />
      
      {/* Content Card */}
      <div 
        className={`relative w-full md:w-[calc(50%-2rem)] bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border border-warm-100 ${isQuote ? 'p-8 text-center' : 'p-0'}`}
        onClick={() => onClick(story)}
      >
        {/* Admin Controls (Only for custom stories) */}
        {isCustom && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
             <button 
               onClick={handleEditClick}
               className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-warm-100 text-warm-600 transition-colors border border-warm-200"
               title="Edit"
             >
               <Edit2 className="w-3 h-3" />
             </button>
             <button 
               onClick={handleDeleteClick}
               className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors border border-warm-200"
               title="Delete"
             >
               <Trash2 className="w-3 h-3" />
             </button>
          </div>
        )}

        {isQuote ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] relative">
            <Quote className="w-10 h-10 text-warm-300 mb-4 opacity-50" />
            <p className="font-serif text-xl md:text-2xl italic text-warm-800 leading-relaxed">
              "{story.excerpt}"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img src={story.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-warm-100" />
              <div className="flex flex-col items-start">
                 <span className="text-sm font-sans font-bold text-warm-900">{story.author || 'Anonymous'}</span>
                 <span className="text-[10px] font-sans text-warm-400 uppercase tracking-wide">Insight</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="h-48 overflow-hidden relative bg-warm-100">
               <img src={coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                 <BookOpen className="w-4 h-4 text-warm-800" />
               </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {/* Avatar Row */}
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full overflow-hidden border border-warm-200 shrink-0 shadow-sm">
                    <img 
                      src={story.avatarUrl} 
                      alt={story.author} 
                      className="w-full h-full object-cover" 
                    />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-sans font-bold text-warm-900 leading-tight">{story.author || 'Anonymous'}</span>
                    <span className="text-[10px] font-sans text-warm-500 uppercase tracking-wider">{story.date}</span>
                 </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-warm-900 mb-3 group-hover:text-warm-600 transition-colors leading-tight">{story.title}</h3>
              <p className="font-sans text-warm-800/70 text-sm leading-relaxed mb-4 line-clamp-3">
                {story.excerpt}
              </p>
              
              <div className="mt-auto pt-4 border-t border-warm-100">
                <span className="text-xs font-bold text-warm-800 uppercase tracking-wider flex items-center gap-2">
                  Read Story <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty space for the other side of zig-zag */}
      <div className="hidden md:block md:w-[calc(50%-2rem)]" />
    </div>
  );
};