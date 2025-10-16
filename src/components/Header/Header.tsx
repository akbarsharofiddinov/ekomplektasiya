// Header.tsx
import { useAppSelector } from "@/store/hooks/hooks";
import {
  User,
  LogOut,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ YANGI

interface HeaderProps {
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onSidebarToggle,
  title,
}: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate(); // ⬅️ YANGI

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const { currentUserInfo } = useAppSelector((state) => state.info);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  // ⬅️ YANGI: Profil sahifasiga o'tkazish
  const handleOpenProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  return (
    <header
      className={`bg-white border-b border-slate-200 ${
        sidebarCollapsed ? "ml-20" : "ml-64"
      } transition-all duration-500 ease-in-out z-40 sticky top-0 shadow-sm`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-200 shadow-sm hover:shadow-md"
          >
            {sidebarCollapsed ? (
              <ChevronsRight className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronsLeft className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1E56A0] to-[#1E56A0]/80 rounded-full" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 transition-colors duration-300">
                {title}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  E-KOMPLEKTASIYA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 space-x-3">
          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-200 shadow-sm hover:shadow-md mr-0"
            title={isFullscreen ? "Oddiy ekran" : "To'liq ekran"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-slate-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-200 shadow-sm hover:shadow-md"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900">
                  {currentUserInfo?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {currentUserInfo?.type_user}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {currentUserInfo?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentUserInfo?.type_user}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {/* ⬅️ YANGI: Profil sahifasini ochish */}
                  <button
                    onClick={handleOpenProfile}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <span>Profil</span>
                  </button>
                </div>

                <div className="p-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      localStorage.removeItem("eEquipmentM@rC");
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
