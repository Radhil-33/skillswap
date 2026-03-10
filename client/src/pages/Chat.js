import { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Send, MessageCircle } from 'lucide-react';
import VideoCall from '../components/VideoCall';
import Avatar from '../components/Avatar';

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversation
            ? { ...c, lastMessage: { text: message.text, sender: message.sender._id, createdAt: message.createdAt } }
            : c
        )
      );
    });

    socket.on('user-typing', ({ conversationId }) => {
      if (conversationId === activeConvo?._id) {
        setTyping(true);
      }
    });

    socket.on('user-stop-typing', ({ conversationId }) => {
      if (conversationId === activeConvo?._id) {
        setTyping(false);
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [socket, activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (convo) => {
    if (activeConvo?._id) {
      socket?.emit('leave-conversation', activeConvo._id);
    }
    setActiveConvo(convo);
    socket?.emit('join-conversation', convo._id);

    try {
      const { data } = await getMessages(convo._id);
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo || !socket) return;

    socket.emit('send-message', {
      conversationId: activeConvo._id,
      text: newMessage.trim(),
    });
    socket.emit('stop-typing', activeConvo._id);
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConvo) return;

    socket.emit('typing', activeConvo._id);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', activeConvo._id);
    }, 1000);
  };

  const getOtherParticipant = (convo) => {
    return convo.participants?.find((p) => p._id !== user?._id);
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No conversations yet. Accept a swap request to start chatting!
                </div>
              ) : (
                conversations.map((convo) => {
                  const other = getOtherParticipant(convo);
                  const isOnline = onlineUsers.has(other?._id);
                  return (
                    <button
                      key={convo._id}
                      onClick={() => selectConversation(convo)}
                      className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${
                        activeConvo?._id === convo._id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar src={other?.avatar} name={other?.name} size="sm" />
                          {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{other?.name}</p>
                          {convo.lastMessage?.text && (
                            <p className="text-xs text-gray-500 truncate">{convo.lastMessage.text}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeConvo ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar src={getOtherParticipant(activeConvo)?.avatar} name={getOtherParticipant(activeConvo)?.name} size="sm" />
                    <div>
                      <p className="font-semibold text-gray-900">{getOtherParticipant(activeConvo)?.name}</p>
                      {typing && <p className="text-xs text-indigo-500">typing...</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <VideoCall
                      targetUserId={getOtherParticipant(activeConvo)?._id}
                      targetUserName={getOtherParticipant(activeConvo)?.name}
                      mode="audio"
                    />
                    <VideoCall
                      targetUserId={getOtherParticipant(activeConvo)?._id}
                      targetUserName={getOtherParticipant(activeConvo)?.name}
                      mode="video"
                    />
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Type a message..."
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
