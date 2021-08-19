const socketio = require('socket.io-client');
import './global';

import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

let setScreenPersist;

export default function ConnectionManager(setScreen) {
  
  setScreenPersist = setScreen;

  const socket = socketio.connect('wss://controller.y33t.net:443');
  global.socket = socket;

  socket.on('roomAccepted', (controllerLayout) => {
    setScreen('controller');
  });

  socket.on('disconnectHost', (reason) => {
    global.disconnectReason = reason;
    setScreen('disconnect');
  });

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const pc = new RTCPeerConnection(servers);
  // console.log(pc);

  socket.on('rtcOffer', async (sdp) => {
    let offer = {
      type: 'offer',
      sdp: sdp
    }
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    let answerDesc = await pc.createAnswer();
    await pc.setLocalDescription(answerDesc);

    let answer = {
      type: answerDesc.type,
      sdp: answerDesc.sdp
    };

    socket.emit('rtcAnswer', answer.sdp);
  });

  socket.on('rtcHostCandidate', (candidate, sdpMid, sdpMLineIndex) => {
    let c = {
      candidate: candidate,
      sdpMid: sdpMid,
      sdpMLineIndex: sdpMLineIndex
    }

    pc.addIceCandidate(new RTCIceCandidate(c));
  });

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('rtcAnswerCandidate', e.candidate.candidate, e.candidate.sdpMid, e.candidate.sdpMLineIndex);
    }
  }

  pc.ondatachannel = function (ev) {
    ev.channel.onopen = function (e) {
      global.dataChannel = ev.channel;
    }
    ev.channel.onmessage = (e) => {
      console.log(e.data);
    }
    ev.channel.onclose = function (e) {
      global.dataChannel = null;
    }
};

  return socket;
}

export function ResetConnection() {
  if (global.socket)
    global.socket.disconnect();
  if (global.dataChannel)
    global.dataChannel.close();
  
  ConnectionManager(setScreenPersist);
}