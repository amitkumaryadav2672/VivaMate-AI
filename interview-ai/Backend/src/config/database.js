const mongoose = require("mongoose")



async function connectToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            dbName: "Interview-AI"
        })

        console.log("✅ [v2] Connected to Database Successfully")
    }
    catch (err) {
        console.error("❌ [v2] MongoDB Connection Error:", err.message)
        throw err
    }
}

module.exports = connectToDB