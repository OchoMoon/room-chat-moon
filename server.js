const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static("public"))

/*
==============================
UPLOAD GAMBAR
==============================
*/

const storage = multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"public/uploads")
},
filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname)
}
})

const upload = multer({storage})

app.post("/upload",upload.single("image"),(req,res)=>{
res.json({
url:"/uploads/"+req.file.filename
})
})

/*
==============================
DATABASE SEMENTARA
==============================
*/

let users = {}
let messages = []
let groups = []
let statusList = []

/*
==============================
REGISTER USER
==============================
*/

app.post("/register",(req,res)=>{

const {number,name,avatar} = req.body

if(!number){
return res.json({error:"nomor kosong"})
}

users[number] = {
number,
name,
avatar,
online:false,
lastSeen:null
}

res.json({success:true})

})

/*
==============================
GET CONTACT LIST
==============================
*/

app.get("/contacts",(req,res)=>{

res.json(Object.values(users))

})

/*
==============================
STATUS / STORY
==============================
*/

app.post("/status",(req,res)=>{

const {user,text,image} = req.body

const data = {
id:Date.now(),
user,
text,
image,
time:Date.now()
}

statusList.push(data)

res.json({success:true})

})

app.get("/status",(req,res)=>{
res.json(statusList)
})

/*
==============================
GROUP CHAT
==============================
*/

app.post("/group/create",(req,res)=>{

const {name,creator} = req.body

const group = {
id:Date.now(),
name,
members:[creator],
messages:[]
}

groups.push(group)

res.json(group)

})

app.post("/group/join",(req,res)=>{

const {groupId,user} = req.body

const group = groups.find(g=>g.id==groupId)

if(group){
group.members.push(user)
}

res.json({success:true})

})

/*
==============================
SOCKET REALTIME CHAT
==============================
*/

io.on("connection",(socket)=>{

console.log("User connected")

socket.on("join",(number)=>{

if(users[number]){

users[number].online=true
users[number].socketId=socket.id

io.emit("onlineUpdate",users)

}

})

/*
==============================
PRIVATE CHAT
==============================
*/

socket.on("chat",(data)=>{

const msg = {
from:data.from,
to:data.to,
msg:data.msg,
time:Date.now(),
type:"text"
}

messages.push(msg)

const toUser = users[data.to]

if(toUser && toUser.socketId){

io.to(toUser.socketId).emit("chat",msg)

}

})

/*
==============================
IMAGE CHAT
==============================
*/

socket.on("image",(data)=>{

const msg = {
from:data.from,
to:data.to,
image:data.image,
type:"image",
time:Date.now()
}

messages.push(msg)

const toUser = users[data.to]

if(toUser && toUser.socketId){

io.to(toUser.socketId).emit("image",msg)

}

})

/*
==============================
GROUP CHAT MESSAGE
==============================
*/

socket.on("groupMessage",(data)=>{

const group = groups.find(g=>g.id==data.groupId)

if(!group) return

const msg = {
user:data.user,
text:data.text,
time:Date.now()
}

group.messages.push(msg)

group.members.forEach(member=>{

const user = users[member]

if(user && user.socketId){

io.to(user.socketId).emit("groupMessage",{
groupId:data.groupId,
msg
})

}

})

})

/*
==============================
TYPING STATUS
==============================
*/

socket.on("typing",(data)=>{

const toUser = users[data.to]

if(toUser && toUser.socketId){

io.to(toUser.socketId).emit("typing",data.from)

}

})

/*
==============================
DISCONNECT
==============================
*/

socket.on("disconnect",()=>{

Object.keys(users).forEach((number)=>{

if(users[number].socketId === socket.id){

users[number].online = false
users[number].lastSeen = Date.now()

}

})

io.emit("onlineUpdate",users)

})

})

/*
==============================
START SERVER
==============================
*/

const PORT = 3000

server.listen(PORT,()=>{

console.log("MoonChat server running on port "+PORT)

})