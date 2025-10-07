import { useAppSelector } from "@/store/hooks/hooks";
import {
  User,
  LogOut,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useEffect } from "react";

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
  // const [showNotifications, setShowNotifications] = useState(false);
  // const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  // const [currentLanguage, setCurrentLanguage] = useState("O'z");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const { currentUserInfo } = useAppSelector(state => state.info)

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

  // const handleLanguageChange = (lang: string) => {
  //   setCurrentLanguage(lang);
  //   setShowLanguageMenu(false);
  // };

  return (
    <header
      className={`bg-white border-b border-slate-200 ${sidebarCollapsed ? "ml-20" : "ml-64"
        } transition-all duration-500 ease-in-out z-40 sticky top-0 shadow-sm`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Sidebar Toggle & Page Title */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
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

          {/* Page Title with Enhanced Design */}
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1E56A0] to-[#1E56A0]/80 rounded-full"></div>
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

        {/* Right Section - Professional Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative">
            {/* <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <Languages className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {currentLanguage}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${
                  showLanguageMenu ? "rotate-180" : ""
                }`}
              />
            </button> */}

            {/* Language Dropdown */}
            {/* {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-slate-200 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="p-2">
                  <button
                    onClick={() => handleLanguageChange("O'z")}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                      currentLanguage === "O'z"
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>O'z</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange("Ru")}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                      currentLanguage === "Ru"
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Ru</span>
                  </button>
                </div>
              </div>
            )} */}
          </div>

          {/* Fullscreen Toggle */}
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

          {/* Notifications */}
          <div className="relative">
            {/* <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-300 transform hover:scale-105 border border-slate-200 shadow-sm hover:shadow-md"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs text-white font-medium">2</span>
              </span>
            </button> */}

            {/* Professional Notification Dropdown */}
            {/* {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Bildirishnomalar
                    </h3>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full font-medium">
                      2 yangi
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border-l-4 border-[#1E56A0]">
                    <div className="w-3 h-3 bg-[#1E56A0] rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Yangi buyurtma
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Respublika bo'yicha yangi buyurtma qabul qilindi
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        5 daqiqa oldin
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border-l-4 border-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        Hisobot tayyor
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Tovar aylanma hisoboti tayyorlandi
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        1 soat oldin
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-200 bg-slate-50">
                  <button className="w-full text-sm text-[#1E56A0] hover:text-[#1E56A0]/80 font-medium transition-colors duration-300 py-2 hover:bg-slate-100 rounded-lg">
                    Barcha bildirishnomalarni ko'rish
                  </button>
                </div>
              </div>
            )} */}
          </div>

          {/* Professional Profile Menu */}
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
                <p className="text-xs text-slate-500">{currentUserInfo?.type_user}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Professional Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Abdullayev A.A.
                      </p>
                      <p className="text-sm text-slate-600">Administrator</p>
                      <p className="text-xs text-slate-400">ID: ADM001</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-300">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-slate-600" />
                    </div>
                    <span>Sozlamalar</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-300">
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
