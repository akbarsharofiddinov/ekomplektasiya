import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DistrictOrder, DistrictOrderDetail, Home, Login, ProductInputDetailPage, ProductOutDetailPage, ProductOutput, ProductsInput, ProductTurnOverReport, RegionOrder, RegionOrderDetail, WarehouseTransfer, WarehouseTransferDetail } from "@/pages";
import { Layout } from "@/components";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify"
import ProductMaterialsBalance from "./pages/Reports/ProductMaterialsBalance";
import RepublicOrder from "./pages/Orders/RepublicOrder/RepublicOrder";
import RepublicOrderDetail from "./pages/Orders/RepublicOrder/RepublicOrderDetail";
import DistrictOrderSigning from "./pages/Orders/DistrictOrder/DistrictOrderSigning";
// import CKEditorComponent from "./components/DocEditor/CKEditorComponent";
// import TinyMCEComponent from "./components/DocEditor/TinyMCEComponent";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "product-input",
        element: <ProductsInput />,
        children: [
          {
            path: "details/:id",
            element: <ProductInputDetailPage />,
          }
        ]
      },
      {
        path: "product-output",
        element: <ProductOutput />,
        children: [
          {
            path: "details/:id",
            element: <ProductOutDetailPage />,
          }
        ]
      },
      {
        path: "warehouse-transfer",
        element: <WarehouseTransfer />,
        children: [
          {
            path: "details/:id",
            element: <WarehouseTransferDetail />,
          }
        ]
      },
      {
        path: "order-by-districts",
        element: <DistrictOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <DistrictOrderDetail />
          },
        ]
      },
      {
        path: "order-by-regions",
        element: <RegionOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <RegionOrderDetail />
          }
        ]
      },
      {
        path: "order-by-republic",
        element: <RepublicOrder/>,
        children: [
          {
            path: "order-details/:id",
            element: <RepublicOrderDetail/>
          }
        ]
      },
      {
        path: 'product-circulation-report',
        element: <ProductTurnOverReport />
      },
      {
        path: 'product-materials-balance',
        element: <ProductMaterialsBalance />
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },

]);

const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={routes} />
      <ToastContainer />
      <Toaster position="top-right" reverseOrder={false} />
      {/* <TinyMCEComponent /> */}
      {/* <CKEditorComponent/> */}
    </>
  );
};

export default App;
