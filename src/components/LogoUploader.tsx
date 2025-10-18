
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { useInvoice } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';

const LogoUploader: React.FC = () => {
  const { currentInvoice, setCompanyLogo } = useInvoice();
  const { logoUrl } = currentInvoice.company;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCompanyLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanyLogo(null);
  };

  return (
    <div 
      className="relative w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer overflow-hidden transition-all group hover:border-primary animate-fade-in"
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {logoUrl ? (
        <>
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="w-full h-full object-contain transition-opacity group-hover:opacity-70"
          />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            <Button variant="ghost" size="icon" className="text-white">
              <Camera size={24} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white absolute top-2 right-2" onClick={handleRemoveLogo}>
              <X size={18} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Camera size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 text-center px-2">Upload Company Logo</p>
        </>
      )}
    </div>
  );
};

export default LogoUploader;
