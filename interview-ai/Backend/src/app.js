const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// ✅ CORS - Pehle ye aana chahiye
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// ✅ Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ✅ Root route
app.get("/", (req, res) => {
    res.send("Backend Server is Running Successfully!")
})

// ✅ Import routes
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

// ✅ Use routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// ✅ FIXED: 404 handler - Express 5+ mein "*" ki jagah ye use karo
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    })
})

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });
})

module.exports = app