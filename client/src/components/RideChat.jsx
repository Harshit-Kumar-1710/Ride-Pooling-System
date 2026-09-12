import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://ride-pooling-system.onrender.com';

const RideChat = ({ rideId, isDriver = false, passengers = [] }) => {
  const { user } = useAuth();
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [unread, setUnread]           = useState(0);
  const [toast, setToast]             = useState(null);
  const [chatMode, setChatMode]       = useState('broadcast'); // 'broadcast' | 'private'
  const [targetPassenger, setTargetPassenger] = useState('');
  const socketRef   = useRef(null);
  const bottomRef   = useRef(null);
  const toastTimeout = useRef(null);

  const myId = user?.id || user?._id;

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('chat:join', { rideId, userId: myId, userName: user?.name });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
      const isFromMe = msg.senderId === myId;
      if (!isFromMe) {
        if (!open) setUnread(prev => prev + 1);
        // Trigger floating toast notification
        setToast({
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          text: msg.text
        });
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(null), 4000);
      }
    });

    socket.on('chat:history', (history) => {
      setMessages(history);
    });

    return () => {
      socket.disconnect();
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [rideId, myId, user?.name, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    if (!input.trim() || !socketRef.current) return;
    const selectedPassengerObj = passengers.find(p => p._id === targetPassenger || p.id === targetPassenger);
    socketRef.current.emit('chat:send', {
      rideId,
      senderId: myId,
      senderName: user?.name || 'User',
      senderRole: isDriver ? 'driver' : 'passenger',
      targetPassengerId: chatMode === 'private' ? targetPassenger : null,
      targetPassengerName: chatMode === 'private' ? selectedPassengerObj?.name : null,
      text: input.trim()
    });
    setInput('');
  };

  const toggle = () => {
    setOpen(!open);
    if (!open) {
      setUnread(0);
      setToast(null);
    }
  };

  return (
    <>
      {/* Floating Toast Notification when chat is closed */}
      {!open && toast && (
        <div style={styles.toast} onClick={toggle}>
          <div style={styles.toastHeader}>
            <span style={styles.toastDot} />
            <strong>{toast.senderName}</strong>
            <span style={styles.toastRole}>({toast.senderRole === 'driver' ? '🚗 Driver' : '👤 Passenger'})</span>
          </div>
          <p style={styles.toastText}>{toast.text}</p>
        </div>
      )}

      {/* Floating Chat FAB */}
      <button onClick={toggle} style={styles.fab}>
        💬
        {unread > 0 && <span style={styles.badge}>{unread}</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <span style={styles.headerTitle}>💬 Ride Chat</span>
              <span style={styles.headerSub}>{isDriver ? 'Driver View' : 'Passenger View'}</span>
            </div>
            <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Driver Mode Selector: Broadcast vs Private DM */}
          {isDriver && (
            <div style={styles.modeBar}>
              <button
                style={{ ...styles.modeTab, ...(chatMode === 'broadcast' ? styles.modeTabActive : {}) }}
                onClick={() => setChatMode('broadcast')}
              >
                📢 Broadcast
              </button>
              <button
                style={{ ...styles.modeTab, ...(chatMode === 'private' ? styles.modeTabActive : {}) }}
                onClick={() => setChatMode('private')}
              >
                🔒 Private DM
              </button>
            </div>
          )}

          {isDriver && chatMode === 'private' && (
            <div style={styles.passengerSelectWrap}>
              <select
                style={styles.passengerSelect}
                value={targetPassenger}
                onChange={e => setTargetPassenger(e.target.value)}
              >
                <option value="">-- Select Passenger for Private DM --</option>
                {passengers.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    👤 {p.name} ({p.collegeId || 'Passenger'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.messages}>
            {messages.length === 0 && (
              <p style={styles.empty}>No messages yet. Start the conversation!</p>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === myId;

              // Filter out private DMs not meant for current user unless user is driver or target passenger
              if (msg.targetPassengerId && !isMe && msg.targetPassengerId !== myId && !isDriver) {
                return null;
              }

              return (
                <div key={i} style={{ ...styles.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...styles.msgBubble, ...(isMe ? styles.myMsg : styles.theirMsg) }}>
                    {/* WhatsApp-Style Sender Header for Incoming Messages */}
                    {!isMe && (
                      <div style={styles.senderHeader}>
                        <span style={styles.senderName}>{msg.senderName}</span>
                        <span style={{
                          ...styles.roleTag,
                          background: msg.senderRole === 'driver' ? 'rgba(230, 57, 70, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: msg.senderRole === 'driver' ? '#e63946' : '#22c55e'
                        }}>
                          {msg.senderRole === 'driver' ? '🚗 Driver' : '👤 Passenger'}
                        </span>
                      </div>
                    )}

                    {/* Private DM indicator tag */}
                    {msg.targetPassengerId && (
                      <span style={styles.privateTag}>
                        🔒 Private DM {msg.targetPassengerName ? `to ${msg.targetPassengerName}` : ''}
                      </span>
                    )}

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
              placeholder={chatMode === 'private' && !targetPassenger ? 'Select a passenger above first...' : 'Type a message...'}
              value={input}
              disabled={chatMode === 'private' && !targetPassenger}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button style={styles.sendBtn} onClick={send} disabled={!input.trim() || (chatMode === 'private' && !targetPassenger)}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  toast: {
    position: 'fixed',
    bottom: '6rem',
    right: '2rem',
    background: '#1a1a2e',
    border: '1px solid #e63946',
    borderRadius: '12px',
    padding: '0.8rem 1.1rem',
    maxWidth: '300px',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 1002,
    boxShadow: '0 10px 30px rgba(230, 57, 70, 0.3)',
    animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  toastHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', marginBottom: '0.2rem' },
  toastDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#e63946' },
  toastRole: { color: '#9999bb', fontSize: '0.75rem' },
  toastText: { fontSize: '0.85rem', color: '#f0f0ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
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
    width: '360px',
    height: '480px',
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
    padding: '0.8rem 1rem',
    background: '#1a1a2e',
    borderBottom: '1px solid #1e1e30',
  },
  headerTitle: { fontWeight: '700', fontSize: '0.9rem', color: '#f0f0ff' },
  headerSub: { display: 'block', fontSize: '0.72rem', color: '#9999bb' },
  closeBtn: { background: 'transparent', border: 'none', color: '#55556a', fontSize: '1rem', cursor: 'pointer' },
  modeBar: { display: 'flex', background: '#1a1a2e', padding: '4px', gap: '4px', borderBottom: '1px solid #1e1e30' },
  modeTab: { flex: 1, padding: '0.4rem', background: 'transparent', border: 'none', color: '#9999bb', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' },
  modeTabActive: { background: 'rgba(230, 57, 70, 0.2)', color: '#e63946' },
  passengerSelectWrap: { padding: '0.5rem 0.8rem', background: '#12121c', borderBottom: '1px solid #1e1e30' },
  passengerSelect: { width: '100%', padding: '0.45rem', background: '#1a1a2e', border: '1px solid #1e1e30', borderRadius: '6px', color: '#f0f0ff', fontSize: '0.8rem', outline: 'none' },
  messages: { flex: 1, overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  empty: { color: '#55556a', textAlign: 'center', fontSize: '0.82rem', marginTop: '3rem' },
  msgRow: { display: 'flex' },
  msgBubble: { maxWidth: '80%', padding: '0.55rem 0.8rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '3px' },
  myMsg: { background: 'linear-gradient(135deg, #e63946, #c22836)', borderBottomRightRadius: '2px' },
  theirMsg: { background: '#1a1a2e', border: '1px solid #1e1e30', borderBottomLeftRadius: '2px' },
  senderHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' },
  senderName: { fontSize: '0.75rem', fontWeight: '700', color: '#f0f0ff' },
  roleTag: { fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' },
  privateTag: { fontSize: '0.68rem', fontWeight: '700', color: '#f59e0b', marginBottom: '2px' },
  msgText: { fontSize: '0.85rem', color: '#f0f0ff', lineHeight: '1.4', wordBreak: 'break-word' },
  msgTime: { fontSize: '0.62rem', color: 'rgba(240,240,255,0.5)', alignSelf: 'flex-end' },
  inputRow: { display: 'flex', gap: '0.5rem', padding: '0.8rem', borderTop: '1px solid #1e1e30', background: '#1a1a2e' },
  input: { flex: 1, padding: '0.55rem 0.8rem', background: '#12121c', border: '1px solid #1e1e30', borderRadius: '8px', color: '#f0f0ff', fontSize: '0.85rem', outline: 'none' },
  sendBtn: { width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #e63946, #c22836)', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default RideChat;
