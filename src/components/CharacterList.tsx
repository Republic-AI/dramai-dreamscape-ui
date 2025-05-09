import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCocos } from './CocosEmbed';

interface Character {
  npcId: number;
  name: string;
  job: string;
  description: string;
  imageUrl: string;
  jumpTo: string;
  tags: string[];
}

interface CharacterListProps {
  characters: Character[];
  onJumpTo: (sceneId: string) => void;
  className?: string;
}

// CharacterCard component definition
const CharacterCard: React.FC<{
  name: string;
  job: string;
  description: string;
  tags?: string[];
  imageUrl: string;
  jumpTo: string;
  onJumpTo: (sceneId: string) => void;
  className?: string;
}> = ({
  name,
  job,
  description,
  tags = [],
  imageUrl,
  jumpTo,
  onJumpTo,
  className,
}) => {
  const { navigateToScene } = useCocos();

  const handleClick = () => {
    // 同时执行原始 onJumpTo 函数和发送导航事件
    onJumpTo(jumpTo);
    navigateToScene(jumpTo);
  };

  return (
    <div
      className={cn(
        "w-[180px] h-[320px] flex flex-col justify-start rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800",
        "hover:scale-[1.02] hover:shadow-lg cursor-pointer transition-all duration-300",
        className
      )}
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="h-[180px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={`Character ${name}`}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col p-3">
        <h3 className="font-bold text-sm leading-tight">
          {name} <span className="text-muted-foreground font-normal">/ {job}</span>
        </h3>

        <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2 leading-snug">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-200/80 text-gray-600 text-xs px-3 py-1 rounded-md font-medium backdrop-blur-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  onJumpTo,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Adjust this value to control scroll distance
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn("w-full relative group", className)}>
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/80 shadow-lg transform transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center rounded-full bg-white/80 shadow-lg transform transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
        style={{ transform: 'translate(50%, -50%)' }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Character Cards Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide scroll-smooth"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      >
        {characters.map((character) => (
          <CharacterCard
            key={`${character.npcId}-${character.name}`}
            name={character.name}
            job={character.job}
            description={character.description}
            imageUrl={character.imageUrl}
            jumpTo={character.jumpTo}
            onJumpTo={onJumpTo}
            tags={character.tags}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterList;
