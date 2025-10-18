
import React from 'react';
import { useInvoice } from '@/contexts/InvoiceContext';
import { format } from 'date-fns';
import { CheckCircle, Clock, BadgePercent, BadgeDollarSign } from 'lucide-react';
import { cn } from "@/lib/utils";

const InvoicePreviewSheet: React.FC = () => {
  const { currentInvoice } = useInvoice();
  const { company, customer, details, items, subtotal, taxTotal, discountTotal, total } = currentInvoice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : '';
    } catch (error) {
      return dateString;
    }
  };

  // Helper to format address and handle empty fields
  const formatAddress = (addressParts: Record<string, string>) => {
    const { address, city, zipCode, country } = addressParts;
    const formattedLines = [];
    
    if (address) formattedLines.push(address);
    
    const cityZip = [city, zipCode].filter(Boolean).join(', ');
    if (cityZip) formattedLines.push(cityZip);
    
    if (country) formattedLines.push(country);
    
    return formattedLines;
  };

  const companyAddressLines = formatAddress(company);
  const customerAddressLines = formatAddress(customer);

  return (
    <div className="invoice-paper max-w-4xl mx-auto my-8 p-8 bg-white rounded-lg shadow-md animate-fade-in border border-gray-100">
      {/* Modern Invoice Header with Brand Colors */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12">
        <div className="mb-6 md:mb-0 flex-1">
          <div className="flex items-center mb-4">
            {company.logoUrl && (
              <img 
                src={company.logoUrl}
                alt={`${company.name} Logo`}
                className="h-16 object-contain mr-4"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {company.name}
            </h1>
          </div>
          <div className="text-gray-600 mt-2 space-y-1">
            {companyAddressLines.map((line, index) => (
              <p key={`company-address-${index}`}>{line}</p>
            ))}
            {company.phone && <p>{company.phone}</p>}
            {company.email && <p>{company.email}</p>}
            {company.website && <p>{company.website}</p>}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg self-start flex-shrink-0 border border-gray-200 w-full md:w-auto">
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Invoice</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{details.invoiceNumber}</h2>
          <div className="grid gap-y-2">
            <div className="flex items-center">
              <div className="text-gray-500 mr-2 w-24">Issue Date:</div>
              <div className="font-medium flex items-center">
                <Clock size={14} className="mr-1 text-primary" />
                {formatDate(details.issueDate)}
              </div>
            </div>
            
            {details.dueDateEnabled && details.dueDate && (
              <div className="flex items-center">
                <div className="text-gray-500 mr-2 w-24">Due Date:</div>
                <div className="font-medium flex items-center">
                  <CheckCircle size={14} className="mr-1 text-green-600" />
                  {formatDate(details.dueDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bill To Section */}
      <div className="mb-10">
        <h2 className="text-sm font-medium uppercase text-gray-500 mb-3 tracking-wide">Bill To</h2>
        <div className="border-l-4 border-primary/70 pl-4 py-2 bg-gray-50 rounded-r-lg">
          <h3 className="text-xl font-bold">{customer.name}</h3>
          <div className="text-gray-600 mt-2 space-y-1">
            {customerAddressLines.map((line, index) => (
              <p key={`customer-address-${index}`}>{line}</p>
            ))}
            {customer.email && <p>{customer.email}</p>}
            {customer.phone && <p>{customer.phone}</p>}
          </div>
        </div>
      </div>
      
      {/* Invoice Items with modern styling */}
      <div className="mb-10 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left border-b-2 border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Description</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-center">Quantity</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right">Unit Price</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right">Discount</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right">Tax</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={item.id} 
                className={cn(
                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  index === items.length - 1 && "border-b-0"
                )}
              >
                <td className="py-4 px-4">{item.description}</td>
                <td className="py-4 px-4 text-center">{item.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-4 text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                <td className="py-4 px-4 text-right">{item.tax > 0 ? `${item.tax}%` : '-'}</td>
                <td className="py-4 px-4 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals with modern styling */}
      <div className="flex justify-end mb-10">
        <div className="w-full md:w-72 bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="flex items-center text-gray-600">
              <BadgePercent size={14} className="mr-1 text-green-600" /> Discount
            </span>
            <span className="font-medium text-red-500">-{formatCurrency(discountTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="flex items-center text-gray-600">
              <BadgePercent size={14} className="mr-1 text-blue-600" /> Tax
            </span>
            <span className="font-medium">{formatCurrency(taxTotal)}</span>
          </div>
          <div className="flex justify-between py-3 mt-1">
            <span className="flex items-center font-bold text-lg">
              <BadgeDollarSign size={16} className="mr-1 text-primary" /> Total
            </span>
            <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Terms & Notes */}
      {(details.paymentTerms || details.notes) && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          {details.paymentTerms && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-1">Payment Terms</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">{details.paymentTerms}</p>
            </div>
          )}
          
          {details.notes && (
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">{details.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer with year & company name */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} {company.name} - Professional Invoice System</p>
      </div>
    </div>
  );
};

export default InvoicePreviewSheet;
