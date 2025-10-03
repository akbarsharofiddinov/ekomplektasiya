/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Header, Sidebar } from "@/components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppDispatch } from "@/store/hooks/hooks";
import { setCurrentUserInfo } from "@/store/infoSlice/infoSlice";

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    handleSidebarCollapse(newCollapsed);
  };

  const pathname = useLocation();

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      "/": "Bosh sahifa",
      "price-analysis": "Narx tahlili",
      "product-input": "Tovarlar kirimi",
      "product-output": "Tovarlar chiqimi",
      "warehouse-transfer": "Ombordan omborga",
      "order-by-configuration": "Komplektatsiya bo'yicha buyurtma",
      "order-by-districts": "Tumanlar bo'yicha buyurtma",
      "order-by-regions": "Viloyatlar bo'yicha buyurtma",
      "order-by-republic": "Respublika bo'yicha buyurtma",
      "card-m17": "Kartochka (M-17)",
      "product-circulation-report": "Tovar aylanma hisoboti",
      "product-materials-input-report": "Tovar va materiallar kirimi hisoboti",
      "product-materials-balance": "Tovar va materiallar qoldigi",
      "tmc-writeoff-report": "Hisobdan chiqarish (TMTs) hisoboti",
      "calendar-report": "Taqvim",
      "order-reports-register": "Buyurtma hisobotlar reestr",
      "order-reports-analysis": "Buyurtma hisobotlar tahlili",
      "contracts-report": "Shartnomalar hisoboti",
      "executors-report": "Ijrochilar hisoboti",
      "product-returns": "Tovarlarni qaytarish",
      "barcode-printing": "Shtrix kod chop etish",
      "appeal-letter": "Murojaat xati",
    };
    return titles[section] || "E-KOMPLEKTATSIYA";
  };

  const token = localStorage.getItem("eEquipmentM@rC");
  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  // API Request

  // Get current user info
  const getUserInfo = async () => {
    try {
      const response = await axiosAPI.get("/user/current-user/");
      if (response.status === 200) {
        dispatch(setCurrentUserInfo(response.data))
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log(error)
      localStorage.removeItem("eEquipmentM@rC");
      navigate("/login");
    }
  }

  useEffect(() => {
    getUserInfo()
  }, [token])

  return (
    <>
      <div>
        <Sidebar collapsed={sidebarCollapsed} />
        <Header
          title={getSectionTitle(
            pathname.pathname.split("/").join("").length === 0
              ? "/"
              : pathname.pathname.split("/").join("")
          )}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={handleSidebarToggle}
        />
        <main
          className={`${sidebarCollapsed ? "w-[calc(100%-5rem)] ml-20" : "ml-64"
            } p-4 transition-all duration-500 ease-in-out`}
        >
          <div className="animate-in slide-in-from-right-4 fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
