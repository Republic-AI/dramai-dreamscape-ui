import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, LogOut } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';
import AuthError from './AuthError';

interface UserInfo {
  userId: string;
  id: string;
  location: string;
  avatar: string;
  points: number;
}

interface UserInfoPanelProps {
  className?: string;
  isSignedIn?: boolean;
  userInfo?: UserInfo | null;
  onLogin?: (userInfo: UserInfo) => void;
}

const UserInfoPanel: React.FC<UserInfoPanelProps> = ({ 
  className, 
  isSignedIn = false,
  userInfo = null,
  onLogin
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLoginSuccess = (userInfo: UserInfo) => {
    setLoading(false);
    setError(null);
    onLogin?.(userInfo);
  };

  const handleGoogleLoginError = (error: any) => {
      setLoading(false);
    console.error('Google login failed:', error);
    setError(error.error_description || '登录失败，请稍后再试');
  };

  const handleLogout = () => {
    // 清除本地存储
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isSignedIn');
    
    // 刷新页面以重置所有状态
    window.location.reload();
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className={cn("mt-4", className)}>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : isSignedIn && userInfo ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col">
            {/* 用户基本信息 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-drama-lavender overflow-hidden ring-2 ring-purple-100 flex-shrink-0">
                <img
                  src={userInfo.avatar}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-gray-800">{userInfo.userId}</div>
                  <div className="px-2 py-1 bg-purple-50 rounded-lg">
                    <span className="text-xs text-purple-600 font-medium">ID: {userInfo.id}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  📍 {userInfo.location}
                </div>
              </div>
            </div>

            {/* Premium 卡片 */}
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-xl p-3.5 border border-amber-100/50 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-amber-700 font-bold">DraMai Premium</div>
                <div className="px-2 py-0.5 bg-amber-100 rounded-full">
                  <span className="text-xs text-amber-700">Active</span>
                </div>
              </div>
              <div className="text-amber-600 text-sm">Long Memory With Unlimited Command/Vote</div>
            </div>

            {/* 积分卡片 */}
            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <img src="/star.png" alt="Star" className="w-5 h-5" />
                </div>
                <span className="text-amber-700 font-bold text-lg">{userInfo.points}</span>
              </div>
              <button className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                <span className="text-amber-700 text-sm font-medium">Earn More →</span>
              </button>
            </div>
            
            {/* 登出按钮 */}
            <button 
              onClick={handleLogout}
              className="mt-3 flex items-center justify-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {error ? (
            <AuthError error={error} onRetry={handleRetry} />
          ) : (
            <GoogleLoginButton
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserInfoPanel; 