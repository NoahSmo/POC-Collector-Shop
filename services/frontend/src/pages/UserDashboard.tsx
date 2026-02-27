import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../context/useAuth';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  sender: { name: string };
  text: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  productId: string;
  product: { title: string; image: string; isSold: boolean; sellerId: string };
  buyer: { name: string; id: string };
  seller: { name: string; id: string };
  messages: Message[];
}

export default function UserDashboard() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales' | 'archived'>('purchases');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/api/chats/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(res.data);
    } catch (err) {
      console.error("Error fetching chat rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`${API_URL}/api/chats/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      const socket = io(API_URL, {
        transports: ['websocket']
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('new_message', (message: Message) => {
        console.log('Incoming socket message:', message);
        console.log('Current room (state):', selectedRoomId);
        console.log('Current room (ref):', selectedRoomIdRef.current);

        // Use the ref to check against the incoming message's room ID
        // (We might need to add chatRoomId to the Message interface)
        if (selectedRoomIdRef.current && message.chatRoomId === selectedRoomIdRef.current) {
          console.log('Adding message to state...');
          setMessages(prev => {
            if (prev.find(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        } else {
          console.log('Message not for current room, ignoring update to message list.');
        }
        // Always refresh rooms to update preview
        fetchRooms();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, API_URL]);

  useEffect(() => {
    if (selectedRoomId && socketRef.current) {
      socketRef.current.emit('join_room', selectedRoomId);
    }
  }, [selectedRoomId]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-20 text-vintage-gold border border-vintage-gold/20 bg-vintage-gold/5 rounded">
        <h2>{t('login_required')}</h2>
      </div>
    );
  }

  const handleBuyNowFromChat = async () => {
    if (!selectedRoom) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/api/stripe/create-checkout-session`, 
        { productId: selectedRoom.productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error("Error creating checkout session from chat:", err);
      const msg = err.response?.data?.error || t('checkout_error') || "Error initiating checkout.";
      // We assume a toast system is available or we just alert for now since we don't have hook in this component
      alert(msg);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_URL}/api/chats/rooms/${selectedRoomId}/messages`, 
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchRooms(); // Refresh rooms to update last message
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    if (activeTab === 'archived') {
      return room.product.isSold === true;
    }
    // Must not be sold for purchases/sales
    if (room.product.isSold === true) return false;
    
    if (activeTab === 'purchases') {
      return room.buyer.id === user?.id;
    }
    if (activeTab === 'sales') {
      return room.seller.id === user?.id;
    }
    return false;
  });

  // Ensure selected room is valid within the active tab
  useEffect(() => {
    if (filteredRooms.length > 0) {
      if (!selectedRoomId || !filteredRooms.find(r => r.id === selectedRoomId)) {
        setSelectedRoomId(filteredRooms[0].id);
      }
    } else {
      setSelectedRoomId(null);
    }
  }, [activeTab, chatRooms]);

  const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[700px] animate-fade-in">
      
      {/* Sidebar: Chat List */}
      <div className="xl:col-span-1 border border-vintage-gold-muted/30 rounded-lg flex flex-col bg-black/40 overflow-hidden shadow-inner">
        <div className="p-4 border-b border-vintage-gold-muted/20 bg-black/60">
          <h2 className="text-lg font-cinzel text-vintage-gold flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            {t('conversations').toUpperCase()}
          </h2>
          
          <div className="flex gap-2 text-[10px] sm:text-xs font-cinzel tracking-wider">
            <button 
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 py-1.5 border-b-2 transition-all ${activeTab === 'purchases' ? 'text-vintage-gold border-vintage-gold shadow-[0_2px_10px_-2px_rgba(194,155,98,0.5)]' : 'text-vintage-gold-muted border-transparent hover:text-vintage-gold/80 hover:border-vintage-gold/50'}`}
            >
              {t('purchases')}
            </button>
            <button 
              onClick={() => setActiveTab('sales')}
              className={`flex-1 py-1.5 border-b-2 transition-all ${activeTab === 'sales' ? 'text-vintage-gold border-vintage-gold shadow-[0_2px_10px_-2px_rgba(194,155,98,0.5)]' : 'text-vintage-gold-muted border-transparent hover:text-vintage-gold/80 hover:border-vintage-gold/50'}`}
            >
              {t('sales')}
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-1.5 border-b-2 transition-all ${activeTab === 'archived' ? 'text-vintage-gold border-vintage-gold shadow-[0_2px_10px_-2px_rgba(194,155,98,0.5)]' : 'text-vintage-gold-muted border-transparent hover:text-vintage-gold/80 hover:border-vintage-gold/50'}`}
            >
              {t('archived')}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="p-4 text-center text-vintage-gold-muted font-lora text-sm">{t('loading_chats')}</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-vintage-gold-muted font-lora text-sm">
              {activeTab === 'purchases' ? t('no_purchases') : activeTab === 'sales' ? t('no_sales') : t('no_archived')}
            </div>
          ) : filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`w-full text-left p-4 border-b border-vintage-gold-muted/10 hover:bg-white/5 transition-colors flex gap-3 ${selectedRoomId === room.id ? 'bg-vintage-gold/10' : ''}`}
            >
              <img src={room.product.image} alt={room.product.title} className="w-12 h-12 object-cover rounded border border-vintage-gold/20" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-cinzel text-vintage-gold truncate">{room.product.title}</p>
                <p className="text-xs font-lora text-vintage-gold-muted/70 truncate">
                  {user?.name === room.buyer.name ? t('seller_label', { name: room.seller.name }) : t('buyer_label', { name: room.buyer.name })}
                </p>
                {room.messages[0] && (
                  <p className="text-[10px] font-lora text-vintage-gold-muted/50 mt-1 truncate italic">"{room.messages[0].text}"</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className="xl:col-span-3 border border-vintage-gold-muted/30 rounded-lg bg-black/40 flex flex-col overflow-hidden shadow-inner">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-vintage-gold-muted/20 bg-black/60 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                <h2 className="text-lg font-cinzel text-vintage-gold uppercase tracking-wider">
                  {selectedRoom.product.title}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-lora text-vintage-gold-muted/50">
                  {user.id === selectedRoom.buyer.id ? t('seller_label', { name: selectedRoom.seller.name }) : t('buyer_label', { name: selectedRoom.buyer.name })}
                </span>
                
                {user.id === selectedRoom.buyer.id && !selectedRoom.product.isSold && (
                  <button 
                    onClick={handleBuyNowFromChat}
                    className="bg-vintage-gold text-black text-[10px] font-cinzel font-bold px-4 py-1.5 hover:bg-white transition-all shadow-[0_0_15px_rgba(194,155,98,0.2)] hover:shadow-[0_0_20px_rgba(194,155,98,0.4)] hover-scale"
                  >
                    {t('buy_now')}
                  </button>
                )}

                {selectedRoom.product.isSold && (
                  <span className="text-[10px] font-cinzel font-bold text-red-400 border border-red-400/30 px-3 py-1 bg-red-400/5">
                    {t('sold_out')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 font-lora">
              {loadingMessages ? (
                <div className="text-center text-vintage-gold-muted text-sm py-10">{t('fetching_history')}</div>
              ) : messages.map((msg) => {
                  const isMe = msg.sender.name === user.name;
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${!isMe ? 'items-start' : 'items-end'}`}>
                      <span className={`text-[10px] ${!isMe ? 'text-vintage-gold-muted/60 ml-1' : 'text-vintage-gold/60 mr-1'}`}>
                        {isMe ? t('you') : msg.sender.name}
                      </span>
                      <div className={`px-5 py-3 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                        !isMe 
                          ? 'bg-white/5 border border-vintage-gold-muted/20 rounded-tl-sm text-vintage-gold-muted' 
                          : 'bg-vintage-gold/10 border border-vintage-gold/30 text-white rounded-tr-sm shadow-[0_0_15px_rgba(194,155,98,0.05)]'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-vintage-gold-muted/30 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-vintage-gold-muted/20 bg-black/60 flex gap-3 items-center">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('type_message')} 
                className="flex-1 bg-transparent border border-vintage-gold-muted/40 rounded-full px-6 py-2.5 text-sm font-lora focus:outline-none focus:border-vintage-gold focus:ring-1 focus:ring-vintage-gold transition-colors text-white placeholder-vintage-gold-muted/50"
              />
              <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 rounded-full border border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-black flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-vintage-gold-muted font-lora space-y-4 opacity-50">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p>{t('select_chat_to_start') || 'Select a conversation to begin'}</p>
          </div>
        )}
      </div>

    </div>
  );
}

