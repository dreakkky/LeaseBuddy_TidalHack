const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function extractTextFromPDF(filePath) {
    const absolutePath = path.resolve(filePath);
    const dataBuffer = fs.readFileSync(absolutePath);

    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    await parser.destroy();

    return result.text;
}

async function extractTextFromDocx(filePath) {
    // Placeholder for DOCX extraction logic
    throw new Error("DOCX extraction not implemented yet");
}

async function extractText(filePath, mimeType) {
  switch (mimeType) {
    case "application/pdf":
      return extractTextFromPDF(filePath);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractTextFromDocx(filePath);
    
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

module.exports = {
    extractTextFromPDF
};