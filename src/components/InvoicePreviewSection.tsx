
import React from 'react';
import InvoicePreviewSheet from './InvoicePreviewSheet';
import { Card } from '@/components/ui/card';
import { Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvoice } from '@/contexts/InvoiceContext';
import { generatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';

const InvoicePreviewSection: React.FC = () => {
  const { currentInvoice } = useInvoice();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to download invoices');
      navigate('/login');
      return;
    }
    
    await generatePDF(currentInvoice);
    toast.success('Invoice PDF downloaded successfully');
  };

  const handleSendEmail = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send invoices');
      navigate('/login');
      return;
    }
    
    // This would be implemented with an email API in a real app
    toast.success('Email feature would be integrated with Supabase and SendGrid');
  };

  return (
    <Card className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Artirexa Invoice Preview</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleSendEmail}
          >
            <Mail size={16} /> Email
          </Button>
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={handleDownloadPDF}
          >
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <InvoicePreviewSheet />
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
        <p>Artirexa Invoice Creator - Premium branded invoices for your business</p>
      </div>
    </Card>
  );
};

export default InvoicePreviewSection;
