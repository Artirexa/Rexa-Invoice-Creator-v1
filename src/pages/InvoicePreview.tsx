
import React from 'react';
import Navbar from '@/components/Navbar';
import InvoicePreviewSheet from '@/components/InvoicePreviewSheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvoice } from '@/contexts/InvoiceContext';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const InvoicePreview: React.FC = () => {
  const navigate = useNavigate();
  const { saveInvoice, currentInvoice } = useInvoice();
  const { isAuthenticated } = useAuth();

  const handleBackToEditor = () => {
    navigate('/editor');
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download invoices');
      navigate('/login');
      return;
    }
    
    await generatePDF(currentInvoice);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save invoices');
      navigate('/login');
      return;
    }
    
    saveInvoice();
  };

  const handleSendEmail = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send invoices');
      navigate('/login');
      return;
    }
    
    // This would be implemented with an email API in a real app
    toast.success('Email feature would be implemented with a backend service');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToEditor}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Editor
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save size={18} /> Save
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSendEmail}
              className="flex items-center gap-2"
            >
              <Mail size={18} /> Email
            </Button>
            
            <Button 
              variant="default" 
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download size={18} /> Download PDF
            </Button>
          </div>
        </div>
        
        <InvoicePreviewSheet />
      </main>
    </div>
  );
};

export default InvoicePreview;
