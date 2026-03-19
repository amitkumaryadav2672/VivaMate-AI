const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // 🔍 DEBUG LOGS
        console.log("=================================");
        console.log("📥 Request received at:", new Date().toISOString());
        console.log("📁 File in request:", req.file ? "YES" : "NO");
        console.log("📝 Body:", req.body);

        if (req.file) {
            console.log("✅ File details:");
            console.log("   - Name:", req.file.originalname);
            console.log("   - Size:", req.file.size, "bytes");
            console.log("   - Type:", req.file.mimetype);
            console.log("   - Buffer length:", req.file.buffer.length);
        }

        // Check if file exists
        if (!req.file) {
            console.log("❌ No file in request");
            return res.status(400).json({
                success: false,
                message: "Resume file is required"
            });
        }

        // Check if file is PDF
        if (req.file.mimetype !== 'application/pdf') {
            console.log("❌ Invalid file type:", req.file.mimetype);
            return res.status(400).json({
                success: false,
                message: "Only PDF files are allowed"
            });
        }

        // Extract text from PDF
        let resumeContent;
        try {
            console.log("📄 Parsing PDF...");
            resumeContent = await pdfParse(req.file.buffer);
            console.log("✅ PDF parsed successfully. Text length:", resumeContent.text.length);
            console.log("📝 First 100 chars:", resumeContent.text.substring(0, 100));
        } catch (pdfError) {
            console.error("❌ PDF Parse Error:", pdfError);
            return res.status(400).json({
                success: false,
                message: "Failed to parse PDF file. Please ensure it's a valid PDF.",
                error: pdfError.message
            });
        }

        const { selfDescription, jobDescription } = req.body;
        console.log("📝 Self Description provided:", selfDescription ? "YES" : "NO");
        console.log("📝 Job Description provided:", jobDescription ? "YES" : "NO");

        // Validate required fields
        if (!selfDescription || !jobDescription) {
            console.log("❌ Missing required fields");
            return res.status(400).json({
                success: false,
                message: "Self description and job description are required"
            });
        }

        // Validate text extraction
        if (!resumeContent.text || resumeContent.text.trim().length === 0) {
            console.log("❌ No text extracted from PDF");
            return res.status(400).json({
                success: false,
                message: "Could not extract text from PDF. The file might be empty or image-based."
            });
        }

        // Generate AI report
        console.log("🤖 Generating AI report...");
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        });
        console.log("✅ AI report generated");

        // Create report in database
        console.log("💾 Saving to database...");
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });
        console.log("✅ Report saved with ID:", interviewReport._id);

        // ✅ FIX: Return the complete report object
        res.status(201).json({
            success: true,
            message: "Interview report generated successfully.",
            interviewReport: interviewReport  // Send full report
        });

    } catch (error) {
        console.error("❌ Error in generateInterViewReportController:", error);
        res.status(500).json({
            success: false,
            message: "Error generating interview report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;

        // ✅ FIX: Check if interviewId exists
        if (!interviewId) {
            console.log("❌ No interviewId provided");
            return res.status(400).json({
                success: false,
                message: "Interview ID is required"
            });
        }

        console.log("📋 Fetching report with ID:", interviewId);

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            console.log("❌ Report not found for ID:", interviewId);
            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            });
        }

        console.log("✅ Report fetched successfully");
        res.status(200).json({
            success: true,
            message: "Interview report fetched successfully.",
            interviewReport
        });

    } catch (error) {
        console.error("❌ Error in getInterviewReportByIdController:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching interview report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        console.log("📋 Found", interviewReports.length, "reports for user:", req.user.id);

        res.status(200).json({
            success: true,
            message: "Interview reports fetched successfully.",
            count: interviewReports.length,
            interviewReports
        });

    } catch (error) {
        console.error("❌ Error in getAllInterviewReportsController:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching interview reports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        // ✅ FIX: Check if interviewReportId exists
        if (!interviewReportId) {
            console.log("❌ No interviewReportId provided");
            return res.status(400).json({
                success: false,
                message: "Interview report ID is required"
            });
        }

        console.log("📋 Generating PDF for report ID:", interviewReportId);

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            console.log("❌ Report not found for ID:", interviewReportId);
            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            });
        }

        // Check if user owns this report
        if (interviewReport.user.toString() !== req.user.id) {
            console.log("❌ User not authorized for this report");
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this report"
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        console.log("📄 Generating PDF with resume length:", resume?.length || 0);
        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        // Set response headers for PDF download
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
            "Content-Length": pdfBuffer.length
        });

        console.log("✅ PDF generated successfully, size:", pdfBuffer.length, "bytes");
        res.send(pdfBuffer);

    } catch (error) {
        console.error("❌ Error in generateResumePdfController:", error);
        res.status(500).json({
            success: false,
            message: "Error generating resume PDF",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};