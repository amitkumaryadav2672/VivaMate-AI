const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// ✅ FIXED: Support both local and production
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://viva-mate-ai.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// ✅ Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ✅ Root route
app.get("/", (req, res) => {
    res.send("Backend Server (v3) is Running Successfully!")
})

// ✅ Import routes
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

// ✅ Use routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// ✅ Health check for debugging
app.get("/api/health-check", (req, res) => {
    res.json({
        status: "UP",
        time: new Date(),
        db: "checking...",
        env: {
            node_env: process.env.NODE_ENV,
            has_mongo: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
            has_jwt: !!process.env.JWT_SECRET
        }
    })
})

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    })
})

// ✅ Error handler (Detailed for debugging)
app.use((err, req, res, next) => {
    console.error("❌ BACKEND ERROR:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error (from Backend)",
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
})

module.exports = app