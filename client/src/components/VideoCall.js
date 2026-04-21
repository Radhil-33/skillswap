import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Share2, PenTool } from 'lucide-react';
import Whiteboard from './Whiteboard';

const ICE_SERVERS = {
  iceServers: [
    // STUN servers for NAT traversal
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Free TURN servers for restrictive NAT/firewall
    {
      urls: ['turn:numb.viagenie.ca'],
      username: 'webrtc@example.com',
      credential: 'webrtc',
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

export default function VideoCall({ targetUserId, targetUserName, mode = 'video' }) {
  const { socket } = useSocket();
  const [callState, setCallState] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [callType, setCallType] = useState(mode); // 'video' or 'audio'

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);
  const pendingCandidates = useRef([]);
  const incomingOffer = useRef(null);
  const callTarget = useRef(null);
  const callStateRef = useRef('idle');
  const callTypeRef = useRef(mode);

  // Keep callStateRef in sync
  const updateCallState = useCallback((state) => {
    callStateRef.current = state;
    setCallState(state);
  }, []);

  const cleanup = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((t) => t.stop());
      screenStream.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingCandidates.current = [];
    incomingOffer.current = null;
    callTarget.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
    setShowWhiteboard(false);
    setCallerName('');
    setCallType(mode);
    callTypeRef.current = mode;
    callStateRef.current = 'idle';
    setCallState('idle');
  }, [mode]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && callTarget.current) {
        socket.emit('ice-candidate', {
          targetUserId: callTarget.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Remote track received:', event.track.kind);
      if (remoteVideoRef.current) {
        console.log('Setting remote stream:', event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      } else {
        console.error('remoteVideoRef not available');
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('ICE state:', state);
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        // Automatically cleanup on connection failure
        if (localStream.current) {
          localStream.current.getTracks().forEach((t) => t.stop());
          localStream.current = null;
        }
        if (screenStream.current) {
          screenStream.current.getTracks().forEach((t) => t.stop());
          screenStream.current = null;
        }
        if (peerConnection.current) {
          peerConnection.current.close();
          peerConnection.current = null;
        }
        callStateRef.current = 'idle';
        setCallState('idle');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        updateCallState('connected');
      }
    };

    return pc;
  }, [socket, updateCallState]);

  const startCall = async () => {
    if (!socket || !targetUserId) return;
    try {
      // Check socket is connected before proceeding
      if (!socket.connected) {
        alert('Not connected to server. Please refresh and try again.');
        return;
      }

      callTarget.current = targetUserId;
      callTypeRef.current = mode;
      setCallType(mode);

      const constraints = mode === 'audio'
        ? { video: false, audio: true }
        : { video: true, audio: true };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (mediaErr) {
        console.error('Media access error:', mediaErr);
        if (mediaErr.name === 'NotAllowedError') {
          alert('Please allow access to ' + (mode === 'audio' ? 'microphone' : 'camera & microphone') + ' to start a call');
        } else if (mediaErr.name === 'NotFoundError') {
          alert('No ' + (mode === 'audio' ? 'microphone' : 'camera') + ' found on your device');
        } else {
          alert('Error accessing media devices: ' + mediaErr.message);
        }
        cleanup();
        return;
      }

      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeer();
      peerConnection.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Update state after successfully creating offer
      updateCallState('calling');
      socket.emit('call-user', { targetUserId, offer, callType: mode });
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Failed to start call: ' + err.message);
      cleanup();
    }
  };

  const acceptCall = async () => {
    console.log('Accepting call...');
    const offer = incomingOffer.current;
    if (!offer || !socket) {
      console.error('ERROR: No offer or socket:', { hasOffer: !!offer, hasSocket: !!socket });
      return;
    }
    try {
      // Check socket is connected before proceeding
      if (!socket.connected) {
        console.error('Socket not connected');
        alert('Not connected to server. Please try again.');
        cleanup();
        return;
      }

      const isAudio = callTypeRef.current === 'audio';
      const constraints = isAudio
        ? { video: false, audio: true }
        : { video: true, audio: true };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (mediaErr) {
        console.error('Media access error:', mediaErr);
        if (mediaErr.name === 'NotAllowedError') {
          alert('Please allow access to ' + (isAudio ? 'microphone' : 'camera & microphone') + ' to accept the call');
        } else if (mediaErr.name === 'NotFoundError') {
          alert('No ' + (isAudio ? 'microphone' : 'camera') + ' found on your device');
        } else {
          alert('Error accessing media devices: ' + mediaErr.message);
        }
        rejectCall();
        return;
      }

      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeer();
      peerConnection.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush buffered ICE candidates
      for (const candidate of pendingCandidates.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('Failed to add buffered ICE candidate:', e);
        }
      }
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      updateCallState('connected');
      socket.emit('call-accepted', { callerId: callTarget.current, answer });
    } catch (err) {
      console.error('Failed to accept call:', err);
      alert('Failed to accept call: ' + err.message);
      cleanup();
    }
  };

  const rejectCall = () => {
    if (socket && callTarget.current) {
      socket.emit('call-rejected', { callerId: callTarget.current });
    }
    cleanup();
  };

  const endCall = () => {
    if (socket && callTarget.current) {
      socket.emit('end-call', { targetUserId: callTarget.current });
    }
    cleanup();
  };

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!peerConnection.current) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing, switch back to camera
        if (screenStream.current) {
          screenStream.current.getTracks().forEach((track) => track.stop());
          screenStream.current = null;
        }

        // Get camera stream again
        if (localStream.current) {
          const videoTrack = localStream.current.getVideoTracks()[0];
          if (videoTrack) {
            const sender = peerConnection.current
              .getSenders()
              .find((s) => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStream.current;
            }
          }
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });

        screenStream.current = displayStream;
        const screenTrack = displayStream.getVideoTracks()[0];

        // Replace video track in peer connection
        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        // Show screen in local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        // Handle screen share stop
        screenTrack.onended = async () => {
          if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack && sender) {
              await sender.replaceTrack(videoTrack);
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream.current;
              }
            }
          }
          screenStream.current = null;
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Screen share error:', err);
      if (err.name !== 'NotAllowedError') {
        alert('Screen sharing not available: ' + err.message);
      }
    }
  };

  // Socket listeners — registered once, use refs to avoid stale closures
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ callerId, callerName: name, callType: type, offer }) => {
      if (callStateRef.current !== 'idle') return;
      callTarget.current = callerId;
      incomingOffer.current = offer;
      callTypeRef.current = type || 'video';
      setCallType(type || 'video');
      pendingCandidates.current = [];
      setCallerName(name || '');
      callStateRef.current = 'incoming';
      setCallState('incoming');
    };

    const handleCallAccepted = async ({ answer }) => {
      try {
        console.log('Call accepted - Setting remote description');
        const pc = peerConnection.current;
        if (!pc) {
          console.error('ERROR: Peer connection not available');
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote description set successfully');
        for (const candidate of pendingCandidates.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('Failed to add buffered ICE candidate:', e);
          }
        }
        pendingCandidates.current = [];
        callStateRef.current = 'connected';
        setCallState('connected');
        console.log('Call state set to connected');
      } catch (err) {
        console.error('Error handling call accepted:', err);
      }
    };

    const handleCallRejected = () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((t) => t.stop());
        localStream.current = null;
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((t) => t.stop());
        screenStream.current = null;
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      pendingCandidates.current = [];
      incomingOffer.current = null;
      callTarget.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setIsMuted(false);
      setIsCameraOff(false);
      setIsScreenSharing(false);
      setShowWhiteboard(false);
      setCallerName('');
      setCallType(mode);
      callStateRef.current = 'idle';
      setCallState('idle');
    };

    const handleCallEnded = () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((t) => t.stop());
        localStream.current = null;
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((t) => t.stop());
        screenStream.current = null;
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      pendingCandidates.current = [];
      incomingOffer.current = null;
      callTarget.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setIsMuted(false);
      setIsCameraOff(false);
      setIsScreenSharing(false);
      setShowWhiteboard(false);
      setCallerName('');
      setCallType(mode);
      callStateRef.current = 'idle';
      setCallState('idle');
    };

    const handleCallFailed = ({ reason }) => {
      console.warn('Call failed:', reason);
      if (localStream.current) {
        localStream.current.getTracks().forEach((t) => t.stop());
        localStream.current = null;
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((t) => t.stop());
        screenStream.current = null;
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      pendingCandidates.current = [];
      incomingOffer.current = null;
      callTarget.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setIsMuted(false);
      setIsCameraOff(false);
      setIsScreenSharing(false);
      setShowWhiteboard(false);
      setCallerName('');
      setCallType(mode);
      callStateRef.current = 'idle';
      setCallState('idle');
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        const pc = peerConnection.current;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else if (pc) {
          pendingCandidates.current.push(candidate);
        }
      } catch (err) {
        console.warn('ICE candidate error:', err);
      }
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleCallEnded);
    socket.on('call-failed', handleCallFailed);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleCallEnded);
      socket.off('call-failed', handleCallFailed);
    };
  }, [socket, mode]);

  const isAudioCall = callType === 'audio';

  // Incoming call modal
  if (callState === 'incoming') {
    return (
      <>
        <button className="p-2 text-gray-400 rounded-lg" disabled>
          {mode === 'audio' ? <Phone className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${
              isAudioCall ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {(callerName || targetUserName)?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Incoming {isAudioCall ? 'Audio' : 'Video'} Call
            </h3>
            <p className="text-gray-500 mb-6">{callerName || targetUserName || 'Someone'} is calling you</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={rejectCall}
                className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition"
              >
                <Phone className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Connected / calling - full screen
  if (callState === 'connected' || callState === 'calling') {
    return (
      <>
        <button disabled className="p-2 text-gray-400 rounded-lg" title="In call">
          {mode === 'audio' ? <Phone className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        <div className={`fixed inset-0 z-50 flex flex-col ${isAudioCall ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-black'}`}>
          <div className="flex-1 relative">
            {showWhiteboard && !isAudioCall && socket && callTarget.current ? (
              /* Whiteboard view */
              <Whiteboard socket={socket} userId={callTarget.current} />
            ) : isAudioCall ? (
              /* Audio call UI - avatar centered */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold mx-auto mb-6 ${
                    callState === 'calling' ? 'bg-green-500/30 text-green-300 animate-pulse' : 'bg-green-500/40 text-white'
                  }`}>
                    {(callerName || targetUserName)?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-white text-xl font-semibold">{callerName || targetUserName}</p>
                  <p className="text-gray-400 mt-2">
                    {callState === 'calling' ? 'Calling...' : 'Audio Call Connected'}
                  </p>
                </div>
              </div>
            ) : (
              /* Video call UI */
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {callState === 'calling' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="bg-indigo-600/30 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 animate-pulse">
                        {targetUserName?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="text-lg">Calling {targetUserName}...</p>
                    </div>
                  </div>
                )}

                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute bottom-4 right-4 ${isScreenSharing ? 'w-32 h-24' : 'w-40 h-30'} rounded-xl object-cover border-2 border-white/30`}
                />
                {isScreenSharing && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Screen Sharing
                  </div>
                )}
              </>
            )}
            {/* Hidden audio element for audio calls to play remote stream */}
            {isAudioCall && (
              <audio ref={remoteVideoRef} autoPlay />
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 p-6 flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            {!isAudioCall && (
              <>
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition ${isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                  {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleScreenShare}
                  className={`p-4 rounded-full transition ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                >
                  <Share2 className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setShowWhiteboard(!showWhiteboard)}
                  className={`p-4 rounded-full transition ${showWhiteboard ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                  title={showWhiteboard ? 'Hide whiteboard' : 'Show whiteboard'}
                >
                  <PenTool className="h-6 w-6" />
                </button>
              </>
            )}
            <button
              onClick={endCall}
              className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </>
    );
  }

  // Idle - just the call button
  return (
    <button
      onClick={startCall}
      className={`p-2 hover:bg-green-50 rounded-lg transition ${
        mode === 'audio' ? 'text-blue-600' : 'text-green-600'
      }`}
      title={mode === 'audio' ? 'Audio Call' : 'Video Call'}
    >
      {mode === 'audio' ? <Phone className="h-5 w-5" /> : <Video className="h-5 w-5" />}
    </button>
  );
}
