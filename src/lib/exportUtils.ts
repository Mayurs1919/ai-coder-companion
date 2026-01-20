import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, BorderStyle, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
import { UseCase, Requirement, TestCase } from '@/types/sysEngineer';

// ============= DOCX Export =============

const createTableCell = (text: string, isHeader = false): TableCell => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            size: isHeader ? 22 : 20,
          }),
        ],
      }),
    ],
    shading: isHeader ? { fill: 'E5E7EB' } : undefined,
  });
};

export const exportUseCasesToDocx = async (useCases: UseCase[]) => {
  const headerRow = new TableRow({
    children: [
      createTableCell('Sr. No.', true),
      createTableCell('UC ID', true),
      createTableCell('Use Case Name', true),
      createTableCell('Description', true),
      createTableCell('Actor', true),
      createTableCell('Stakeholders', true),
      createTableCell('Priority', true),
      createTableCell('Pre-Condition', true),
      createTableCell('Status', true),
    ],
  });

  const dataRows = useCases.map(
    (uc) =>
      new TableRow({
        children: [
          createTableCell(uc.srNo.toString()),
          createTableCell(uc.useCaseId),
          createTableCell(uc.useCaseName),
          createTableCell(uc.description),
          createTableCell(uc.actor),
          createTableCell(uc.stakeholders.join(', ')),
          createTableCell(uc.priority),
          createTableCell(uc.preCondition),
          createTableCell(uc.status),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Use Cases',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `use-cases-${Date.now()}.docx`);
};

export const exportRequirementsToDocx = async (requirements: Requirement[]) => {
  const headerRow = new TableRow({
    children: [
      createTableCell('Sr. No.', true),
      createTableCell('UC ID', true),
      createTableCell('Req ID', true),
      createTableCell('Requirement Title', true),
      createTableCell('Description', true),
      createTableCell('Type', true),
      createTableCell('Priority', true),
      createTableCell('Status', true),
    ],
  });

  const dataRows = requirements.map(
    (req) =>
      new TableRow({
        children: [
          createTableCell(req.srNo.toString()),
          createTableCell(req.useCaseId),
          createTableCell(req.requirementId),
          createTableCell(req.requirementTitle),
          createTableCell(req.description),
          createTableCell(req.type),
          createTableCell(req.priority),
          createTableCell(req.status),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Requirements',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `requirements-${Date.now()}.docx`);
};

export const exportTestCasesToDocx = async (testCases: TestCase[]) => {
  const headerRow = new TableRow({
    children: [
      createTableCell('Sr. No.', true),
      createTableCell('UC ID', true),
      createTableCell('Req ID', true),
      createTableCell('TC ID', true),
      createTableCell('Test Case Name', true),
      createTableCell('Type', true),
      createTableCell('Priority', true),
      createTableCell('Precondition', true),
      createTableCell('Postcondition', true),
      createTableCell('Action', true),
      createTableCell('Expected Result', true),
    ],
  });

  const dataRows = testCases.map(
    (tc) =>
      new TableRow({
        children: [
          createTableCell(tc.srNo.toString()),
          createTableCell(tc.useCaseId),
          createTableCell(tc.requirementId),
          createTableCell(tc.testCaseId),
          createTableCell(tc.testCaseName),
          createTableCell(tc.type),
          createTableCell(tc.priority),
          createTableCell(tc.precondition),
          createTableCell(tc.postcondition),
          createTableCell(tc.action),
          createTableCell(tc.expectedResult),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Test Cases',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `test-cases-${Date.now()}.docx`);
};

// ============= XLSX Export =============

export const exportUseCasesToXlsx = (useCases: UseCase[]) => {
  const data = useCases.map((uc) => ({
    'Sr. No.': uc.srNo,
    'UC ID': uc.useCaseId,
    'Use Case Name': uc.useCaseName,
    'Description': uc.description,
    'Actor': uc.actor,
    'Stakeholders': uc.stakeholders.join(', '),
    'Priority': uc.priority,
    'Pre-Condition': uc.preCondition,
    'Status': uc.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Use Cases');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `use-cases-${Date.now()}.xlsx`);
};

export const exportRequirementsToXlsx = (requirements: Requirement[]) => {
  const data = requirements.map((req) => ({
    'Sr. No.': req.srNo,
    'UC ID': req.useCaseId,
    'Req ID': req.requirementId,
    'Requirement Title': req.requirementTitle,
    'Description': req.description,
    'Type': req.type,
    'Priority': req.priority,
    'Status': req.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requirements');
  
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `requirements-${Date.now()}.xlsx`);
};

export const exportTestCasesToXlsx = (testCases: TestCase[]) => {
  const data = testCases.map((tc) => ({
    'Sr. No.': tc.srNo,
    'UC ID': tc.useCaseId,
    'Req ID': tc.requirementId,
    'TC ID': tc.testCaseId,
    'Test Case Name': tc.testCaseName,
    'Type': tc.type,
    'Priority': tc.priority,
    'Precondition': tc.precondition,
    'Postcondition': tc.postcondition,
    'Action': tc.action,
    'Expected Result': tc.expectedResult,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');
  
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `test-cases-${Date.now()}.xlsx`);
};
