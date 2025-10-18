
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Save, Eye, Download, FileText, Plus, Loader2 } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const InvoiceActionBar: React.FC = () => {
  const navigate = useNavigate();
  const { saveInvoice, createNewInvoice, currentInvoice, isSaving, canCreateInvoice } = useInvoice();
  const { isAuthenticated } = useAuth();

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save invoices');
      navigate('/login');
      return;
    }
    
    await saveInvoice();
  };

  const handlePreview = () => {
    navigate('/preview');
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download invoices');
      navigate('/login');
      return;
    }
    
    await generatePDF(currentInvoice);
  };

  const handleViewAll = () => {
    navigate('/invoices');
  };

  const handleNew = () => {
    if (!isAuthenticated) {
      toast.error('Please login to create new invoices');
      navigate('/login');
      return;
    }
    
    if (!canCreateInvoice) {
      toast.error('You have reached your monthly invoice limit. Upgrade to premium for unlimited invoices.');
      return;
    }
    
    createNewInvoice();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 animate-scale-in">
      <div className="container mx-auto flex flex-wrap justify-center gap-3">
        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handlePreview}
        >
          <Eye size={18} /> Preview
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownload}
        >
          <Download size={18} /> Download PDF
        </Button>
        
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleViewAll}
        >
          <FileText size={18} /> View All
        </Button>
        
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleNew}
          disabled={!canCreateInvoice}
        >
          <Plus size={18} /> New Invoice
        </Button>
      </div>
    </div>
  );
};

export default InvoiceActionBar;
