import React from 'react';
import { cn } from '@/lib/utils';
import { CharacterHistory } from '@/types/drama';
import CharacterHistorySidebar from './CharacterHistorySidebar';
import UserInfoPanel from './UserInfoPanel';
import { useLocation } from 'react-router-dom';

interface UserInfo {
  userId: string;
  id: string;
  location: string;
  avatar: string;
  points: number;
}

interface SidebarProps {
  characters: CharacterHistory[];
  className?: string;
  isSignedIn?: boolean;
  userInfo?: UserInfo | null;
  onLogin?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  characters = [],
  isSignedIn = false,
  userInfo = null,
  onLogin
}) => {
  const location = useLocation();
  const isScenePage = location.pathname === '/scene';

  return (
    <aside className={cn(
      "w-[280px] flex flex-col h-screen bg-sidebar border-r border-sidebar-border p-4",
      className
    )}>
      <div className={cn(
        "flex flex-col",
        isScenePage ? "h-full" : "flex-1"
      )}>
        {/* Character History Sidebar */}
        <CharacterHistorySidebar 
          characters={characters}
          className={isScenePage ? "flex-1 overflow-y-auto" : "flex-1"}
        />

        {/* User Info Panel */}
        <div className={cn(
          "mt-auto",
          isScenePage ? "pt-4" : ""
        )}>
          <UserInfoPanel
            isSignedIn={isSignedIn}
            userInfo={userInfo}
            onLogin={onLogin}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;