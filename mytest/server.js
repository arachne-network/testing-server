const bodyParser = require("body-parser");
const express = require("express");
const {createServer} = require("http");
const path = require("path");
const { Server, Socket } = require("socket.io");
const { TestRTCPeerConnection, connectTestPeers } = require("./makePeers");
const RTCPeerConnection = require("..").RTCPeerConnection


const port = 3001;

const app = express();
const server = createServer(app);
const io = new Server(server);

const staticDir = path.join(__dirname, "./static");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(staticDir));

const config = {
    iceServers: [{ urls: "stun:stun.mystunserver.tld" }],
  };

const pc = new RTCPeerConnection(config);
const pc2 = new RTCPeerConnection(config);


io.on("connection", (socket) => {
    pc.ontrack = async (e) => {
        // pc2에 addtrack하고 site에 띄워보자.
        e.streams.forEach((stream) => {
            pc2.addTrack(e.track,stream);
        })
        // for(let i = 0 ; e.streams.length(); i ++) {
        //     console.log("hello: " + i);
        //     pc2.addTrack(e.track,e.streams[i]);
        // }
        
        //console.log(sende);
        
    }
    pc.onicecandidate = (e) => {
        socket.emit("setCandidate", {candidate: e.candidate});
    }

    socket.on("getAnswer", async (res) => {
        const answer = res.answer;
        await pc2.setRemoteDescription(answer);
    })

    socket.on("sendCandidate", async (res) => {
        
        if(res.candidate != null) await pc2.addIceCandidate(res.candidate);
    })
    
    socket.on("getVideoStart", async (callback) => {
        const offer = await pc2.createOffer();
        await pc2.setLocalDescription(offer);
        callback({
            offer: offer
        });
    })
    socket.on("sendOffer", async (offer) => {
        const o = offer.offer;
        await pc.setRemoteDescription(o);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit("setAnswer", {sdp: answer});
    });

    socket.on("checkStats", async () => {
        const stats = await pc.getStats();
        console.log(stats);
    })


})
server.listen(port, () => {
    console.log(`[server]: Serves running at <https://localhost>:${port}`);
});
  