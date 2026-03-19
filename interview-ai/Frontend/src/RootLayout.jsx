import { Outlet } from "react-router";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";

const RootLayout = () => {
    return (
        <AuthProvider>
            <InterviewProvider>
                <Outlet />
            </InterviewProvider>
        </AuthProvider>
    );
};

export default RootLayout;
