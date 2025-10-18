
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useInvoice } from '@/contexts/InvoiceContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/App';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { savedInvoices, loadInvoice, deleteInvoice, createNewInvoice, isLoading } = useInvoice();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleEdit = (id: string) => {
    loadInvoice(id);
    navigate('/editor');
  };

  const handlePreview = (id: string) => {
    loadInvoice(id);
    navigate('/preview');
  };

  const handleDownload = async (id: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const invoice = savedInvoices.find(inv => inv.id === id);
    if (invoice) {
      await generatePDF(invoice);
    }
  };

  const filteredInvoices = savedInvoices.filter(invoice => 
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.details.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    createNewInvoice();
    navigate('/editor');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading your invoices...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Invoices</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Search by customer or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            
            <Button 
              onClick={handleCreateNew}
              className="flex items-center gap-2"
            >
              <Plus size={18} /> Create New
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          {!isAuthenticated && (
            <div className="p-12 text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">Please login to view your invoices</h2>
              <p className="text-gray-600 mb-6">Sign in to access your saved invoices and create new ones</p>
              <Button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 mx-auto"
              >
                Login
              </Button>
            </div>
          )}
          {isAuthenticated && savedInvoices.length === 0 && (
            <div className="p-12 text-center">
              <h2 className="text-xl font-medium text-gray-800 mb-2">No invoices yet</h2>
              <p className="text-gray-600 mb-6">Create your first invoice to get started</p>
              <Button 
                onClick={handleCreateNew}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={18} /> Create Invoice
              </Button>
            </div>
          )}
          {isAuthenticated && savedInvoices.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                        No matching invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice, index) => (
                      <TableRow 
                        key={invoice.id} 
                        className={cn(
                          "cursor-pointer hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? "bg-gray-50/50" : ""
                        )}
                        onClick={() => handleEdit(invoice.id)}
                      >
                        <TableCell className="font-medium">{invoice.details.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customer.name || 'Unnamed Customer'}</TableCell>
                        <TableCell>{formatDate(invoice.details.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.details.dueDate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handlePreview(invoice.id)}
                              title="Preview"
                            >
                              <Eye size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDownload(invoice.id)}
                              title="Download"
                            >
                              <Download size={18} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete invoice {invoice.details.invoiceNumber}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => deleteInvoice(invoice.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvoiceList;
