import axios from "axios"

// ✅ SIRF YEH LINE CHANGE KI
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,  // ✅ YAHAN localhost ki jagah variable use kiya
    withCredentials: true,
    timeout: 10000 // 10 second timeout
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function login({ email, password }) {
    try {
        console.log("📤 Sending login request to:", `${API_URL}/api/auth/login`);
        const response = await api.post("/api/auth/login", {
            email, password
        })
        console.log("✅ Login response:", response.data);
        return response.data;
    } catch (err) {
        console.error("❌ Login error:", err.response?.data || err.message);
        throw err;
    }
}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {

    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}