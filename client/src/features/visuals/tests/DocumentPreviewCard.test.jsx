import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentPreviewCard from '../components/DocumentPreviewCard';
import { parseVisualSpec } from '@/lib/visuals/schema';

describe('DocumentPreviewCard and Schema', () => {
  const sampleExcelSpec = {
    type: 'document_preview',
    documentType: 'excel',
    filename: 'executive_sales_report.xlsx',
    fileSize: 15420,
    downloadUrl: 'https://r2.test/download.xlsx',
    storageKey: 'stores/123/docs/file.xlsx',
    preview: {
      type: 'excel',
      filename: 'executive_sales_report.xlsx',
      file_size: 15420,
      sheet_count: 2,
      sheet_names: ['Summary', 'Detailed Sales'],
      sheets: [
        {
          name: 'Summary',
          columns: ['Metric', 'Value'],
          rows: [
            ['Total Revenue', '₹1,50,000'],
            ['Total Orders', 320],
          ],
        },
        {
          name: 'Detailed Sales',
          columns: ['Product', 'Quantity', 'Amount'],
          rows: [
            ['Basmati Rice', 50, '₹22,500'],
            ['Wheat Flour', 30, '₹11,400'],
          ],
        },
      ],
    },
  };

  test('validates document_preview spec via Zod parseVisualSpec', () => {
    const res = parseVisualSpec(sampleExcelSpec);
    expect(res.success).toBe(true);
    expect(res.data.type).toBe('document_preview');
    expect(res.data.filename).toBe('executive_sales_report.xlsx');
  });

  test('renders inline Excel card preview with download and full view buttons', () => {
    render(<DocumentPreviewCard spec={sampleExcelSpec} />);

    // Filename and type badge
    expect(screen.getByText('executive_sales_report.xlsx')).toBeInTheDocument();
    expect(screen.getByText('Excel .XLSX')).toBeInTheDocument();

    // Size and status
    expect(screen.getByText(/15.1 KB/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready for Download/i)).toBeInTheDocument();

    // Inline table preview
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('₹1,50,000')).toBeInTheDocument();

    // Full View and Download buttons
    expect(screen.getByRole('button', { name: /Full View/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
  });

  test('opens Full Page Viewing modal and switches sheets', () => {
    render(<DocumentPreviewCard spec={sampleExcelSpec} />);

    // Click "Full View"
    const fullViewBtn = screen.getByRole('button', { name: /Full View/i });
    fireEvent.click(fullViewBtn);

    // Modal is opened
    expect(screen.getByText(/Full Document Viewer/i)).toBeInTheDocument();

    // Sheet switch tabs are visible
    const detailedSheetTab = screen.getAllByRole('button', { name: /Detailed Sales/i });
    expect(detailedSheetTab.length).toBeGreaterThan(0);

    // Switch to Detailed Sales sheet
    fireEvent.click(detailedSheetTab[0]);
    expect(screen.getAllByText('Basmati Rice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹22,500').length).toBeGreaterThan(0);

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Search rows.../i);
    fireEvent.change(searchInput, { target: { value: 'Wheat' } });
    expect(screen.getAllByText('Wheat Flour').length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByTitle(/Close \(Esc\)/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Full Document Viewer/i)).not.toBeInTheDocument();
  });

  test('renders Word document preview properly', () => {
    const sampleWordSpec = {
      type: 'document_preview',
      documentType: 'word',
      filename: 'monthly_store_audit.docx',
      fileSize: 24500,
      downloadUrl: 'https://r2.test/download.docx',
      preview: {
        type: 'word',
        title: 'Monthly Store Performance Audit',
        subtitle: 'Executive Summary for Management',
        sections: [
          {
            heading: 'Financial Overview',
            level: 1,
            paragraphs: ['Strong revenue gains were noted across high margin grocery categories.'],
          },
        ],
      },
    };

    render(<DocumentPreviewCard spec={sampleWordSpec} />);
    expect(screen.getByText('monthly_store_audit.docx')).toBeInTheDocument();
    expect(screen.getByText('Word .DOCX')).toBeInTheDocument();
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    expect(screen.getByText(/Strong revenue gains were noted/i)).toBeInTheDocument();
  });
});
