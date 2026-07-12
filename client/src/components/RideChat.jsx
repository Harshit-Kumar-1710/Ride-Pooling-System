import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const RideChat = ({ rideId }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('chat:join', { rideId, userName: user?.name });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!open) setUnread(prev => prev + 1);
    });

    socket.on('chat:history', (history) => {
      setMessages(history);
    });

    return () => socket.disconnect();
  }, [rideId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:send', {
      rideId,
      senderId: user?.id || user?._id,
      senderName: user?.name,
      text: input.trim()
    });
    setInput('');
  };

  const toggle = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={toggle} style={styles.fab}>
        💬
        {unread > 0 && <span style={styles.badge}>{unread}</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>💬 Ride Chat</span>
            <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div style={styles.messages}>
            {messages.length === 0 && (
              <p style={styles.empty}>No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === (user?.id || user?._id);
              return (
                <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...styles.msgBubble, ...(isMe ? styles.myMsg : styles.theirMsg) }}>
                    {!isMe && <span style={styles.senderName}>{msg.senderName}</span>}
                    <span style={styles.msgText}>{msg.text}</span>
                    <span style={styles.msgTime}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button style={styles.sendBtn} onClick={send} disabled={!input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e63946, #c22836)',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(230, 57, 70, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#22c55e',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    position: 'fixed',
    bottom: '6rem',
    right: '2rem',
    width: '340px',
    height: '440px',
    background: '#12121c',
    border: '1px solid #1e1e30',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
    animation: 'fadeInUp 0.3s ease',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1rem',
    background: '#1a1a2e',
    borderBottom: '1px solid #1e1e30',
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: '#f0f0ff',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#55556a',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  empty: {
    color: '#55556a',
    textAlign: 'center',
    fontSize: '0.82rem',
    marginTop: '3rem',
  },
  msgRow: {
    display: 'flex',
  },
  msgBubble: {
    maxWidth: '75%',
    padding: '0.5rem 0.75rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  myMsg: {
    background: 'linear-gradient(135deg, #e63946, #c22836)',
    borderBottomRightRadius: '4px',
  },
  theirMsg: {
    background: '#1a1a2e',
    border: '1px solid #1e1e30',
    borderBottomLeftRadius: '4px',
  },
  senderName: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#e63946',
    marginBottom: '1px',
  },
  msgText: {
    fontSize: '0.83rem',
    color: '#f0f0ff',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  msgTime: {
    fontSize: '0.62rem',
    color: 'rgba(240,240,255,0.4)',
    alignSelf: 'flex-end',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.8rem',
    borderTop: '1px solid #1e1e30',
    background: '#1a1a2e',
  },
  input: {
    flex: 1,
    padding: '0.55rem 0.8rem',
    background: '#12121c',
    border: '1px solid #1e1e30',
    borderRadius: '8px',
    color: '#f0f0ff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #e63946, #c22836)',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default RideChat;
