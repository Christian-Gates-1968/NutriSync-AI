///ADDED THIS FOR MED REMINDER FEATURE
//*********HAVE TO LOGIN ***EVERYDAY*** TO TWILIO ***SANDBOX*** WHEN USING TESTING WHATSAPP MSG FEATURE
//OTHERWISE MAKE  A TEMPLATE AND GET IT APPROVED BY WHATSAPP IF U WANT TO USE IT LONGER THAN 24 HR PERIOD*/
require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const Groq = require("groq-sdk")
//ADDED THIS **************************
//CRON=TO SEND DAILY MESSAGES AT MINS:HRS EG:OR 1.18 AM  TYPE 18 1***,function....  
//run using node index.js after cd to Reminder-app-with...
//and npm start after cd to reminder-app-frontend
const twilio = require('twilio')
const cronJob = require('cron').CronJob;

var client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    var textJob = new cronJob( '43 9 * * *', function(){
        client.messages.create( { 
            from: 'whatsapp:+14155238886',       
            to: 'whatsapp:+918291589667', body:'Hello! Hope you are having a good day!' }, function( err, data ) {
            console.log(err,data,"*");
        });
      },  null, true);
    console.log("Twilio initialized — WhatsApp reminders active");
} else {
    console.log("Twilio credentials not set — WhatsApp reminders disabled");
}
//********************************* */
  
//APP config
const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

// Multer config for food image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|heic/
        const ext = allowed.test(path.extname(file.originalname).toLowerCase())
        const mime = allowed.test(file.mimetype)
        cb(ext && mime ? null : new Error("Only image files are allowed"), ext && mime)
    }
})

// Ensure uploads directory exists
const fs = require("fs")
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

// ── Groq Vision AI — food image analysis ──
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.2-90b-vision-preview"

const VISION_PROMPT = `You are a professional nutritionist AI. Analyze the food shown in
this image and respond ONLY with a valid JSON object — no markdown, no backticks,
no extra text.

JSON schema:
{
  "food": "<short name of the dish>",
  "calories": <number kcal>,
  "protein": <grams>,
  "carbs": <grams>,
  "fat": <grams>,
  "confidence": "high" | "medium" | "low",
  "details": "<one-sentence description of the portion & preparation>"
}

If the image is not food, return:
{"food": "Unknown", "calories": 0, "protein": 0, "carbs": 0, "fat": 0,
 "confidence": "low", "details": "Could not identify food in the image."}`

function extractJSON(text) {
    try { return JSON.parse(text) } catch (_) {}
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch (_) {} }
    return null
}

const MOCK_FOODS = [
    { name: "Grilled Chicken Breast", calories: 284, protein: 53, carbs: 0, fat: 6 },
    { name: "Caesar Salad", calories: 360, protein: 14, carbs: 20, fat: 26 },
    { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "Pasta Bolognese", calories: 520, protein: 24, carbs: 68, fat: 16 },
    { name: "Avocado Toast", calories: 290, protein: 7, carbs: 30, fat: 16 },
    { name: "Protein Smoothie", calories: 340, protein: 30, carbs: 42, fat: 6 },
    { name: "Salmon Fillet", calories: 367, protein: 34, carbs: 0, fat: 22 },
    { name: "Rice & Beans Bowl", calories: 440, protein: 16, carbs: 72, fat: 8 },
]

