
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoice } from '@/contexts/InvoiceContext';

const CustomerInfoForm: React.FC = () => {
  const { currentInvoice, updateCustomerInfo } = useInvoice();
  const { customer } = currentInvoice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCustomerInfo({ [name]: value });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Customer Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer Name</Label>
          <Input
            id="customer-name"
            name="name"
            value={customer.name}
            onChange={handleInputChange}
            placeholder="Customer or Company Name"
            className="transition-all focus:border-primary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            name="email"
            type="email"
            value={customer.email}
            onChange={handleInputChange}
            placeholder="customer@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            name="phone"
            value={customer.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-address">Address</Label>
          <Input
            id="customer-address"
            name="address"
            value={customer.address}
            onChange={handleInputChange}
            placeholder="Customer Address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-city">City</Label>
          <Input
            id="customer-city"
            name="city"
            value={customer.city}
            onChange={handleInputChange}
            placeholder="City"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer-zipCode">Zip/Postal Code</Label>
          <Input
            id="customer-zipCode"
            name="zipCode"
            value={customer.zipCode}
            onChange={handleInputChange}
            placeholder="Zip/Postal Code"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customer-country">Country</Label>
          <Input
            id="customer-country"
            name="country"
            value={customer.country}
            onChange={handleInputChange}
            placeholder="Country"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
