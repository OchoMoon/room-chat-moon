const TelegramBot = require("node-telegram-bot-api")

const token = "TOKEN_BOT_KAMU"

const bot = new TelegramBot(token,{polling:true})

bot.onText(/\/start/,msg=>{

 bot.sendMessage(msg.chat.id,"Selamat datang di verifikasi MoonChat")

})

bot.on("message",msg=>{

 const otp = Math.floor(100000 + Math.random()*900000)

 bot.sendMessage(msg.chat.id,"Kode OTP kamu: "+otp)

})