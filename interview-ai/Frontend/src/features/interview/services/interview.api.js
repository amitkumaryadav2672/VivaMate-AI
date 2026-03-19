import axios from "axios";

// ✅ SIRF YEH LINE CHANGE KI
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,  // ✅ YAHAN localhost ki jagah variable use kiya
    withCredentials: true,
    timeout: 60000 // 60 second timeout
});

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    console.log("📤 Sending to backend:", { jobDescription, selfDescription, resumeFile: resumeFile?.name });

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    try {
        const response = await api.post("/api/interview", formData, {  // ✅ FIXED: Removed trailing slash
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        console.log("✅ Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ API Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching report:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview");
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching reports:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error generating PDF:", error.response?.data || error.message);
        throw error;
    }
};