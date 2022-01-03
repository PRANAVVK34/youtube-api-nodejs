const {google} = require('googleapis')

const util = require('util')
const fs = require('fs');

const writeFilePromise = util.promisify(fs.writeFile);
const readFilePromise = util.promisify(fs.readFile);

let liveChatId;
let nextPage;
const intervalTime = 5000;
let interval;
let chatMessages = [];

const save = async (path, data)=> {
    await writeFilePromise(path, data)
    console.log('successfully saved');
}

const read = async path =>{
    const fileContents = await readFilePromise(path)
    return JSON.parse(fileContents)
}

const youtube = google.youtube('v3')

const Oauth2 = google.auth.OAuth2;

const ClientID = '1022249698599-cvtmrmnk6gg8mj5er5lsmjnfd7poh3j1.apps.googleusercontent.com'
const ClientSecret = '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'
const redirectUri = 'http://localhost:3000/callback'

const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
]


const auth = new Oauth2(ClientID, ClientSecret, redirectUri)

const youtubeService = {}

youtubeService.getCode = response =>{
    const authUrl = auth.generateAuthUrl({
        access_type:'offline',
        scope:scopes,

    })
    response.redirect(authUrl)
}

youtubeService.getTokensWithCode = async code =>{
    const credentials = await auth.getToken(code);
    youtubeService.authorize(credentials);
}

youtubeService.authorize = ({ tokens }) =>{
    auth.setCredentials(tokens);
    console.log('successfully set credentials');
    console.log('tokens', tokens);
    save('./tokens.json', JSON.stringify(tokens))
}

auth.on('tokens', (tokens)=>{
    console.log('new tokens received');
    save('./tokens.json', JSON.stringify(tokens))
})


const checkTokens = async () =>{
    const tokens = await read('./tokens.json')
    if(tokens) {
        console.log('setting tokens');
        return auth.setCredentials(tokens)
    }
    console.log('no tokens');
}

youtubeService.findActiveChat = async() =>{
    const response = await youtube.liveBroadcasts.list({
        auth:auth,
        part:'snippet',
        broadcastStatus:'active',
    })
    const latestChat = response.data.items[0];
    liveChatId = latestChat.snippet.liveChatId;
    console.log('chatId', liveChatId);
}

const getChatMessages = async () =>{
    const response = await youtube.liveChatMessages.list({
        auth:auth,
        part:'snippet',
        liveChatId:liveChatId,
        pageToken:nextPage,
    })
    const { data } = response;
    const newMessage = data.items;
    chatMessages.push(...newMessage);
    nextPage = data.nextPageToken;
    console.log('total chat messages : ' , newMessage);
}

youtubeService.startTrackingChat = async () =>{
    interval = setInterval(getChatMessages, intervalTime)
}

youtubeService.stopTracking = () => {
    clearInterval(interval)
}

checkTokens()

module.exports = youtubeService;