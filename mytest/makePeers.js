const RTCPeerConnection = require("..").RTCPeerConnection;

// class로 만들어서 영상을 받는 객체 하나랑 보내는 RTCPeerConnection을 하나 만들자.
// track이랑 streams를 저장하자


// 내가 누구랑 연결되는지 확인해야 한다.


class TestRTCPeerConnection {
    constructor() {
        const config = {
            iceServers: [{ urls: "stun:stun.mystunserver.tld" }],
          };
        this.getVideoPeer = new RTCPeerConnection(config);
        this.sendVideoPeer = new RTCPeerConnection(config);
        this.track = null;
        this.streams = null;
        this.getVideoPeer.ontrack = async (e) => {
            this.track = e.track;
            this.streams = e.streams;
            e.streams.forEach(stream =>{
                
                this.sendVideoPeer.addTrack(e.track, stream)});
        }
        // 함수로 보내면 될 거 같다.
        this.getVideoPeer.onicecandidate = (e) => {
            this.getVideoPeerCandidate = e.candidate;
        }

        this.sendVideoPeer.onicecandidate = (e) => {
            this.sendVideoPeerCandidate = e.candidate;
        }
    }

    addTracks(track, streams) {
        streams.forEach(stream => this.sendVideoPeer.addTrack(track, stream));
    }
}

// peer1이 peer2에게 영상을 보낸다
async function connectTestPeers(peer1, peer2) {
    peer2.onicecandidate = async (e) => {
        if(e.candidate){
            await peer1.addIceCandidate(e.candidate);
        }
    }
    const offer = await peer1.createOffer();
    await peer1.setLocalDescription(offer);
    await peer2.setRemoteDescription(offer);
    const answer = await peer2.createAnswer();
    await peer2.setLocalDescription(answer);
    await peer1.setRemoteDescription(answer);
    
    
}

// 그냥 객체를 하나 만들어서 연결할까?
module.exports = {
    TestRTCPeerConnection: TestRTCPeerConnection,
    connectTestPeers: connectTestPeers
}