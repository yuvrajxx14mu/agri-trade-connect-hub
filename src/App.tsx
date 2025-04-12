import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/FarmerDashboard";
import TraderDashboard from "./pages/TraderDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import AuctionPage from "./pages/AuctionPage";
import TraderOrderCreate from "./pages/TraderOrderCreate";

// New Page imports
import FarmerAuctions from "./pages/FarmerAuctions";
import FarmerOrders from "./pages/FarmerOrders";
import FarmerAppointments from "./pages/FarmerAppointments";
import FarmerProfile from "./pages/FarmerProfile";
import MyProducts from "./pages/farmer/MyProducts";
import MarketProducts from "./pages/trader/MarketProducts";

import TraderMarket from "./pages/TraderMarket";
import TraderAuctions from "./pages/TraderAuctions";
import TraderBids from "./pages/TraderBids";
import TraderOrders from "./pages/TraderOrders";
import TraderAppointments from "./pages/TraderAppointments";
import TraderProfile from "./pages/TraderProfile";

import Settings from "./pages/Settings";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import AuctionForm from "./pages/AuctionForm";
import OrderDetail from "./pages/OrderDetail";
import AppointmentForm from "./pages/AppointmentForm";
import FarmerReports from './pages/farmer/FarmerReports';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Farmer Routes */}
            <Route path="/farmer-dashboard" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/farmer-products" element={
              <ProtectedRoute requiredRole="farmer">
                <MyProducts />
              </ProtectedRoute>
            } />
            <Route path="/farmer-products/add" element={
              <ProtectedRoute requiredRole="farmer">
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/farmer-products/:id" element={
              <ProtectedRoute requiredRole="farmer">
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/farmer-products/:id/edit" element={
              <ProtectedRoute requiredRole="farmer">
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/farmer-auctions" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerAuctions />
              </ProtectedRoute>
            } />
            <Route path="/farmer-auctions/create" element={
              <ProtectedRoute requiredRole="farmer">
                <AuctionForm />
              </ProtectedRoute>
            } />
            <Route path="/farmer-auctions/:id" element={
              <ProtectedRoute requiredRole="farmer">
                <AuctionPage />
              </ProtectedRoute>
            } />
            <Route path="/farmer-auctions/:id/edit" element={
              <ProtectedRoute requiredRole="farmer">
                <AuctionForm />
              </ProtectedRoute>
            } />
            <Route path="/farmer-orders" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerOrders />
              </ProtectedRoute>
            } />
            <Route path="/farmer-orders/:id" element={
              <ProtectedRoute requiredRole="farmer">
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/farmer-appointments" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerAppointments />
              </ProtectedRoute>
            } />
            <Route path="/farmer-appointments/new" element={
              <ProtectedRoute requiredRole="farmer">
                <AppointmentForm />
              </ProtectedRoute>
            } />
            <Route path="/farmer-profile" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerProfile />
              </ProtectedRoute>
            } />
            <Route path="/farmer/reports" element={<FarmerReports />} />
            
            {/* Trader Routes */}
            <Route path="/trader-dashboard" element={
              <ProtectedRoute requiredRole="trader">
                <TraderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/trader-market" element={
              <ProtectedRoute requiredRole="trader">
                <MarketProducts />
              </ProtectedRoute>
            } />
            <Route path="/trader-market/:id" element={
              <ProtectedRoute requiredRole="trader">
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/trader-order-create/:id" element={
              <ProtectedRoute requiredRole="trader">
                <TraderOrderCreate />
              </ProtectedRoute>
            } />
            <Route path="/trader-auctions" element={
              <ProtectedRoute requiredRole="trader">
                <TraderAuctions />
              </ProtectedRoute>
            } />
            <Route path="/trader-auctions/:id" element={
              <ProtectedRoute requiredRole="trader">
                <AuctionPage />
              </ProtectedRoute>
            } />
            <Route path="/trader-bids" element={
              <ProtectedRoute requiredRole="trader">
                <TraderBids />
              </ProtectedRoute>
            } />
            <Route path="/trader-orders" element={
              <ProtectedRoute requiredRole="trader">
                <TraderOrders />
              </ProtectedRoute>
            } />
            <Route path="/trader-orders/:id" element={
              <ProtectedRoute requiredRole="trader">
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/trader-appointments" element={
              <ProtectedRoute requiredRole="trader">
                <TraderAppointments />
              </ProtectedRoute>
            } />
            <Route path="/trader-profile" element={
              <ProtectedRoute requiredRole="trader">
                <TraderProfile />
              </ProtectedRoute>
            } />
            
            {/* Common Routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
