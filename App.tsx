import React, { useState, useEffect } from 'react';
import { ArrowDown, Ear, Wind, Music, Heart, PenSquare } from 'lucide-react';
import { INSIGHTS } from './constants';
import { Story } from './types';
import { getAllStories, saveStory, updateStory, deleteStory } from './utils/storyManager';
import { Reveal } from './components/Reveal';
import { Modal } from './components/Modal';
import { StoryCard } from './components/StoryCard';
import { ChatBot } from './components/ChatBot';
import { ImageGenerator } from './components/ImageGenerator';
import { CreatorModal } from './components/CreatorModal';

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  // Creator / Editor State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  useEffect(() => {
    // Load stories from both constants and local storage on mount
    setStories(getAllStories());
  }, []);

  const handleSaveStory = (storyData: Story) => {
    if (editingStory) {
      // Logic for Update
      updateStory(storyData);
    } else {
      // Logic for Create
      saveStory(storyData);
    }
    setStories(getAllStories()); // Refresh list
    setEditingStory(null); // Clear editing state
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setIsCreatorOpen(true);
  };

  const handleDeleteStory = (id: string) => {
    deleteStory(id);
    setStories(getAllStories());
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
    setEditingStory(null); // Clear editing state on close
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Ear': return <Ear className="w-8 h-8" />;
      case 'Wind': return <Wind className="w-8 h-8" />;
      case 'Music': return <Music className="w-8 h-8" />;
      case 'Heart': return <Heart className="w-8 h-8" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-warm-50 text-warm-900 selection:bg-warm-200 pb-20 md:pb-0">
      
      {/* Top Navigation (Added for better accessibility) */}
	  {/* 暫時隱藏新增按鈕
      <nav className="fixed top-0 w-full z-40 p-6 flex justify-end pointer-events-none">
        <button 
          onClick={() => setIsCreatorOpen(false)}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-warm-200 text-warm-800 font-sans font-bold text-sm hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-300"
        >
          <PenSquare className="w-4 h-4" />
          <span>書寫貼文</span>
        </button>
		
      </nav>
	  */}

      {/* Hero Section */}
      <section className="h-screen w-full relative flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-64 h-64 bg-warm-300 rounded-full blur-3xl mix-blend-multiply filter animate-pulse"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-200 rounded-full blur-3xl mix-blend-multiply filter"></div>
        </div>

        <Reveal>
            <div className="text-center z-10">
                <p className="font-sans font-bold text-warm-500 tracking-[0.3em] uppercase mb-4 text-sm md:text-base">Swagelok Taiwan 2025</p>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-warm-900 mb-6 leading-tight">
                Slow & <span className="italic text-warm-600">Listen</span>
                </h1>
                <div className="w-24 h-1 bg-warm-800 mx-auto mb-8"></div>
                <p className="max-w-md mx-auto font-serif text-lg md:text-xl text-warm-700 italic leading-relaxed">
                "歡迎來到 S&L Story Corner."
                </p>
            </div>
        </Reveal>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-warm-400" />
        </div>
      </section>

      {/* Story Section (Zig-Zag) */}
      <section className="py-24 md:py-32 px-4 max-w-6xl mx-auto relative">
        {/* Vertical Decorative Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-warm-200 -translate-x-1/2 z-0" />

        <div className="relative z-10 space-y-12 md:space-y-0">
          {stories.map((story, index) => (
            <Reveal key={story.id} width="100%">
              <StoryCard 
                story={story} 
                index={index} 
                onClick={setSelectedStory} 
                onEdit={handleEditStory}
                onDelete={handleDeleteStory}
              />
            </Reveal>
          ))}
        </div>
      </section>
 
      {/* Insight Grid Section */}
	  {/*
      <section className="bg-warm-100/50 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal width="100%">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-900 mb-4">Fragments of Thought</h2>
              <p className="text-warm-600 max-w-lg mx-auto font-sans">
                Brief meditations on the art of perceiving the world through sound and silence.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSIGHTS.map((insight, idx) => (
              <Reveal key={insight.id} delay={idx * 0.1}>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-warm-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center">
                  <div className="p-3 bg-warm-50 rounded-full text-warm-800 mb-6">
                    {getIcon(insight.iconName)}
                  </div>
                  <h3 className="font-serif font-bold text-lg mb-3 text-warm-900">{insight.title}</h3>
                  <p className="font-sans text-sm text-warm-600 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
	  */}
	  
	  
      {/* Interactive Lab Section (Image Gen) */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
         <Reveal width="100%">
            <div className="grid grid-cols-1 gap-12">
               <div className="text-center mb-8">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-900 mb-4">The Canvas of Sound</h2>
                  <p className="text-warm-600 max-w-xl mx-auto font-sans">
                  Visualize the unseen. Use our AI-powered tool to translate your auditory experiences into visual art.
                  </p>
               </div>
               <ImageGenerator />
            </div>
         </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-100 py-16 px-4 text-left-1/2">
        <Reveal>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">Slow And Listen</h2>
          <p className="max-w-md mx-auto font-sans text-warm-300 mb-8 leading-relaxed">
            閉眼睛、深呼吸、站起身、動一動。
          </p>
		  {/* 🔴 隱藏方法：把不要的按鈕用大括號和星號包起來 */}
			{/*
		  
          <button 
            onClick={() => setIsCreatorOpen(true)}
            className="px-8 py-3 bg-warm-100 text-warm-900 font-bold rounded-full hover:bg-white transition-colors shadow-lg transform hover:scale-105 duration-200 flex items-center gap-2 mx-auto"
          >
            <PenSquare className="w-4 h-4" />
            Write a Story
          </button>
		  */}
		  
          <div className="mt-16 text-xs text-warm-500 font-sans tracking-widest uppercase">
            © 2025 Slow & Listen Exhibition. All Rights Reserved.
          </div>
        </Reveal>
      </footer>

      {/* Creator Button (Mobile) */}
	  {/*
      <button 
        onClick={() => setIsCreatorOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-4 bg-warm-100 rounded-full shadow-lg hover:bg-white transition-colors border border-warm-200 md:hidden"
      >
        <PenSquare className="w-6 h-6 text-warm-800" />
		
      </button>
	  */}

      {/* Overlays */}
      <Modal 
        isOpen={!!selectedStory} 
        onClose={() => setSelectedStory(null)} 
        story={selectedStory} 
      />
      
      <CreatorModal 
        isOpen={isCreatorOpen}
        onClose={handleCloseCreator}
        onSave={handleSaveStory}
        initialData={editingStory}
      />

      <ChatBot />

    </div>
  );
};

export default App;