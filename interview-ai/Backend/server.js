require("dotenv").config()
const app = require("./src/app")  // ✅ AGAR app.js src FOLDER MEIN HAI TO YEH USE KARO
const connectToDB = require("./src/config/database")

// Connect to database
connectToDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log("=================================")
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`📝 API URL: http://localhost:${PORT}/api/interview`)
    console.log(`🔍 Auth URL: http://localhost:${PORT}/api/auth`)
    console.log(`🏠 Root URL: http://localhost:${PORT}`)
    console.log("=================================")
})