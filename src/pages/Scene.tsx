import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import CocosEmbed, { useCocos } from '@/components/CocosEmbed';
import SceneThreadFeed from '@/components/SceneThreadFeed';
import VoteHistoryPanel from '@/components/VoteHistoryPanel';
import { CharacterHistory, AIPost, VoteHistory } from '@/types/drama';
import { MOCK_SCENE_CHARACTER_HISTORY, MOCK_SCENE_THREAD, MOCK_VOTE_HISTORY } from '@/mock/scene-data';
import { toast } from '@/components/ui/use-toast';
import CharacterHistorySidebar from '@/components/CharacterHistorySidebar';
import { websocketService } from '@/services/websocket';

interface UserInfo {
  userId: string;
  id: string;
  location: string;
  avatar: string;
  points: number;
}

const Scene: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sceneId = searchParams.get('sceneId') || 'scene_A1';
  
  // 映射场景ID到实际使用的数据
  const getEffectiveSceneId = (id: string) => {
    // 根据 NPC ID 映射到对应的场景
    const npcId = parseInt(id);
    
    // 牧场场景 (roomId: 4)
    if ([10016, 10017, 10018, 10019, 10020, 10021].includes(npcId)) {
      return '4';
    }
    
    // 偶像场景 (roomId: 3)
    if ([10012, 10009, 10006, 10022].includes(npcId)) {
      return '3';
    }
    
    // 默认返回原始ID
    return id;
  };

  const effectiveSceneId = getEffectiveSceneId(sceneId);
  const [lastSceneId, setLastSceneId] = useState<string>(effectiveSceneId);

  // 当场景ID变化时，强制重新加载数据
  useEffect(() => {
    if (sceneId !== lastSceneId) {
      setLastSceneId(sceneId);
      fetchSceneData();
    }
  }, [sceneId]);

  // 添加新的函数来获取游戏场景ID
  const getGameSceneId = (id: string) => {
    const npcId = parseInt(id);
    
    // 牧场场景的NPC
    if ([10016, 10017, 10018, 10019, 10020, 10021].includes(npcId)) {
      return '4';
    }
    
    // 偶像场景的NPC
    if ([10012, 10009, 10006, 10022].includes(npcId)) {
      return '3';
    }
    
    return id;
  };

  const gameSceneId = getGameSceneId(sceneId);

  const [characterHistory, setCharacterHistory] = useState<CharacterHistory[]>([]);
  const [aiPosts, setAiPosts] = useState<AIPost[]>([]);
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const { sendMessageToGame } = useCocos();

  // Check login status on component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedLoginStatus = localStorage.getItem('isSignedIn');
    
    if (storedUserInfo && storedLoginStatus) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsSignedIn(true);
    }
  }, []);

  // Mock API calls to fetch scene data
  const fetchSceneData = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get filtered mock data based on effectiveSceneId
      const charactersData = MOCK_SCENE_CHARACTER_HISTORY.filter(char => char.roomId === effectiveSceneId);
      const postsData = MOCK_SCENE_THREAD.filter(post => post.roomId === effectiveSceneId);
      const votesData = MOCK_VOTE_HISTORY.filter(vote => vote.roomId === effectiveSceneId);

      const tweetData = websocketService.getSceneFeed(Number(effectiveSceneId));

      console.log('Tweet Data:', tweetData);

      console.log('Fetched data:', { 
        charactersCount: charactersData.length,
        postsCount: postsData.length,
        votesCount: votesData.length,
        effectiveSceneId,
        sceneId
      });
      
      // Make sure we always have some data
      if (charactersData.length === 0) {
        console.warn(`No character data found for sceneId: ${effectiveSceneId}, using default scene_A1 data`);
        setCharacterHistory(MOCK_SCENE_CHARACTER_HISTORY.filter(char => char.roomId === '4'));
      } else {
        setCharacterHistory(charactersData);
      }
      
      if (postsData.length === 0) {
        console.warn(`No posts data found for sceneId: ${effectiveSceneId}, using default scene_A1 data`);
        setAiPosts(MOCK_SCENE_THREAD.filter(post => post.roomId === '4'));
      } else {
        setAiPosts(postsData);
      }
      
      if (votesData.length === 0) {
        console.warn(`No vote data found for sceneId: ${effectiveSceneId}, using default scene_A1 data`);
        setVoteHistory(MOCK_VOTE_HISTORY.filter(vote => vote.roomId === '4'));
      } else {
        setVoteHistory(votesData);
      }
    } catch (error) {
      console.error("Error fetching scene data:", error);
      
      // Fallback to scene_A1 data on error
      setCharacterHistory(MOCK_SCENE_CHARACTER_HISTORY.filter(char => char.roomId === '4'));
      setAiPosts(MOCK_SCENE_THREAD.filter(post => post.roomId === '4'));
      setVoteHistory(MOCK_VOTE_HISTORY.filter(vote => vote.roomId === '4'));
      
      toast({
        title: "Error loading scene data",
        description: "Could not load the scene data. Using default content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    console.log('Initial load with sceneId:', sceneId);
    fetchSceneData();
  }, []);

  // 当场景ID变化时，重新加载数据
  useEffect(() => {
    if (sceneId !== lastSceneId) {
      console.log('Scene ID changed:', { from: lastSceneId, to: sceneId });
      setLastSceneId(sceneId);
      fetchSceneData();
    }
  }, [sceneId]);

  // 添加数据状态日志
  useEffect(() => {
    console.log('Current data state:', {
      characterHistory: characterHistory.length,
      aiPosts: aiPosts.length,
      voteHistory: voteHistory.length,
      loading,
      effectiveSceneId
    });
  }, [characterHistory, aiPosts, voteHistory, loading, effectiveSceneId]);

  const handleLogin = (userInfo: UserInfo) => {
    // 更新状态
    setIsSignedIn(true);
    setUserInfo(userInfo);
    
    toast({
      title: "Welcome back!",
      description: "You have successfully signed in."
    });
  };

  useEffect(() => {
    // const handleNewMessage = (message: CharacterHistory) => {
    //   setCharacterHistory(prev => {
    //     // Check if message already exists using id
    //     const exists = prev.some(m => m.id === message.id);
    //     if (exists) return prev;
        
    //     // Add new message to the beginning of the array
    //     return [message, ...prev].slice(0, 10); // Keep only the 10 most recent messages
    //   });
    // };

    const handleNewMessage = (message) => {
      console.log('New message:', message);
      setAiPosts(message.tweetVoList);
    };

    // Subscribe to WebSocket messages
    websocketService.subscribe(handleNewMessage);

    // Cleanup on unmount
    return () => {
      websocketService.unsubscribe(handleNewMessage);
    };
  }, []);

  const handleTagSelect = (tagId: string) => {
    // 根据tagId获取对应的场景ID
    const getSceneIdFromTag = (tagId: string) => {
      if (tagId === 'ranch') {
        return '10016'; // 使用牧场场景的第一个NPC ID
      } else if (tagId === 'idol') {
        return '10012'; // 使用偶像场景的第一个NPC ID
      }
      return '10016'; // 默认返回牧场场景
    };
    
    const targetSceneId = getSceneIdFromTag(tagId);
    navigate(`/scene?sceneId=${targetSceneId}`);
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  // 根据场景ID获取对应的tag
  const getTagFromSceneId = (sceneId: string) => {
    const npcId = parseInt(sceneId);
    
    // 牧场场景 (roomId: 4)
    if ([10016, 10017, 10018, 10019, 10020, 10021].includes(npcId)) {
      return 'ranch';
    }
    
    // 偶像场景 (roomId: 3)
    if ([10012, 10009, 10006, 10022].includes(npcId)) {
      return 'idol';
    }
    
    return 'ranch'; // 默认返回牧场场景
  };

  // 示例：更新场景
  const handleUpdateScene = () => {
    sendMessageToGame({
      type: 'UPDATE_SCENE',
      data: {
        sceneId: '1',
        name: 'Test Scene',
        elements: []
      }
    });
  };

  function handleLike(tweetId: number): void {
    websocketService.operateTweet(tweetId, 1, "", 0, 0);
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        characters={characterHistory} 
        className="flex-shrink-0 w-64"
        isSignedIn={isSignedIn}
        userInfo={userInfo}
        onLogin={handleLogin}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onTagSelect={handleTagSelect} 
          className="flex-shrink-0" 
          selectedTag={getTagFromSceneId(sceneId)}
          onLogoClick={handleLogoClick}
        />
        
        {/* Test Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => websocketService.testAllFeatures()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Test WebSocket
          </button>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading scene...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
            {/* Game Embed */}
            <div className="w-full md:min-w-[480px] md:w-[calc(100%-800px)] h-full flex-shrink-0 mb-4 md:mb-0 overflow-y-auto">
              <CocosEmbed sceneId={gameSceneId} className="h-full" />
            </div>
            
            {/* Content Columns Container */}
            <div className="flex-1 grid grid-cols-2 gap-4 h-full md:ml-[-10px]">
              {/* Thread Feed */}
              <div className="h-full overflow-y-auto border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Thread Feed</h2>
                <SceneThreadFeed 
                  posts={aiPosts} 
                  isSignedIn={isSignedIn}
                  onLike={handleLike}
                />
              </div>
              
              {/* Vote History */}
              <div className="h-full overflow-y-auto border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Vote History</h2>
                <VoteHistoryPanel voteHistory={voteHistory} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scene;
