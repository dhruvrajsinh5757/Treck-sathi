import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';

const API_BASE = '/api';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Messages() {
  const { user } = useAuth();
  const query = useQuery();
  const preselectUserId = query.get('user');

  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const [active, setActive] = useState(null); // { conversationId, otherUser }
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [text, setText] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    const s = io('/', { transports: ['websocket'] });
    socketRef.current = s;

    s.on('connect', () => {
      s.emit('presence:online', { userId: user?._id });
    });

    s.on('presence:list', ({ onlineUserIds: list }) => {
      setOnlineUserIds(new Set(list || []));
    });

    s.on('chat:message', (msg) => {
      if (!msg?.conversationId) return;
      setMessages((prev) => {
        if (active?.conversationId !== msg.conversationId) return prev;
        return [...prev, msg];
      });
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.conversationId === msg.conversationId);
        const next = [...prev];
        if (idx >= 0) {
          const updated = { ...next[idx], lastMessage: msg.message, lastTimestamp: msg.timestamp };
          next.splice(idx, 1);
          return [updated, ...next];
        }
        return prev;
      });
    });

    return () => {
      s.disconnect();
    };
  }, [user?._id, active?.conversationId]);

  useEffect(() => {
    async function loadList() {
      try {
        setLoadingList(true);
        const [convRes, followRes] = await Promise.all([
          axios.get(`${API_BASE}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios
            .get(`${API_BASE}/users/following`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { success: false, following: [] } })),
        ]);

        if (convRes.data?.success) setConversations(convRes.data.conversations || []);
        if (followRes.data?.success) setFollowing(followRes.data.following || []);
      } finally {
        setLoadingList(false);
      }
    }
    loadList();
  }, [token]);

  // Preselect chat from ?user= (from Message button on profile)
  useEffect(() => {
    if (!preselectUserId) return;

    const existing = conversations.find((c) => String(c.otherUser?._id) === String(preselectUserId));
    if (existing) {
      setActive(existing);
      return;
    }

    // If no conversation yet with that user, fetch their basic profile and open chat
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/users/${preselectUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success && data.user) {
          setActive({ conversationId: null, otherUser: data.user });
        }
      } catch {
        // ignore
      }
    })();
  }, [preselectUserId, conversations, token]);

  useEffect(() => {
    async function loadChat() {
      if (!active?.otherUser?._id) return;
      try {
        setLoadingChat(true);
        const { data } = await axios.get(`${API_BASE}/messages/${active.otherUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success) {
          setMessages(data.messages || []);
        }
      } finally {
        setLoadingChat(false);
      }
    }
    loadChat();
  }, [active?.otherUser?._id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, active?.conversationId]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || !active?.otherUser?._id) return;
    setText('');

    // Realtime path
    socketRef.current?.emit('chat:send', {
      senderId: user?._id,
      receiverId: active.otherUser._id,
      message: msg,
    });

    // Persist via REST as fallback (keeps DB consistent if socket missed)
    try {
      await axios.post(
        `${API_BASE}/messages/${active.otherUser._id}`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh conversations so the new chat appears in list
      const { data } = await axios.get(`${API_BASE}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) setConversations(data.conversations || []);
    } catch {
      // ignore
    }
  };

  const activeOnline = active?.otherUser?._id ? onlineUserIds.has(String(active.otherUser._id)) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex gap-4 md:gap-6">
        <Sidebar />

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 md:gap-6">
          {/* Left: conversations */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100 tracking-wide">Messages</h2>
              <span className="text-[11px] text-slate-400">{conversations.length} chats</span>
            </div>

            {loadingList ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const other = c.otherUser;
                  const avatar =
                    other?.profilePhoto ||
                    `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(other?.name || 'User')}`;
                  const isActive = active?.conversationId === c.conversationId;
                  const isOnline = other?._id ? onlineUserIds.has(String(other._id)) : false;

                  return (
                    <button
                      key={c.conversationId}
                      type="button"
                      onClick={() => setActive(c)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition ${
                        isActive
                          ? 'bg-slate-800/80 border-emerald-400/40'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="relative">
                        <img src={avatar} alt={other?.name} className="w-11 h-11 rounded-full object-cover" />
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-50 truncate">{other?.name || 'User'}</p>
                          <p className="text-[10px] text-slate-400">
                            {c.lastTimestamp ? new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{c.lastMessage || '...'}</p>
                      </div>
                    </button>
                  );
                })}

                {conversations.length === 0 && (
                  <div className="text-slate-400 text-sm">
                    <p className="text-center py-4">No conversations yet.</p>
                    {following.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] text-slate-500 mb-1">People you follow</p>
                        {following.map((f) => {
                          const avatar =
                            f.profilePhoto ||
                            `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(
                              f.name || 'User'
                            )}`;
                          const isOnline = onlineUserIds.has(String(f._id));
                          return (
                            <button
                              key={f._id}
                              type="button"
                              onClick={() =>
                                setActive({
                                  conversationId: null,
                                  otherUser: f,
                                })
                              }
                              className="w-full text-left flex items-center gap-3 p-2 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition"
                            >
                              <div className="relative">
                                <img src={avatar} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                                {isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-50 truncate">{f.name}</p>
                                {f.location && (
                                  <p className="text-[10px] text-slate-500 truncate">{f.location}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Right: chat */}
          <section className="bg-slate-900/70 border border-slate-700/60 rounded-3xl shadow-[0_18px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col overflow-hidden min-h-[520px]">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-6">
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                {/* Top bar */}
                <div className="px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        active.otherUser?.profilePhoto ||
                        `https://ui-avatars.com/api/?background=16a34a&color=fff&name=${encodeURIComponent(active.otherUser?.name || 'User')}`
                      }
                      alt={active.otherUser?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-50 truncate">{active.otherUser?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-400">
                        {activeOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                  {loadingChat ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      {messages.map((m) => {
                        const mine = String(m.senderId) === String(user?._id);
                        return (
                          <div key={m._id || `${m.timestamp}-${m.message}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
                                mine
                                  ? 'bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950'
                                  : 'bg-slate-800/70 border border-slate-700/60 text-slate-100'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{m.message}</p>
                              <div className={`mt-1 text-[10px] ${mine ? 'text-slate-900/70' : 'text-slate-400'}`}>
                                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                {mine && m.readStatus ? ` • ${m.readStatus}` : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-700/60 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') send();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                  <button
                    type="button"
                    onClick={send}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 font-semibold hover:from-emerald-300 hover:to-sky-300 transition"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

