
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CompanyInfoForm from '@/components/CompanyInfoForm';
import CustomerInfoForm from '@/components/CustomerInfoForm';
import InvoiceDetailsForm from '@/components/InvoiceDetailsForm';
import InvoiceItems from '@/components/InvoiceItems';
import InvoiceActionBar from '@/components/InvoiceActionBar';
import InvoicePreviewSection from '@/components/InvoicePreviewSection';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const InvoiceEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to create or edit invoices');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-32 max-w-6xl">
        <div className="flex items-center justify-between mb-8 mt-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-gray-500 mt-1">Fill in the details below to create a professional invoice</p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="edit" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-80 grid-cols-2 mb-6">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <CompanyInfoForm />
              <CustomerInfoForm />
              <InvoiceDetailsForm />
              <InvoiceItems />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <InvoicePreviewSection />
          </TabsContent>
        </Tabs>
      </main>
      
      <InvoiceActionBar />
    </div>
  );
};

export default InvoiceEditor;
