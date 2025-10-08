import {
  TrendingUp,
  ClipboardList,
  MapPin,
  Map,
  Globe,
  BarChart3,
  Package,
  FileSpreadsheet,
  Archive,
  ArrowRightLeft,
  FileText,
  PackageOpen,
  Package as PackageIcon,
  ChevronRight,
  Phone,
  Headphones,
  FileSearch,
  Receipt,
  Users,
  Barcode,
} from "lucide-react";
import { useState } from "react";
import logo from "@/assets/hudud_logo.png";
import { useNavigate } from "react-router-dom";

// import logoImage from 'figma:asset/ddbe1014ec28e8bee562355295bde7a988f05fe0.png';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }: SidebarProps) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["warehouse-control"]);
  const navigate = useNavigate();

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };



  const menuItems = [
    {
      id: 'warehouse-control',
      label: "Ombor boshqaruvi",
      icon: ClipboardList,
      type: "menu",
      children: [
        {
          id: "product-input",
          label: "Tovarlar kirimi",
          icon: PackageOpen,
          type: "item",
        },
        {
          id: "product-output",
          label: "Tovarlar chiqimi",
          icon: PackageIcon,
          type: "item",
        },
        {
          id: "warehouse-transfer",
          label: "Ombordan omborga",
          icon: ArrowRightLeft,
          type: "item",
        },
        {
          id: "barcode-printing",
          label: "Shtrix kod chop etish",
          icon: Barcode,
          type: "item",
        },
      ]
    },
    {
      id: "orders",
      label: "Buyurtmalar",
      icon: ClipboardList,
      type: "menu",
      children: [
        {
          id: "order-by-districts",
          label: "Tumanlar bo'yicha buyurtma",
          icon: MapPin,
        },
        {
          id: "order-by-regions",
          label: "Viloyatlar bo'yicha buyurtma",
          icon: Map,
        },
        {
          id: "order-by-republic",
          label: "Respublika bo'yicha buyurtma",
          icon: Globe,
        },
        {
          id: "price-analysis",
          label: "Narx tahlili",
          icon: TrendingUp,
          type: "item",
        },
        {
          id: "appeal-letter",
          label: "Murojaat xati",
          icon: FileText,
          type: "item",
        },
      ],
    },

    // {
    //   id: "product-returns",
    //   label: "Tovarlarni qaytarish",
    //   icon: RotateCcw,
    //   type: "item",
    // },
    {
      id: "reports",
      label: "Hisobotlar",
      icon: BarChart3,
      type: "menu",
      children: [
        {
          id: "product-circulation-report",
          label: "Tovar aylanma hisoboti",
          icon: Package,
        },
        {
          id: "product-materials-balance",
          label: "Tovar va materiallar qoldigi",
          icon: Archive,
        },
        // {
        //   id: "calendar-report",
        //   label: "Taqvim",
        //   icon: Calendar,
        // },
        {
          id: "order-reports-register",
          label: "Buyurtma hisobotlar reestr",
          icon: FileSpreadsheet,
        },
        {
          id: "order-reports-analysis",
          label: "Buyurtma hisobotlar tahlili",
          icon: FileSearch,
        },
        {
          id: "contracts-report",
          label: "Shartnomalar hisoboti",
          icon: Receipt,
        },
        {
          id: "executors-report",
          label: "Ijrochilar hisoboti",
          icon: Users,
        },
      ],
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 bg-white border-r border-slate-200 h-screen transition-all duration-500 ease-in-out ${collapsed ? "w-20" : "w-64"
        } flex flex-col z-50`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b border-slate-200 ${collapsed ? "p-3" : ""}`}
      >
        <div
          className={`${collapsed
            ? "flex flex-col items-center space-y-2"
            : "flex flex-col items-center space-y-3"
            }`}
        >
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl border border-slate-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl mx-auto overflow-hidden cursor-pointer">
            <img
              src={logo}
              alt="HGT Logo"
              className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>

          {/* Text Content */}
          {!collapsed && (
            <button
              onClick={() => navigate("/")}
              className="text-center transition-all duration-300 hover:opacity-80 transform hover:scale-105"
            >
              <h1 className="font-semibold leading-tight transition-colors duration-300 text-slate-900 cursor-pointer">
                E-KOMPLEKTASIYA
              </h1>
              <p className="text-xs text-slate-600 mt-1 transition-colors duration-300">
                Qulay va zamonaviy platforma
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // const isActive = activeSection === item.id;
            const isExpanded = expandedMenus.includes(item.id);
            // const hasActiveChild = item.children?.some(
            //   (child) => activeSection === child.id
            // );

            if (item.type === "menu") {
              return (
                <li key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center ${collapsed
                      ? "justify-center px-2 py-3"
                      : "justify-between px-3 py-2"
                      } rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md text-slate-600 hover:text-blue-600 hover:bg-blue-50/50`}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "justify-center" : "gap-2"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-105`}
                      >
                        <Icon className="w-5 h-5 text-white drop-shadow-md transition-transform duration-300 hover:scale-110" />
                      </div>

                      {!collapsed && (
                        <span className="font-medium text-sm transition-colors duration-300">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""
                          }`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {!collapsed && isExpanded && item.children && (
                    <ul className="ml-4 space-y-1 animate-in slide-in-from-top-2 fade-in duration-400">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <li key={child.id} onClick={() => navigate(child.id)}>
                            <button
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50`}
                            >
                              <div
                                className={`w-8 h-8 rounded-md flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/25`}
                              >
                                <ChildIcon
                                  className={`w-4 h-4 text-white drop-shadow-md transition-transform duration-300 hover:scale-110 `}
                                />
                              </div>
                              <span className="text-xs font-medium transition-colors duration-300">
                                {child.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            // Regular menu item
            return (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center ${collapsed ? "justify-center px-2 py-3" : "gap-2 px-3 py-2"
                    } rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md text-slate-600 hover:text-blue-600 hover:bg-blue-50/50`}
                  onClick={() => navigate(item.id)}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/25`}
                  >
                    <Icon className="w-5 h-5 text-white drop-shadow-md transition-transform duration-300 hover:scale-110" />
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm transition-colors duration-300">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Support Section - Fixed at Bottom */}
      <div className={`border-t border-slate-200 ${collapsed ? "p-2" : "p-3"}`}>
        {!collapsed ? (
          <div className="space-y-2">
            {/* Contact Number with Modern Icon */}
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <a
                href="tel:+998502002122"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors duration-300"
              >
                +998 50 200 21 22
              </a>
            </div>

            {/* Support Button */}
            <button
              onClick={() => {
                window.open("http://5.133.122.226:8080", "_blank");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
            >
              <Headphones className="w-4 h-4" />
              <span>Qo'llab-quvvatlash</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Phone Icon for collapsed state */}
            <a
              href="tel:+998502002122"
              className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm mx-auto transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Phone className="w-4 h-4 text-white" />
            </a>

            {/* Support Icon for collapsed state */}
            <button
              onClick={() => {
                window.open("http://5.133.122.226:8080", "_blank");
              }}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm mx-auto transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Headphones className="w-4 h-4 text-white" />
              {!collapsed && <span>Qo'llab-quvvatlash</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
