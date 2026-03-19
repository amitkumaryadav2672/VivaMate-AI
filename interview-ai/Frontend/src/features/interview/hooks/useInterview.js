import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        console.log("🚀 Generating report with:", { jobDescription, selfDescription, resumeFile: resumeFile?.name });

        setLoading(true);
        let response = null;

        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            console.log("✅ Report generated:", response);

            // Handle different response structures
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                return response.interviewReport;
            } else if (response?._id) {
                setReport(response);
                return response;
            }
            return response;
        } catch (error) {
            console.error("❌ Error in generateReport:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        // ✅ FIX: Check if interviewId exists
        if (!interviewId) {
            console.log("⚠️ No interviewId provided to getReportById");
            return null;
        }

        setLoading(true);
        let response = null;

        try {
            console.log("📋 Fetching report ID:", interviewId);
            response = await getInterviewReportById(interviewId);
            console.log("✅ Report fetched:", response);

            // Handle different response structures
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                return response.interviewReport;
            } else if (response?._id) {
                setReport(response);
                return response;
            }
            return response;
        } catch (error) {
            console.error("❌ Error in getReportById:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        let response = null;

        try {
            response = await getAllInterviewReports();
            console.log("✅ Reports fetched:", response);

            if (response?.interviewReports) {
                setReports(response.interviewReports);
                return response.interviewReports;
            } else if (Array.isArray(response)) {
                setReports(response);
                return response;
            }
            return response;
        } catch (error) {
            console.error("❌ Error in getReports:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) {
            console.log("⚠️ No interviewReportId provided to getResumePdf");
            return;
        }

        setLoading(true);

        try {
            const response = await generateResumePdf({ interviewReportId });
            console.log("✅ PDF generated, size:", response?.size);

            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("❌ Error in getResumePdf:", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIX: Only fetch if interviewId exists and is valid
    useEffect(() => {
        if (interviewId) {
            console.log("📋 useEffect - Fetching report for ID:", interviewId);
            getReportById(interviewId);
        } else {
            console.log("📋 useEffect - No interviewId, fetching all reports");
            getReports();
        }
    }, [interviewId]);

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    };
};