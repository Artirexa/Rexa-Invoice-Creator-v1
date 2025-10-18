
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInvoice } from '@/contexts/InvoiceContext';
import { Plus, Trash2, BadgePercent, BadgeDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvoiceItems: React.FC = () => {
  const { currentInvoice, addItem, updateItem, removeItem } = useInvoice();
  const { items, subtotal, taxTotal, discountTotal, total } = currentInvoice;

  const handleItemChange = (id: string, field: string, value: string | number) => {
    updateItem(id, { [field]: value });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Invoice Items</h2>
        <Button 
          onClick={addItem} 
          variant="outline" 
          className="flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
        >
          <Plus size={16} /> Add Item
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] mb-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left font-medium text-gray-600">Description</th>
              <th className="py-2 px-3 text-right font-medium text-gray-600 w-20">Qty</th>
              <th className="py-2 px-3 text-right font-medium text-gray-600 w-32">Price</th>
              <th className="py-2 px-3 text-right font-medium text-gray-600 w-20">Discount %</th>
              <th className="py-2 px-3 text-right font-medium text-gray-600 w-20">Tax %</th>
              <th className="py-2 px-3 text-right font-medium text-gray-600 w-32">Total</th>
              <th className="py-2 px-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No items added. Click "Add Item" to start.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className={cn("border-b", index % 2 === 0 ? "bg-gray-50" : "")}>
                  <td className="py-3 px-3">
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="text-right border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-right border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.discount || ''}
                      onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-right border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.tax || ''}
                      onChange={(e) => handleItemChange(item.id, 'tax', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-right border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-col items-end gap-2 mt-6 border-t pt-4">
        <div className="flex justify-between w-full md:w-64">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between w-full md:w-64">
          <span className="flex items-center text-gray-600">
            <BadgePercent size={16} className="mr-1 text-green-600" /> Discount:
          </span>
          <span className="font-medium text-red-500">-{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex justify-between w-full md:w-64">
          <span className="flex items-center text-gray-600">
            <BadgePercent size={16} className="mr-1 text-blue-600" /> Tax:
          </span>
          <span className="font-medium">{formatCurrency(taxTotal)}</span>
        </div>
        <div className="flex justify-between w-full md:w-64 border-t border-gray-300 pt-2 mt-2">
          <span className="flex items-center font-semibold text-gray-800">
            <BadgeDollarSign size={18} className="mr-1 text-primary" /> Total:
          </span>
          <span className="font-bold text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItems;
