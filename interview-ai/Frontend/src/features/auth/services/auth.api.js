import axios from "axios"

// ✅ SIRF YEH LINE CHANGE KI
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 60000 
})

// ✅ NEW: Automatically add token to headers if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

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