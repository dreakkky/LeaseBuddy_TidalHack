const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { analyzeChunks } = require("../services/featherless.service");
const { extractTextFromPDF } = require("../utils/extract_pdf");
const { redactPersonalInfo} = require("../utils/redact");

// Ensure storage folder exists
const STORAGE_DIR = path.join(__dirname, "../storage");
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

const uploadLease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Uploading file...")

        const documentId = uuidv4();
        
        const ext = path.extname(req.file.originalname).toLowerCase();

        const savedPath = path.join(STORAGE_DIR, `doc_${documentId}${ext}`);

        fs.renameSync(req.file.path, savedPath);

        const text = await extractTextFromPDF(savedPath);

        const redactedtext = redactPersonalInfo(text);
    
        const clauses = await analyzeChunks(text);

        // Save report JSON
        const report = { clauses: Array.isArray(clauses) ? clauses : [] };
        const reportPath = path.join(STORAGE_DIR, `${documentId}-report.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Return response
        res.json({
            documentId,
            file: savedPath,
            report: reportPath,
            summary: report.clauses.map(c => c.title)
        });

    } catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ error: "Lease upload failed" });
    }
};

const getLeaseReport = async (req, res) => {
    try {

        const { documentId } = req.params;
        const reportPath = path.join(STORAGE_DIR, `${documentId}-report.json`);
        
        // Check if report exists
        if (!fs.existsSync(reportPath)) {
            return res.status(404).json({ error: "Report not found" });
        }

        const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
        
        // Calculate average score
        const scores = report.clauses
        .map(c => c.score)
        .filter(s => typeof s === "number");

        const averageScore =
        scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null;

        res.json({
        documentId,
        score: averageScore,
        report
        });

    } catch (err) {
        console.error("Get report failed:", err);
        res.status(500).json({ error: "Could not retrieve report" });
    }
};

module.exports = {
    uploadLease,
    getLeaseReport
};
