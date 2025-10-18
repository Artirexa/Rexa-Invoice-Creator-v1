
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { InvoiceData } from '@/contexts/InvoiceContext';
import { format } from 'date-fns';

// Add types for jsPDF-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = async (invoice: InvoiceData): Promise<void> => {
  const { company, customer, details, items, subtotal, taxTotal, discountTotal, total } = invoice;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Add company logo if available
  if (company.logoUrl) {
    try {
      doc.addImage(company.logoUrl, 'JPEG', 15, 15, 40, 20, undefined, 'FAST');
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Company information
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, company.logoUrl ? 60 : 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let companyY = 25;
  doc.text(company.address, 60, companyY);
  doc.text(`${company.city}, ${company.zipCode}`, 60, companyY += 5);
  doc.text(company.country, 60, companyY += 5);
  doc.text(`Tel: ${company.phone}`, 60, companyY += 5);
  doc.text(`Email: ${company.email}`, 60, companyY += 5);
  doc.text(`Web: ${company.website}`, 60, companyY += 5);
  
  // Invoice details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 15, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let invoiceY = 30;
  doc.text(`Invoice Number: ${details.invoiceNumber}`, pageWidth - 15, invoiceY, { align: 'right' });
  doc.text(`Issue Date: ${formatDate(details.issueDate)}`, pageWidth - 15, invoiceY += 5, { align: 'right' });
  if (details.dueDateEnabled && details.dueDate) {
    doc.text(`Due Date: ${formatDate(details.dueDate)}`, pageWidth - 15, invoiceY += 5, { align: 'right' });
  }
  
  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 15, 65);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let billToY = 70;
  doc.text(customer.name, 15, billToY);
  if (customer.address) doc.text(customer.address, 15, billToY += 5);
  if (customer.city || customer.zipCode) {
    const cityZip = [customer.city, customer.zipCode].filter(Boolean).join(', ');
    doc.text(cityZip, 15, billToY += 5);
  }
  if (customer.country) doc.text(customer.country, 15, billToY += 5);
  if (customer.email) doc.text(`Email: ${customer.email}`, 15, billToY += 5);
  if (customer.phone) doc.text(`Tel: ${customer.phone}`, 15, billToY += 5);
  
  // Items table
  const tableColumn = ["Description", "Qty", "Unit Price", "Discount", "Tax", "Total"];
  const tableRows = items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discount > 0 ? `${item.discount}%` : '-',
    item.tax > 0 ? `${item.tax}%` : '-',
    formatCurrency(item.total)
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`${company.name} - Invoice ${details.invoiceNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  });
  
  // Final amount calculation
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let summaryY = finalY;
  doc.text('Subtotal:', pageWidth - 60, summaryY);
  doc.text(formatCurrency(subtotal), pageWidth - 15, summaryY, { align: 'right' });
  
  doc.text('Discount:', pageWidth - 60, summaryY += 7);
  doc.text(`-${formatCurrency(discountTotal)}`, pageWidth - 15, summaryY, { align: 'right' });
  
  doc.text('Tax:', pageWidth - 60, summaryY += 7);
  doc.text(formatCurrency(taxTotal), pageWidth - 15, summaryY, { align: 'right' });
  
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 60, summaryY + 3, pageWidth - 15, summaryY + 3);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - 60, summaryY += 10);
  doc.text(formatCurrency(total), pageWidth - 15, summaryY, { align: 'right' });
  
  // Payment terms and notes
  if (details.paymentTerms || details.notes) {
    summaryY += 20;
    doc.setFontSize(10);
    
    if (details.paymentTerms) {
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Terms:', 15, summaryY);
      doc.setFont('helvetica', 'normal');
      doc.text(details.paymentTerms, 50, summaryY);
      summaryY += 7;
    }
    
    if (details.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 15, summaryY);
      doc.setFont('helvetica', 'normal');
      
      const splitNotes = doc.splitTextToSize(details.notes, pageWidth - 30);
      doc.text(splitNotes, 15, summaryY + 7);
    }
  }
  
  // Save the PDF
  doc.save(`${details.invoiceNumber.replace(/\s+/g, '_')}.pdf`);
};
