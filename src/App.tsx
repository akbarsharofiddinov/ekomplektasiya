import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home, Login, ProductInputDetailPage, ProductOutDetailPage, ProductOutput, ProductsInput, ProductTurnOverReport, WarehouseTransfer, WarehouseTransferDetail } from "@/pages";
import { Layout } from "@/components";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify"
import ProductMaterialsBalance from "./pages/Reports/ProductMaterialsBalance";
import DistrictOrder from "./pages/Orders/DistrictOrder/DistrictOrder";
import DistrictOrderDetail from "./pages/Orders/DistrictOrder/DistrictOrderDetail";
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
        element: <DistrictOrder/>,
        children: [
          {
            path: "order-details/:id",
            element: <DistrictOrderDetail/>
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
