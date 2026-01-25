// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import type React as ReactType from 'react';
import { Send, MessageCircle, User, Clock, Check, CheckCheck } from 'lucide-react';
import { Language, Message, Conversation, Specialist } from '../types';
import axios from 'axios';
import { MESSAGES_API } from '../api.config';

interface MessengerProps {
  lang: Language;
  currentUser: any;
}

export const Messenger: React.FC<MessengerProps> = ({ lang, currentUser }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [showSpecialists, setShowSpecialists] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => ({
    'messenger': lang === 'bn' ? 'মেসেঞ্জার' : 'Messenger',
    'conversations': lang === 'bn' ? 'কথোপকথন' : 'Conversations',
    'specialists': lang === 'bn' ? 'বিশেষজ্ঞগণ' : 'Specialists',
    'startConversation': lang === 'bn' ? 'কথোপকথন শুরু করুন' : 'Start Conversation',
    'typeMessage': lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...',
    'send': lang === 'bn' ? 'পাঠান' : 'Send',
    'noConversations': lang === 'bn' ? 'কোন কথোপকথন নেই' : 'No conversations yet',
    'selectConversation': lang === 'bn' ? 'একটি কথোপকথন নির্বাচন করুন' : 'Select a conversation',
    'loading': lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...',
    'farmer': lang === 'bn' ? 'কৃষক' : 'Farmer',
    'specialist': lang === 'bn' ? 'বিশেষজ্ঞ' : 'Specialist'
  }[key] || key);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = async () => {
    if (currentUser?.role === 'specialist') {
      // Demo conversations for specialist from multiple farmers
      const demoConversations: Conversation[] = [
        {
          conversationId: 'demo_conv_1',
          lastMessage: {
            _id: 'msg1_3',
            sender: {
              _id: 'farmer1',
              name: 'Rahim Khan',
              email: 'rahim@example.com',
              role: 'farmer'
            },
            receiver: {
              _id: currentUser.id || '',
              name: currentUser.name || '',
              email: currentUser.email || '',
              role: currentUser.role || ''
            },
            content: 'The brown spots are getting worse. Please advise urgently!',
            timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            read: false,
            conversationId: 'demo_conv_1'
          },
          messageCount: 5,
          unreadCount: 1,
          otherUser: {
            _id: 'farmer1',
            name: 'Rahim Khan',
            email: 'rahim@example.com',
            role: 'farmer'
          }
        },
        {
          conversationId: 'demo_conv_2',
          lastMessage: {
            _id: 'msg2_5',
            sender: {
              _id: 'farmer2',
              name: 'Kamal Hossain',
              email: 'kamal@example.com',
              role: 'farmer'
            },
            receiver: {
              _id: currentUser.id || '',
              name: currentUser.name || '',
              email: currentUser.email || '',
              role: currentUser.role || ''
            },
            content: 'Thank you for the advice! Will apply the fungicide today.',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            read: true,
            conversationId: 'demo_conv_2'
          },
          messageCount: 5,
          unreadCount: 0,
          otherUser: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          }
        },
        {
          conversationId: 'demo_conv_3',
          lastMessage: {
            _id: 'msg3_1',
            sender: {
              _id: 'farmer3',
              name: 'Fatima Begum',
              email: 'fatima@example.com',
              role: 'farmer'
            },
            receiver: {
              _id: currentUser.id || '',
              name: currentUser.name || '',
              email: currentUser.email || '',
              role: currentUser.role || ''
            },
            content: 'Hello! My tomato plants have white powder on leaves. What disease is this?',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            read: false,
            conversationId: 'demo_conv_3'
          },
          messageCount: 1,
          unreadCount: 1,
          otherUser: {
            _id: 'farmer3',
            name: 'Fatima Begum',
            email: 'fatima@example.com',
            role: 'farmer'
          }
        },
        {
          conversationId: 'demo_conv_4',
          lastMessage: {
            _id: 'msg4_2',
            sender: {
              _id: 'farmer4',
              name: 'Hasan Ali',
              email: 'hasan@example.com',
              role: 'farmer'
            },
            receiver: {
              _id: currentUser.id || '',
              name: currentUser.name || '',
              email: currentUser.email || '',
              role: currentUser.role || ''
            },
            content: 'How many days before I can harvest after applying the pesticide?',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            read: false,
            conversationId: 'demo_conv_4'
          },
          messageCount: 3,
          unreadCount: 1,
          otherUser: {
            _id: 'farmer4',
            name: 'Hasan Ali',
            email: 'hasan@example.com',
            role: 'farmer'
          }
        }
      ];
      setConversations(demoConversations);
    } else {
      try {
        const response = await axios.get(`${MESSAGES_API}/conversations/${currentUser.id}`);
        setConversations(response.data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  };

  // Load specialists
  const loadSpecialists = async () => {
    try {
      const response = await axios.get(`${MESSAGES_API}/specialists/all`);
      setSpecialists(response.data);
    } catch (error) {
      console.error('Error loading specialists:', error);
      // Fallback: Load demo specialists
      const demoSpecialists = [
        {
          _id: 'specialist_1',
          name: 'Jubayer Rahman Chowdhury',
          email: 'jubayer@bari.org.bd',
          role: 'specialist',
          institution: 'Bangladesh Agricultural Research Institute',
          department: 'Plant Pathology',
          expertise: ['Rice Diseases', 'Fungal Infections', 'Disease Management']
        },
        {
          _id: 'specialist_2',
          name: 'Anidro Paul',
          email: 'anidro@sau.ac.bd',
          role: 'specialist',
          institution: 'Sylhet Agricultural University',
          department: 'Crop Science',
          expertise: ['Crop Management', 'Pest Control', 'Soil Science']
        }
      ];
      setSpecialists(demoSpecialists);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    if (currentUser?.role === 'specialist' && conversationId.startsWith('demo_conv_')) {
      // Demo messages for specialist
      const demoMessages: any[] = conversationId === 'demo_conv_1' ? [
        {
          _id: 'msg1_1',
          sender: {
            _id: 'farmer1',
            name: 'Rahim Khan',
            email: 'rahim@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'Hello specialist, I have a problem with my rice crop. The leaves are turning yellow.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          conversationId: 'demo_conv_1'
        },
        {
          _id: 'msg1_2',
          sender: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          receiver: {
            _id: 'farmer1',
            name: 'Rahim Khan',
            email: 'rahim@example.com',
            role: 'farmer'
          },
          content: 'Hello Rahim, can you send me a photo of the affected plants?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          conversationId: 'demo_conv_1'
        },
        {
          _id: 'msg1_3',
          sender: {
            _id: 'farmer1',
            name: 'Rahim Khan',
            email: 'rahim@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'The brown spots are getting worse. Please advise urgently!',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: false,
          conversationId: 'demo_conv_1'
        }
      ] : conversationId === 'demo_conv_2' ? [
        {
          _id: 'msg2_1',
          sender: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'My wheat plants are showing yellow spots. What should I do?',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          read: true,
          conversationId: 'demo_conv_2'
        },
        {
          _id: 'msg2_2',
          sender: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          receiver: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          },
          content: 'Yellow spots could be due to fungal infection. Please check for moisture levels.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          read: true,
          conversationId: 'demo_conv_2'
        },
        {
          _id: 'msg2_3',
          sender: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'The soil is quite dry. Should I water more?',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          conversationId: 'demo_conv_2'
        },
        {
          _id: 'msg2_4',
          sender: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          receiver: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          },
          content: 'Yes, increase watering but avoid overwatering. Also, apply fungicide if needed.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          conversationId: 'demo_conv_2'
        },
        {
          _id: 'msg2_5',
          sender: {
            _id: 'farmer2',
            name: 'Kamal Hossain',
            email: 'kamal@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'Thank you for the advice!',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: true,
          conversationId: 'demo_conv_2'
        }
      ] : conversationId === 'demo_conv_3' ? [
        {
          _id: 'msg3_1',
          sender: {
            _id: 'farmer3',
            name: 'Fatima Begum',
            email: 'fatima@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'Hello! My tomato plants have white powder on leaves. What disease is this?',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false,
          conversationId: 'demo_conv_3'
        }
      ] : conversationId === 'demo_conv_4' ? [
        {
          _id: 'msg4_1',
          sender: {
            _id: 'farmer4',
            name: 'Hasan Ali',
            email: 'hasan@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'Hello specialist, I have a question about pest management in my potato field.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          read: true,
          conversationId: 'demo_conv_4'
        },
        {
          _id: 'msg4_2',
          sender: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          receiver: {
            _id: 'farmer4',
            name: 'Hasan Ali',
            email: 'hasan@example.com',
            role: 'farmer'
          },
          content: 'Hi Hasan! I would be happy to help. What specific issue are you facing?',
          timestamp: new Date(Date.now() - 9000000).toISOString(),
          read: true,
          conversationId: 'demo_conv_4'
        },
        {
          _id: 'msg4_3',
          sender: {
            _id: 'farmer4',
            name: 'Hasan Ali',
            email: 'hasan@example.com',
            role: 'farmer'
          },
          receiver: {
            _id: currentUser.id,
            name: currentUser.name || 'Specialist',
            email: currentUser.email || '',
            role: 'specialist'
          },
          content: 'How many days before I can harvest after applying the pesticide?',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          conversationId: 'demo_conv_4'
        }
      ] : [];
      setMessages(demoMessages);
    } else {
      try {
        const response = await axios.get(`${MESSAGES_API}/${conversationId}?userId=${currentUser.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    if (currentUser?.role === 'specialist' && selectedConversation.conversationId.startsWith('demo_conv_')) {
      // Demo send for specialist
      const newMsg: Message = {
        _id: `demo_${Date.now()}`,
        sender: {
          _id: currentUser.id,
          name: currentUser.name || 'Specialist',
          email: currentUser.email || '',
          role: 'specialist'
        },
        receiver: {
          _id: selectedConversation.otherUser._id,
          name: selectedConversation.otherUser.name,
          email: selectedConversation.otherUser.email || '',
          role: selectedConversation.otherUser.role
        },
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        conversationId: selectedConversation.conversationId
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } else {
      setLoading(true);
      try {
        const response = await axios.post(`${MESSAGES_API}/send`, {
          senderId: currentUser.id,
          receiverId: selectedConversation.otherUser._id,
          content: newMessage.trim()
        });

        setMessages(prev => [...prev, response.data.data]);
        setNewMessage('');
        loadConversations(); // Refresh conversations to update last message
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Start new conversation with specialist
  const startConversation = async (specialist: Specialist) => {
    const newConversation: Conversation = {
      conversationId: [currentUser.id, specialist._id].sort().join('_'),
      lastMessage: {} as Message,
      messageCount: 0,
      unreadCount: 0,
      otherUser: {
        _id: specialist._id || '',
        name: specialist.name,
        email: specialist.email || '',
        role: 'specialist'
      }
    };

    setSelectedConversation(newConversation);
    setMessages([]);
    setShowSpecialists(false);
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadConversations();
      if (currentUser.role === 'farmer') {
        loadSpecialists();
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return lang === 'bn' ? 'আজ' : 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return lang === 'bn' ? 'গতকাল' : 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-150 bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('messenger')}
          </h2>
          {currentUser?.role === 'farmer' && (
            <button
              onClick={() => setShowSpecialists(!showSpecialists)}
              className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t('startConversation')}
            </button>
          )}
        </div>

        {/* Specialists List */}
        {showSpecialists && currentUser?.role === 'farmer' && (
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 max-h-48 overflow-y-auto">
            <h3 className="font-medium text-zinc-900 dark:text-white mb-2">
              {t('specialists')}
            </h3>
            <div className="space-y-2">
              {specialists.map((specialist) => (
                <button
                  key={specialist._id}
                  onClick={() => startConversation(specialist)}
                  className="w-full p-2 text-left bg-zinc-50 dark:bg-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">{specialist.name}</div>
                      <div className="text-xs text-zinc-500">{t('specialist')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">
              {t('noConversations')}
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.conversationId}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left border-b border-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors ${
                  selectedConversation?.conversationId === conversation.conversationId
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                        {conversation.otherUser.name}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {conversation.lastMessage.timestamp ? formatTime(conversation.lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate mb-1">
                      {conversation.lastMessage.content || 'No messages yet'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 capitalize">
                        {t(conversation.otherUser.role)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {selectedConversation.otherUser.name}
                  </h3>
                  <p className="text-sm text-zinc-500 capitalize">
                    {t(selectedConversation.otherUser.role)}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.sender._id === currentUser?.id;
                const showDate = index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center mb-4">
                        <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          isCurrentUser ? 'text-green-100' : 'text-zinc-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {isCurrentUser && (
                            message.read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={t('typeMessage')}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {t('send')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
              <p>{t('selectConversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};