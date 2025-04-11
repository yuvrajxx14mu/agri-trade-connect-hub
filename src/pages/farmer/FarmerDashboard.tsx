import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/DashboardSidebar';

export const FarmerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Farmer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/farmer/products')}>
                Manage Products
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/farmer/auctions')}>
                Manage Auctions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/farmer/bids')}>
                View Bids
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/farmer/orders')}>
                View Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/farmer/appointments')}>
                Manage Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}; 