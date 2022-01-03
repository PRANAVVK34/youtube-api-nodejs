const express = require('express')
const path = require('path')

const server = express()

const youtubeService = require('./youtubeService')

server.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '/index.html'))
})

server.get('/auth',(req,res)=>{
    youtubeService.getCode(res);
})

server.get('/callback',(req,res)=>{
    const {code} = req.query;
    youtubeService.getTokensWithCode(code)
    res.redirect('/')
})

server.get('/find-active-chat',(req,res)=>{
    youtubeService.findActiveChat();
    res.redirect('/')
})

server.get('/start-tracking-chat',(req,res)=>{
    youtubeService.startTrackingChat();
})

server.get('/stop-tracking-chat',(req,res)=>{
    youtubeService.stopTracking();
})

server.listen(3000,()=>{
    console.log("server started in 3000");
})