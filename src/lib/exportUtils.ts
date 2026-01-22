import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, BorderStyle, HeadingLevel, AlignmentType } from 'docx';
import * as XLSX from 'xlsx';
import { jsonrepair } from 'jsonrepair';
import { UseCase, Requirement, TestCase } from '@/types/sysEngineer';

// ============= Documentation Export Types =============

export interface DocumentationFile {
  filename: string;
  content: string;
}

export interface DocumentationOutput {
  files: Record<string, string>;
  summary: string;
}

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

// ============= Documentation Export =============

/**
 * Parse documentation content to extract sections
 */
const parseDocumentationSections = (content: string): { title: string; content: string }[] => {
  const sections: { title: string; content: string }[] = [];
  const lines = content.split('\n');
  let currentSection = { title: '', content: '' };
  
  for (const line of lines) {
    // Check for markdown headers (## or #)
    const headerMatch = line.match(/^#+\s+(.+)/);
    if (headerMatch) {
      if (currentSection.title || currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }
      currentSection = { title: headerMatch[1], content: '' };
    } else {
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection.title || currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  return sections;
};

/**
 * Export documentation files to DOCX format
 */
export const exportDocumentationToDocx = async (docs: DocumentationOutput) => {
  const children: (Paragraph | Table)[] = [];
  
  // Add title
  children.push(
    new Paragraph({
      text: 'Technical Documentation',
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );
  
  // Add generation date
  children.push(
    new Paragraph({
      text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      spacing: { after: 300 },
    })
  );
  
  // Add summary section
  if (docs.summary) {
    children.push(
      new Paragraph({
        text: 'Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );
    children.push(
      new Paragraph({
        text: docs.summary,
        spacing: { after: 400 },
      })
    );
  }
  
  // Process each documentation file
  const fileEntries = Object.entries(docs.files);
  for (const [filename, content] of fileEntries) {
    // Add file heading
    children.push(
      new Paragraph({
        text: filename,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );
    
    // Parse and add sections
    const sections = parseDocumentationSections(content);
    for (const section of sections) {
      if (section.title) {
        children.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      
      // Split content into paragraphs and add code block handling
      const contentLines = section.content.trim().split('\n');
      let inCodeBlock = false;
      let codeContent = '';
      
      for (const line of contentLines) {
        if (line.startsWith('```')) {
          if (inCodeBlock) {
            // End code block
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeContent.trim(),
                    font: 'Courier New',
                    size: 20,
                  }),
                ],
                shading: { fill: 'F3F4F6' },
                spacing: { before: 100, after: 100 },
              })
            );
            codeContent = '';
            inCodeBlock = false;
          } else {
            inCodeBlock = true;
          }
        } else if (inCodeBlock) {
          codeContent += line + '\n';
        } else if (line.trim()) {
          children.push(
            new Paragraph({
              text: line,
              spacing: { after: 100 },
            })
          );
        }
      }
    }
  }
  
  const doc = new Document({
    sections: [{ children }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `documentation-${Date.now()}.docx`);
};

/**
 * Export documentation files to XLSX format
 */
export const exportDocumentationToXlsx = (docs: DocumentationOutput) => {
  const workbook = XLSX.utils.book_new();
  
  // Create summary sheet
  const summaryData = [
    ['Documentation Export'],
    ['Generated', new Date().toLocaleString()],
    [''],
    ['Summary'],
    [docs.summary || 'No summary provided'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Create a sheet for each documentation file
  const fileEntries = Object.entries(docs.files);
  for (const [filename, content] of fileEntries) {
    const sections = parseDocumentationSections(content);
    
    // Create rows for the sheet
    const sheetData: string[][] = [[filename], ['']];
    
    for (const section of sections) {
      if (section.title) {
        sheetData.push([`## ${section.title}`]);
      }
      
      const contentLines = section.content.trim().split('\n');
      for (const line of contentLines) {
        sheetData.push([line]);
      }
      sheetData.push(['']); // Empty row between sections
    }
    
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet['!cols'] = [{ wch: 100 }];
    
    // Clean filename for sheet name (max 31 chars, no special chars)
    const sheetName = filename
      .replace(/[\\/:*?[\]]/g, '_')
      .substring(0, 31);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
  
  XLSX.writeFile(workbook, `documentation-${Date.now()}.xlsx`);
};

/**
 * Parse JSON documentation output from agent response
 */
export const parseDocumentationOutput = (content: string): DocumentationOutput | null => {
  try {
    // First, try to parse the entire content as JSON (if it's a pure JSON response)
    try {
      const directParse = JSON.parse(content);
      if (directParse.files && typeof directParse.files === 'object') {
        return {
          files: directParse.files,
          summary: directParse.summary || '',
        };
      }
    } catch {
      // Not a direct JSON, continue to extract
    }

    // Try to repair almost-JSON (models occasionally output invalid JSON with stray quotes, etc.)
    // jsonrepair fixes many common issues without us needing brittle regexes.
    try {
      const repaired = jsonrepair(content);
      const parsed = JSON.parse(repaired);
      if (parsed.files && typeof parsed.files === 'object') {
        return {
          files: parsed.files,
          summary: parsed.summary || '',
        };
      }
    } catch {
      // Continue to extraction methods below
    }

    // Try to find JSON within code blocks (```json ... ```)
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (parsed.files && typeof parsed.files === 'object') {
          return {
            files: parsed.files,
            summary: parsed.summary || '',
          };
        }
      } catch {
        // Continue to next method
      }
    }

    // Try to extract JSON object with "files" key from anywhere in the content
    // Use a more careful approach to find balanced braces
    const filesIndex = content.indexOf('"files"');
    if (filesIndex !== -1) {
      // Find the opening brace before "files"
      let startIndex = filesIndex;
      while (startIndex > 0 && content[startIndex] !== '{') {
        startIndex--;
      }
      
      if (content[startIndex] === '{') {
        // Find matching closing brace
        let braceCount = 0;
        let endIndex = startIndex;
        for (let i = startIndex; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
        
        const jsonStr = content.substring(startIndex, endIndex);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.files && typeof parsed.files === 'object') {
            return {
              files: parsed.files,
              summary: parsed.summary || '',
            };
          }
        } catch {
          // JSON parse failed
        }
      }
    }

    // Fallback: If no structured JSON found, try to create documentation from markdown content
    // This handles cases where the agent responds with plain markdown instead of JSON
    if (content.length > 100 && !content.includes('"files"')) {
      // Create a single file from the markdown content
      return {
        files: {
          'documentation.md': content,
        },
        summary: 'Generated documentation',
      };
    }

    return null;
  } catch {
    return null;
  }
};
