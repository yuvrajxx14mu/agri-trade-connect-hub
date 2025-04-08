import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/FarmerDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import AuctionPage from "./pages/AuctionPage";

// New Page imports
import FarmerAuctions from "./pages/FarmerAuctions";
import FarmerOrders from "./pages/FarmerOrders";
import FarmerShipments from "./pages/FarmerShipments";
import FarmerAppointments from "./pages/FarmerAppointments";
import FarmerPricing from "./pages/FarmerPricing";
import FarmerNotifications from "./pages/FarmerNotifications";
import FarmerReports from "./pages/FarmerReports";
import FarmerProfile from "./pages/FarmerProfile";
import FarmerMessages from "./pages/FarmerMessages";

import TraderMarket from "./pages/TraderMarket";
import TraderAuctions from "./pages/TraderAuctions";
import TraderBids from "./pages/TraderBids";
import TraderOrders from "./pages/TraderOrders";
import TraderShipments from "./pages/TraderShipments";
import TraderAppointments from "./pages/TraderAppointments";
import TraderNotifications from "./pages/TraderNotifications";
import TraderReports from "./pages/TraderReports";
import TraderProfile from "./pages/TraderProfile";
import TraderMessages from "./pages/TraderMessages";

import Settings from "./pages/Settings";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import AuctionForm from "./pages/AuctionForm";
import OrderDetail from "./pages/OrderDetail";
import ShipmentDetail from "./pages/ShipmentDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer-products" element={<FarmerProducts />} />
          <Route path="/farmer-products/add" element={<ProductForm />} />
          <Route path="/farmer-products/:id" element={<ProductDetail />} />
          <Route path="/farmer-products/:id/edit" element={<ProductForm />} />
          <Route path="/farmer-auctions" element={<FarmerAuctions />} />
          <Route path="/farmer-auctions/create" element={<AuctionForm />} />
          <Route path="/farmer-auctions/:id" element={<AuctionPage />} />
          <Route path="/farmer-auctions/:id/edit" element={<AuctionForm />} />
          <Route path="/farmer-orders" element={<FarmerOrders />} />
          <Route path="/farmer-orders/:id" element={<OrderDetail />} />
          <Route path="/farmer-shipments" element={<FarmerShipments />} />
          <Route path="/farmer-shipments/:id" element={<ShipmentDetail />} />
          <Route path="/farmer-appointments" element={<FarmerAppointments />} />
          <Route path="/farmer-pricing" element={<FarmerPricing />} />
          <Route path="/farmer-notifications" element={<FarmerNotifications />} />
          <Route path="/farmer-reports" element={<FarmerReports />} />
          <Route path="/farmer-profile" element={<FarmerProfile />} />
          <Route path="/farmer-messages" element={<FarmerMessages />} />
          
          {/* Trader Routes */}
          <Route path="/trader-dashboard" element={<TraderDashboard />} />
          <Route path="/trader-market" element={<TraderMarket />} />
          <Route path="/trader-auctions" element={<TraderAuctions />} />
          <Route path="/trader-auctions/:id" element={<AuctionPage />} />
          <Route path="/trader-bids" element={<TraderBids />} />
          <Route path="/trader-orders" element={<TraderOrders />} />
          <Route path="/trader-orders/:id" element={<OrderDetail />} />
          <Route path="/trader-shipments" element={<TraderShipments />} />
          <Route path="/trader-shipments/:id" element={<ShipmentDetail />} />
          <Route path="/trader-appointments" element={<TraderAppointments />} />
          <Route path="/trader-notifications" element={<TraderNotifications />} />
          <Route path="/trader-reports" element={<TraderReports />} />
          <Route path="/trader-profile" element={<TraderProfile />} />
          <Route path="/trader-messages" element={<TraderMessages />} />
          
          {/* Common Routes */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
