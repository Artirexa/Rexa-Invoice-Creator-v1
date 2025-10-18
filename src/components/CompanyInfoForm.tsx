
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoice } from '@/contexts/InvoiceContext';
import LogoUploader from './LogoUploader';

const CompanyInfoForm: React.FC = () => {
  const { currentInvoice, updateCompanyInfo } = useInvoice();
  const { company } = currentInvoice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCompanyInfo({ [name]: value });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Company Information</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <LogoUploader />
        </div>
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              name="name"
              value={company.name}
              onChange={handleInputChange}
              placeholder="Your Company Name"
              className="transition-all focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input
              id="company-email"
              name="email"
              type="email"
              value={company.email}
              onChange={handleInputChange}
              placeholder="company@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input
              id="company-phone"
              name="phone"
              value={company.phone}
              onChange={handleInputChange}
              placeholder="(555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              name="website"
              value={company.website}
              onChange={handleInputChange}
              placeholder="www.example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-address">Address</Label>
            <Input
              id="company-address"
              name="address"
              value={company.address}
              onChange={handleInputChange}
              placeholder="123 Business St"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-city">City</Label>
              <Input
                id="company-city"
                name="city"
                value={company.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-zipCode">Zip/Postal Code</Label>
              <Input
                id="company-zipCode"
                name="zipCode"
                value={company.zipCode}
                onChange={handleInputChange}
                placeholder="Zip/Postal Code"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-country">Country</Label>
            <Input
              id="company-country"
              name="country"
              value={company.country}
              onChange={handleInputChange}
              placeholder="Country"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
