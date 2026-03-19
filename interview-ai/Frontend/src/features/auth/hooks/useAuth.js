import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            console.log("🔐 Attempting login for:", email);
            const data = await login({ email, password });
            console.log("✅ Login successful:", data);

            // ✅ TOKEN STORE - AGAR TOKEN HO TO
            if (data?.token) {
                localStorage.setItem("token", data.token);
                console.log("📝 Token stored");
            }

            if (data?.user) {
                setUser(data.user);
            }

            // Redirect to home page
            window.location.href = "/";
            return data;
        } catch (err) {
            console.error("❌ Login error in hook:", err);
            alert("Login failed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });

            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            if (data?.user) {
                setUser(data.user);
            }

            return data;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const data = await logout();
            localStorage.removeItem("token");
            setUser(null);
            return data;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                if (data?.user) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, [setUser, setLoading]);

    return { user, loading, handleRegister, handleLogin, handleLogout };
};