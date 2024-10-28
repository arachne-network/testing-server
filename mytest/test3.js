const wrtc = require("..");
const RTCPeerConnection = require("..").RTCPeerConnection;
const getUserMedia = require("..").getUserMedia;
const config = {iceServers: [{ urls: "stun:stun.mystunserver.tld" }]};

const pc1 = new RTCPeerConnection(config);
const pc2 = new RTCPeerConnection(config);


// pc1이 pc2에게 영상을 보내고 frame을 확인해봐야 하는가?
// 영상이 가는지 확인해야 하는데.

// 굳이 영상을 넣을 필요가 없으면
// 이제 decoding하는 횟수를 나타내는 파일을 찾아보자.

pc1.addEventListener("icecandidate", (e) => {
    //pc2.addIceCandidate(e.candidate);
});

pc2.addEventListener("icecandidate",(e)=>{
    
    //pc1.addIceCandidate(e.candidate);
});

pc2.addEventListener("track", async (e) => {
    setInterval(async () => {
        const stats = await pc2.getStats();
        console.log(stats);
    },3000);
})


async function init() {
    const media = await getUserMedia({
        audio:true,
        video:true
    });
    const videoTrack = media.getVideoTracks()[0];
    pc1.addTrack(videoTrack);
    // pc1의 track을 추가하고  pc1과 pc2를 연결하고
    // decode되는 값을 없애보자.
    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);
    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);

}
init();