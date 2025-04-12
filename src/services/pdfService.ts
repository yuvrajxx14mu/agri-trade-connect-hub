import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface InvoiceData {
  orderId: string;
  date: string;
  farmerName: string;
  traderName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
}

export const generateInvoicePDF = (data: InvoiceData): Blob => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });

  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${data.orderId}`, 20, 40);
  doc.text(`Date: ${data.date}`, 20, 50);
  doc.text(`Farmer: ${data.farmerName}`, 20, 60);
  doc.text(`Trader: ${data.traderName}`, 20, 70);

  // Add table
  const tableData = data.items.map(item => [
    item.name,
    item.quantity.toString(),
    `₹ ${item.price.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      useGrouping: true
    })}`,
    `₹ ${item.total.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      useGrouping: true
    })}`
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 }
    }
  });

  // Add total
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(12);
  doc.text(`Total Amount: ₹ ${data.total.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    useGrouping: true
  })}`, 20, finalY + 20);

  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 40, { align: 'center' });
  doc.text('This is a computer-generated invoice.', 105, finalY + 50, { align: 'center' });

  // Convert to blob
  return doc.output('blob');
};

export const downloadInvoice = (data: InvoiceData, filename: string) => {
  const blob = generateInvoicePDF(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 