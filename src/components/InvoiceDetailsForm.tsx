
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoice } from '@/contexts/InvoiceContext';
import { CalendarIcon, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const InvoiceDetailsForm: React.FC = () => {
  const { currentInvoice, updateInvoiceDetails } = useInvoice();
  const { details } = currentInvoice;
  const [dueDateEnabled, setDueDateEnabled] = useState(Boolean(details.dueDate));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateInvoiceDetails({ [name]: value });
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      updateInvoiceDetails({
        [name]: date.toISOString().split('T')[0]
      });
    }
  };

  const toggleDueDate = (checked: boolean) => {
    setDueDateEnabled(checked);
    if (!checked) {
      updateInvoiceDetails({ dueDate: '' });
    } else {
      // Set due date to 30 days from issue date by default
      const issueDate = details.issueDate ? new Date(details.issueDate) : new Date();
      const defaultDueDate = new Date(issueDate);
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      updateInvoiceDetails({ dueDate: defaultDueDate.toISOString().split('T')[0] });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm animate-fade-in border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-2">
          <FileText size={18} className="text-primary" />
        </div>
        Invoice Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice Number</Label>
          <Input
            id="invoice-number"
            name="invoiceNumber"
            value={details.invoiceNumber}
            onChange={handleInputChange}
            placeholder="e.g., INV-001"
            className="transition-all focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment-terms">Payment Terms</Label>
          <Input
            id="payment-terms"
            name="paymentTerms"
            value={details.paymentTerms}
            onChange={handleInputChange}
            placeholder="e.g., Net 30"
            className="transition-all focus-visible:ring-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="issue-date">Issue Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                id="issue-date"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !details.issueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {details.issueDate ? format(new Date(details.issueDate), 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={details.issueDate ? new Date(details.issueDate) : undefined}
                onSelect={(date) => handleDateChange('issueDate', date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="due-date" className={!dueDateEnabled ? "text-gray-400" : ""}>Due Date</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="due-date-toggle" className="text-xs text-gray-500">Enable</Label>
              <Switch 
                id="due-date-toggle" 
                checked={dueDateEnabled} 
                onCheckedChange={toggleDueDate}
              />
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                id="due-date"
                disabled={!dueDateEnabled}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !details.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {details.dueDate ? format(new Date(details.dueDate), 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={details.dueDate ? new Date(details.dueDate) : undefined}
                onSelect={(date) => handleDateChange('dueDate', date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={details.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes or payment instructions..."
            rows={4}
            className="transition-all focus-visible:ring-primary resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsForm;