// POST /api/food/analyze-image — accepts a food photo, returns estimated macros
app.post("/api/food/analyze-image", upload.single("foodImage"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image file provided" })
    }

    // ── Try Groq Vision API directly ──
    if (GROQ_API_KEY) {
        try {
            const imageBuffer = fs.readFileSync(req.file.path)
            const b64 = imageBuffer.toString("base64")
            const mime = req.file.mimetype || "image/jpeg"
            const dataUri = `data:${mime};base64,${b64}`

            const groq = new Groq({ apiKey: GROQ_API_KEY })
            const chatCompletion = await groq.chat.completions.create({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: VISION_PROMPT },
                            { type: "image_url", image_url: { url: dataUri } },
                        ],
                    },
                ],
                temperature: 0.3,
                max_tokens: 512,
            })

            const raw = chatCompletion.choices[0].message.content
            console.log("Groq response:", raw.substring(0, 200))
            const parsed = extractJSON(raw)

            if (parsed && parsed.food) {
                return res.json({
                    success: true,
                    filename: req.file.filename,
                    food: parsed.food,
                    macros: {
                        calories: Number(parsed.calories) || 0,
                        protein: Number(parsed.protein) || 0,
                        carbs: Number(parsed.carbs) || 0,
                        fat: Number(parsed.fat) || 0,
                    },
                    confidence: parsed.confidence || null,
                    details: parsed.details || null,
                    source: "groq",
                })
            }
        } catch (err) {
            console.log("Groq API error, falling back to mock:", err.message)
        }
    } else {
        console.log("GROQ_API_KEY not set — using mock data")
    }

    // ── Fallback: mock data when Groq is unavailable ──
    const detected = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)]
    res.json({
        success: true,
        filename: req.file.filename,
        food: detected.name,
        macros: {
            calories: detected.calories,
            protein: detected.protein,
            carbs: detected.carbs,
            fat: detected.fat,
        },
        source: "mock",
    })
})

//DB config — reads from MONGODB_URI env var, falls back to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reminderAppDB';
let Reminder = null;
let dbConnected = false;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // fail fast if no mongo
}).then(() => {
    console.log("DB connected to:", MONGODB_URI.replace(/:([^:@]+)@/, ':****@')) // hide password in logs
    dbConnected = true;

    const reminderSchema = new mongoose.Schema({
        reminderMsg: String,
        remindAt: String,
        isReminded: Boolean
    })
    Reminder = mongoose.model("reminder", reminderSchema)

    //Whatsapp reminding functionality — only runs when DB + Twilio are available
    if (client) {
        setInterval(() => {
            Reminder.find({}, (err, reminderList) => {
                if(err) { console.log(err); return; }
                if(reminderList){
                    reminderList.forEach(reminder => {
                        if(!reminder.isReminded){
                            const now = new Date()
                            if((new Date(reminder.remindAt) - now) < 0) {
                                Reminder.findByIdAndUpdate(reminder._id, {isReminded: true}, (err, remindObj)=>{
                                    if(err){ console.log(err); return; }
                                    client.messages.create({
                                        from: 'whatsapp:+14155238886',
                                        to: 'whatsapp:+918291589667',
                                        body: reminder.reminderMsg
                                    }).then(message => console.log("Reminder sent:", message.sid))
                                      .catch(e => console.log("Twilio send error:", e.message))
                                })
                            }
                        }
                    })
                }
            })
        }, 1000)
        console.log("Reminder polling active")
    } else {
        console.log("Twilio not configured — reminder polling disabled")
    }
}).catch((err) => {
    console.log("MongoDB not available — reminder features disabled. Server continues without DB.")
    console.log("  (To enable reminders, start MongoDB on localhost:27017)")
})


//API routes
app.get("/getAllReminder", (req, res) => {
    if (!Reminder) return res.status(503).json({ error: "Database not connected" })
    Reminder.find({}, (err, reminderList) => {
        if(err){
            console.log(err)
        }
        if(reminderList){
            res.send(reminderList)
        }
    })
})
app.post("/addReminder", (req, res) => {
    if (!Reminder) return res.status(503).json({ error: "Database not connected" })
    const { reminderMsg, remindAt } = req.body
    const reminder = new Reminder({
        reminderMsg,
        remindAt,
        isReminded: false
    })
    reminder.save(err => {
        if(err){
            console.log(err)
        }
        Reminder.find({}, (err, reminderList) => {
            if(err){
                console.log(err)
            }
            if(reminderList){
                res.send(reminderList)
            }
        })
    })

})
app.post("/deleteReminder", (req, res) => {
    if (!Reminder) return res.status(503).json({ error: "Database not connected" })
    Reminder.deleteOne({_id: req.body.id}, () => {
        Reminder.find({}, (err, reminderList) => {
            if(err){
                console.log(err)
            }
            if(reminderList){
                res.send(reminderList)
            }
        })
    })
})

app.listen(9000, () => console.log("Be started") )