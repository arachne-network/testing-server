const wrtc = require("../build-darwin-arm64/Release/wrtc.node");
const source = new wrtc.RTCVideoSource();
const track = source.createTrack();
const sink = new wrtc.RTCVideoSink(track);


const width = 320;
const height = 240;
const data = new Uint8ClampedArray(width * height * 1.5);
const frame = { width, height, data };

const interval = setInterval(() => {
  // Update the frame in some way before sending.
  source.onFrame(frame);
});

sink.onframe = ({ frame }) => {
  // Do something with the received frame.
  console.log(frame);
};

setTimeout(() => {
    clearInterval(interval);
    track.stop();
    sink.stop();
  }, 10000);