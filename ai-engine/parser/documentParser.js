const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return { text: data.text.trim(), pages: data.numpages, meta: data.info || {} };
}

async function parseDocx(filePath) {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return { text: value.trim(), pages: null, meta: {} };
}

async function parseTxt(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  return { text: text.trim(), pages: null, meta: {} };
}

async function parseDocument(filePath, mimeType) {
  try {
    if (mimeType === 'application/pdf') return await parsePdf(filePath);
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDocx(filePath);
    }
    if (mimeType === 'text/plain') return await parseTxt(filePath);
    throw new Error(`Unsupported mime type: ${mimeType}`);
  } catch (err) {
    throw new Error(`Failed to parse document: ${err.message}`);
  }
}

module.exports = { parseDocument, parsePdf, parseDocx, parseTxt };
