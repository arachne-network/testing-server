const bodyParser = require("body-parser");
const express = require("express");
const {createServer} = require("http");
const path = require("path");
const { Server, Socket } = require("socket.io");
const { TestRTCPeerConnection, connectTestPeers } = require("./makePeers");
const RTCPeerConnection = require("..").RTCPeerConnection;

// class로 만들어서 영상을 받는 객체 하나랑 보내는 RTCPeerConnection을 하나 만들자.
// track이랑 streams를 저장하자


// 내가 누구랑 연결되는지 확인해야 한다.


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
// pc는 getVideoPeer이고 pc2는 sendVideoPeer이다

const testpeer = new TestRTCPeerConnection();
const finalpeer = new TestRTCPeerConnection();
const initpc = new RTCPeerConnection(config);
//const finalpc = new RTCPeerConnection(config);
const finalpc = finalpeer.sendVideoPeer;


async function connects(n) {
    // 최대 n개까지 연결한다.
    let testpeers = [testpeer];
    for(let i = 0 ; i < n; i++) {
        testpeers.push(new TestRTCPeerConnection());
    }
    testpeers.push(finalpeer);
    const len = testpeers.length;
    for(let i = 0; i < len-1; i++) {
        await connectTestPeers(testpeers[i].sendVideoPeer, testpeers[i+1].getVideoPeer);
        console.log(i);
    }
    
}

io.on("connection", (socket) => {
    initpc.ontrack = async (e) => {
        // pc2에 addtrack하고 site에 띄워보자.
        let streams = e.streams;
        let track = e.track;
        testpeer.addTracks(track, streams);
        await connects(1000);
        console.log("finished!!");
    }
    initpc.onicecandidate = (e) => {
        socket.emit("setCandidate", {candidate: e.candidate});
    }

    socket.on("getAnswer", async (res) => {
        const answer = res.answer;
        await finalpc.setRemoteDescription(answer);
    })

    socket.on("sendCandidate", async (res) => {
        
        if(res.candidate != null) await finalpc.addIceCandidate(res.candidate);
    })
    
    socket.on("getVideoStart", async (callback) => {
        const offer = await finalpc.createOffer();
        await finalpc.setLocalDescription(offer);
        callback({
            offer: offer
        });
    })
    socket.on("sendOffer", async (offer) => {
        const o = offer.offer;
        await initpc.setRemoteDescription(o);
        
        const answer = await initpc.createAnswer();
        await initpc.setLocalDescription(answer);
        
        socket.emit("setAnswer", {sdp: answer});
    });

    socket.on("checkStats", async () => {
        const stats = await testpeer.sendVideoPeer.getStats();
        console.log(stats);
    })


})
server.listen(port, () => {
    console.log(`[server]: Serves running at <https://localhost>:${port}`);
});
  