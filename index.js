///ADDED THIS FOR MED REMINDER FEATURE
//*********HAVE TO LOGIN ***EVERYDAY*** TO TWILIO ***SANDBOX*** WHEN USING TESTING WHATSAPP MSG FEATURE
//OTHERWISE MAKE  A TEMPLATE AND GET IT APPROVED BY WHATSAPP IF U WANT TO USE IT LONGER THAN 24 HR PERIOD*/
require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
//ADDED THIS **************************
//CRON=TO SEND DAILY MESSAGES AT MINS:HRS EG:OR 1.18 AM  TYPE 18 1***,function....  
//run using node index.js after cd to Reminder-app-with...
//and npm start after cd to reminder-app-frontend
const twilio = require('twilio')
const { ConnectionPolicyPage } = require('twilio/lib/rest/voice/v1/connectionPolicy')

var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
cronJob = require('cron').CronJob;
var textJob = new cronJob( '43 9 * * *', function(){
    client.messages.create( { 
        from: 'whatsapp:+14155238886',       
        to: 'whatsapp:+918291589667', body:'Hello! Hope you’re having a good day!' }, function( err, data ) {
        console.log(err,data,"*");
    });
  },  null, true);
  //WE NEED TO ACCESS REMINDAT TIME(8 O CLOCK) AND SEND REMINDMSG AT THAT TIME DAILY USING CRON?????
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

// POST /api/food/analyze-image — accepts a food photo, returns estimated macros
// Proxies to the Python AI microservice at localhost:8000 when available,
// otherwise falls back to mock data so the frontend always works.
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000"

app.post("/api/food/analyze-image", upload.single("foodImage"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image file provided" })
    }

    // ── Try the Python AI microservice first ──
    try {
        const FormData = require("form-data")
        const http = require("http")

        const form = new FormData()
        form.append("foodImage", fs.createReadStream(req.file.path), {
            filename: req.file.filename,
            contentType: req.file.mimetype,
        })

        const aiResponse = await new Promise((resolve, reject) => {
            const url = new URL("/analyze", AI_SERVICE_URL)
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                method: "POST",
                headers: form.getHeaders(),
                timeout: 30000,
            }
            const request = http.request(options, (response) => {
                let data = ""
                response.on("data", (chunk) => (data += chunk))
                response.on("end", () => {
                    try {
                        resolve(JSON.parse(data))
                    } catch (e) {
                        reject(new Error("Invalid JSON from AI service"))
                    }
                })
            })
            request.on("error", reject)
            request.on("timeout", () => { request.destroy(); reject(new Error("AI service timeout")) })
            form.pipe(request)
        })

        if (aiResponse && aiResponse.success) {
            return res.json({
                success: true,
                filename: req.file.filename,
                food: aiResponse.food,
                macros: aiResponse.macros,
                confidence: aiResponse.confidence || null,
                details: aiResponse.details || null,
                source: "ai",
            })
        }
    } catch (err) {
        console.log("AI service unavailable, falling back to mock:", err.message)
    }

    // ── Fallback: mock data when AI service is offline ──
    const mockFoods = [
        { name: "Grilled Chicken Breast", calories: 284, protein: 53, carbs: 0, fat: 6 },
        { name: "Caesar Salad", calories: 360, protein: 14, carbs: 20, fat: 26 },
        { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        { name: "Pasta Bolognese", calories: 520, protein: 24, carbs: 68, fat: 16 },
        { name: "Avocado Toast", calories: 290, protein: 7, carbs: 30, fat: 16 },
        { name: "Protein Smoothie", calories: 340, protein: 30, carbs: 42, fat: 6 },
        { name: "Salmon Fillet", calories: 367, protein: 34, carbs: 0, fat: 22 },
        { name: "Rice & Beans Bowl", calories: 440, protein: 16, carbs: 72, fat: 8 },
    ]
    const detected = mockFoods[Math.floor(Math.random() * mockFoods.length)]

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

//DB config
mongoose.connect('mongodb://localhost:27017/reminderAppDB', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}, () => console.log("DB connected"))
const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    remindAt: String,
    isReminded: Boolean
})
const Reminder = new mongoose.model("reminder", reminderSchema)


//Whatsapp reminding functionality

setInterval(() => {
    Reminder.find({}, (err, reminderList) => {
        if(err) {
            console.log(err)
        }
        if(reminderList){
            reminderList.forEach(reminder => {
                if(!reminder.isReminded){
                    const now = new Date()
                    if((new Date(reminder.remindAt) - now) < 0) {
                        Reminder.findByIdAndUpdate(reminder._id, {isReminded: true}, (err, remindObj)=>{
                            if(err){
                                console.log(err)
                                
                            }
                            const accountSid = process.env.TWILIO_ACCOUNT_SID 
                            const authToken = process.env.TWILIO_AUTH_TOKEN
                            const client = require('twilio')(accountSid, authToken); 
                            
                            ////add for cron for daily update***********8
                            var base=String(new Date(reminder.remindAt.toLocaleString(undefined, {timezone:"Asia/Kolkata"})));
                            console.log(base);
                            var minsRem=String(new Date(reminder.remindAt.toLocaleString(undefined, {timezone:"Asia/Kolkata"}))).slice(-36,-34);
                            var hrsRem=String(new Date(reminder.remindAt.toLocaleString(undefined, {timezone:"Asia/Kolkata"}))).slice(-39,-37);
                            console.log(hrsRem);
                            var daysRem=String(new Date(reminder.remindAt.toLocaleString(undefined, {timezone:"Asia/Kolkata"}))).slice(0,3);                        
                            var daysRemNo=0;
                            var week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                            for(var i=0;i<7;i++){
                                if(week[i]==daysRem){
                               daysRemNo=i;    
                               }  }
                            console.log("***",minsRem,"***",hrsRem,"***",daysRemNo); 
                            var param1="* "+minsRem+" "+hrsRem+" * * "+daysRemNo;  
                            console.log("param1 for cron-job=",param1); 
                            //FOR SENDING MESSAGE THROUGH CRON+TWILIO WEEKLY FROM NOW ***********************  
                            //******SETTING SEC=58 OTHERWISE MESSAGE SENT FOR EVERY SECOND */                  
                            var textJob = new cronJob( 59+" "+minsRem+" "+hrsRem+" * * "+daysRemNo, function(){
                                client.messages 
                                .create({ 
                                    from: 'whatsapp:+14155238886',       
                                    to: 'whatsapp:+918291589667',//YOUR PHONE NUMBER INSTEAD OF 8888888888
                                    body: reminder.reminderMsg 
                                }) ;
                            },  null, true)                          
                             ////FOR SENDING MESSAGE NOW THROUGH TWILIO********
                            client.messages 
                            .create({ 
                                from: 'whatsapp:+14155238886',       
                                to: 'whatsapp:+918291589667',//YOUR PHONE NUMBER INSTEAD OF 8888888888
                                body: reminder.reminderMsg 
                            }).then(message => console.log("***",message.sid,"***",minsRem,hrsRem,daysRemNo)) 
                             .done()
                             
                            ////******** */end
                        })
                    }
                }
            })
        }
    })
},1000)
;


//API routes
app.get("/getAllReminder", (req, res) => {
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