
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoice } from '@/contexts/InvoiceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, DollarSign, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { savedInvoices, canCreateInvoice } = useInvoice();
  
  // Calculate total income
  const totalIncome = savedInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Create chart data - last 6 months
  const getLastSixMonths = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: month.toLocaleString('default', { month: 'short' }),
        value: month.getMonth(),
        year: month.getFullYear()
      });
    }
    
    return months;
  };
  
  const chartData = getLastSixMonths().map(month => {
    const monthInvoices = savedInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.details.issueDate);
      return invoiceDate.getMonth() === month.value && 
             invoiceDate.getFullYear() === month.year;
    });
    
    return {
      name: month.name,
      count: monthInvoices.length,
      amount: monthInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    };
  });
  
  const invoiceLimit = 10; // Free tier limit
  const invoicesThisMonth = savedInvoices.filter(invoice => {
    const invoiceDate = new Date(invoice.details.issueDate);
    const now = new Date();
    return invoiceDate.getMonth() === now.getMonth() && 
           invoiceDate.getFullYear() === now.getFullYear();
  }).length;
  
  const isPremium = canCreateInvoice && invoicesThisMonth >= 10; // If they can create more than 10, they're premium
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your business performance</p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/invoices">View Invoices</Link>
            </Button>
            <Button asChild>
              <Link to="/editor">Create Invoice</Link>
            </Button>
          </div>
        </div>
        
        {/* Subscription status */}
        {!isPremium && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Free Plan: {invoicesThisMonth}/{invoiceLimit} Invoices Used This Month</h3>
                  <p className="text-gray-600">Upgrade to Premium for unlimited invoices and more features!</p>
                </div>
                <Button className="shrink-0">Upgrade to Premium</Button>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${Math.min(invoicesThisMonth/invoiceLimit * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <h3 className="text-2xl font-bold">{savedInvoices.length}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalIncome)}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <h3 className="text-2xl font-bold">{invoicesThisMonth}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Invoice</p>
                <h3 className="text-2xl font-bold">
                  {savedInvoices.length > 0 
                    ? formatCurrency(totalIncome / savedInvoices.length) 
                    : '$0.00'}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Monthly Invoices</CardTitle>
              <CardDescription>Number of invoices created per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value} invoices`, 'Count']} />
                    <Bar dataKey="count" fill="#3b82f6" barSize={40} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Total revenue generated per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Bar dataKey="amount" fill="#10b981" barSize={40} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
