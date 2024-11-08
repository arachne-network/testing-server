<h1 align="center">
  <img height="120px" src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg">&nbsp;&nbsp;&nbsp;&nbsp;
  <img height="120px" src="https://webrtc.github.io/webrtc-org/assets/images/webrtc-logo-vert-retro-dist.svg">
</h1>

해당 프로젝트는 node-webrtc( https://github.com/node-webrtc/node-webrtc )를 통해 webrtc peer 성능 및 packet을 확인할 수 있는 프로젝트입니다.

## 실행 환경
node-webrtc의 supported platforms를 참고하면 됩니다.

## Install
설치는 docs/build-from-source.md 를 참고하면 됩니다.

## 실행 방법
build-* 파일 내에 있는 webrtc api를 수정했고 반영하고 싶으면 다음 단계를 실행해야 합니다.
1. 환경변수 DEBUG=true 로 설정합니다
2. npm run build를 실행합니다. 이 때, 에러가 발생할 수 있는 데 무시해도 됩니다.
3. scripts/build-from-source.js 에서 if(process.env.DEBUG) {...} 부분을 주석처리 합니다.
4. npm run build를 다시 실행합니다.

## 파일 구성

./build-*/external/libwebrtc/download/src : webrtc api입니다.

./src: webrtc api를 addon을 이용해 javascript로 사용할 수 있게 하는 코드입니다.

./mytest: ./src에서 생성된 api를 이용해 각 peer의 상태를 확인하는 code입니다.



