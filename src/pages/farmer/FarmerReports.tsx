import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { Download, FileText, BarChart2, DollarSign } from 'lucide-react';
import { downloadInvoice } from '../../services/pdfService';

interface ReportData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    traderName: string;
    date: string;
  }>;
}

export default function FarmerReports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('farmer_id', user.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get product names
      const productIds = [...new Set(orders.map(order => order.product_id))];
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, price')
        .in('id', productIds);

      if (productError) throw productError;
      const productMap = new Map(products.map(product => [product.id, product]));

      // Get trader names
      const traderIds = [...new Set(orders.map(order => order.trader_id))];
      const { data: traders, error: traderError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', traderIds);

      if (traderError) throw traderError;
      const traderMap = new Map(traders.map(trader => [trader.id, trader.name]));

      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calculate top products
      const productRevenueMap = new Map();
      orders.forEach(order => {
        const product = productMap.get(order.product_id);
        if (!product) return;
        
        if (!productRevenueMap.has(product.name)) {
          productRevenueMap.set(product.name, {
            quantity: 0,
            revenue: 0
          });
        }
        const current = productRevenueMap.get(product.name);
        current.quantity += order.quantity;
        current.revenue += order.total_amount;
      });

      const topProducts = Array.from(productRevenueMap.entries())
        .map(([name, data]) => ({
          name,
          ...data
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Format recent orders
      const recentOrders = orders.slice(0, 5).map(order => {
        const product = productMap.get(order.product_id);
        return {
          id: order.id,
          productName: product?.name || 'Unknown Product',
          quantity: order.quantity,
          totalAmount: order.total_amount,
          traderName: traderMap.get(order.trader_id) || 'Unknown Trader',
          date: format(new Date(order.created_at), 'dd/MM/yyyy')
        };
      });

      setReportData({
        totalSales,
        totalOrders,
        averageOrderValue,
        topProducts,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      // First get the order and product info
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          products:product_id(name, description)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Then get the trader info from profiles
      const { data: traderProfile, error: traderError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', order.trader_id)
        .single();

      if (traderError) {
        console.error('Error fetching trader info:', traderError);
      }

      const invoiceData = {
        orderId: order.id,
        date: format(new Date(order.created_at), 'dd/MM/yyyy'),
        farmerName: user?.user_metadata?.name || 'Farmer',
        traderName: traderProfile?.name || 'Trader',
        items: [{
          name: order.products.name,
          quantity: order.quantity,
          price: order.price,
          total: order.total_amount
        }],
        total: order.total_amount
      };

      downloadInvoice(invoiceData, `invoice-${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Invoices</h1>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reportData?.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{reportData?.averageOrderValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {product.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Trader: {order.traderName} • Date: {order.date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {order.quantity} • Total: ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateInvoice(order.id)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generate Invoice
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 