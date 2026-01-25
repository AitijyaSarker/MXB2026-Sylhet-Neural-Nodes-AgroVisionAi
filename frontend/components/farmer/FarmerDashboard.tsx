'use client'

import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, MapPin, Users, Bell, LayoutDashboard, RefreshCw, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Specialist, Message, Language } from '../../types';
import { ChatBot } from './ChatBot';
import { Scanner } from './Scanner';
import { translations } from '../../translations';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('../MapComponent').then(mod => ({ default: mod.MapComponent })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
});

interface FarmerDashboardProps {
  userRole: 'farmer' | 'guest';
  userId?: string;
  user?: any;
  lang: Language;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ userRole, userId, user, lang }) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'scan' | 'chat' | 'offices' | 'specialists' | 'messages' | 'profile'>('scan');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [consulting, setConsulting] = useState<Specialist | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [conversations, setConversations] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Set user data from props
    if (user) {
      setUserProfile(user);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      loadSpecialists();
      loadConversations();
    }
  }, [userId]);

  const loadSpecialists = async () => {
    // Load specialists with demo data
    const specialistsData: Specialist[] = [
      {
        id: 'specialist_1',
        name: 'Jubayer Rahman Chowdhury',
        institution: 'Bangladesh Agricultural Research Institute',
        department: 'Plant Pathology',
        location: 'Sylhet, Bangladesh',
        image: 'https://ui-avatars.com/api/?name=Jubayer+Rahman+Chowdhury&background=10b981&color=fff&size=200',
        online: true,
        email: 'jubayer@bari.org.bd',
        expertise: ['Rice Diseases', 'Fungal Infections', 'Disease Management']
      },
      {
        id: 'specialist_2',
        name: 'Anidro Paul',
        institution: 'Sylhet Agricultural University',
        department: 'Crop Science',
        location: 'Sylhet, Bangladesh',
        image: 'https://ui-avatars.com/api/?name=Anidro+Paul&background=059669&color=fff&size=200',
        online: true,
        email: 'anidro@sau.ac.bd',
        expertise: ['Crop Management', 'Pest Control', 'Soil Science']
      }
    ];
    setSpecialists(specialistsData);
  };

  const loadConversations = async () => {
    // Dummy conversations
    setConversations([]);
  };

  const handleConsult = (specialist: Specialist) => {
    setConsulting(specialist);
    setSentSuccess(false);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!consulting || !messageText.trim() || !userId) return;

    // Dummy send message
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setConsulting(null);
      setMessageText('');
    }, 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return <Scanner lang={lang} userId={userId} />;
      case 'chat':
        return <ChatBot lang={lang} />;
      case 'offices':
        return <MapComponent lang={lang} />;
      case 'specialists':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('specialists_title')}</h2>
              <button
                onClick={loadSpecialists}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('refresh')}
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {specialists.length > 0 ? specialists.map(s => (
                <div key={s.id} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-all group">
                  <div className="relative mb-4">
                    <img src={s.image} className="w-20 h-20 rounded-2xl object-cover" alt={s.name} />
                    {s.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 border-2 border-white dark:border-zinc-800 rounded-full" />}
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-zinc-900 dark:text-white">{s.name}</h3>
                  <p className="text-zinc-700 dark:text-zinc-500 text-sm font-bold mb-1">{s.institution} • {s.department}</p>
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs font-black mb-4 uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {s.location}
                  </div>
                  <button
                    onClick={() => handleConsult(s)}
                    className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] shadow-lg shadow-green-700/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('consult_now')}
                  </button>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full mx-auto w-fit mb-6">
                    <Users className="w-12 h-12 text-zinc-300" />
                  </div>
                    <h3 className="text-2xl font-bold mb-2">{t('no_specialists')}</h3>
                    <p className="text-zinc-500 max-w-md mx-auto">{t('specialists_description')}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('messages_title')}</h2>
              <button
                onClick={loadConversations}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('refresh')}
              </button>
            </div>

            <div className="space-y-4">
              {conversations.length > 0 ? conversations.map(message => (
                <div key={message.id} className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-4">
                     <img src={message.senderId === userId ? "https://picsum.photos/40/40?person=1" : "https://picsum.photos/40/40?person=2"} className="w-10 h-10 rounded-full border border-zinc-200" alt="avatar" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {message.senderId === userId ? 'You' : 'Specialist'}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-bold">{message.text}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-full mx-auto w-fit mb-6">
                    <MessageSquare className="w-12 h-12 text-zinc-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t('no_messages')}</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">{t('messages_description')}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('profile_title')}</h2>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-6 mb-6">
                <img src={userProfile?.avatar || "https://picsum.photos/80/80?person=1"} className="w-20 h-20 rounded-2xl border border-zinc-200" alt="avatar" />
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{userProfile?.name || 'Farmer'}</h3>
                  <p className="text-zinc-700 dark:text-zinc-500 font-bold">{userProfile?.email || 'farmer@example.com'}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Recently'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">{t('full_name')}</label>
                  <input
                    type="text"
                    defaultValue={userProfile?.name || ''}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('full_name')}
                  />
                </div>
                <div>
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">{t('email')}</label>
                  <input
                    type="email"
                    defaultValue={userProfile?.email || ''}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('email')}
                  />
                </div>
                <div>
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">{t('phone')}</label>
                  <input
                    type="tel"
                    defaultValue={userProfile?.phone || ''}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('phone')}
                  />
                </div>
                <div>
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">{t('location')}</label>
                  <input
                    type="text"
                    defaultValue={userProfile?.location || ''}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('location')}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest mb-2 block">{t('farm_description')}</label>
                <textarea
                  rows={4}
                  defaultValue={userProfile?.farmDescription || ''}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                  placeholder={t('describe_farm')}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl shadow-lg transition-all">
                  {t('save_changes')}
                </button>
                <button className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-black rounded-2xl transition-all">
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Default Content</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Consultation Modal */}
      {consulting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-green-700 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={consulting.image} className="w-10 h-10 rounded-full border-2 border-white/50" alt={consulting.name} />
                <div>
                  <h3 className="font-bold">{consulting.name}</h3>
                  <p className="text-xs opacity-80">{consulting.department}</p>
                </div>
              </div>
              <button onClick={() => setConsulting(null)} className="text-2xl font-light hover:rotate-90 transition-transform">&times;</button>
            </div>
            <div className="p-6">
              {sentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-green-800">{t('message_sent')}</h4>
                  <p className="text-zinc-700 dark:text-zinc-500 font-bold">{t('specialist_contact')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-sm font-black text-zinc-700 dark:text-zinc-500 uppercase tracking-widest">{t('describe_problem')}</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={5}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold rounded-2xl outline-none focus:ring-2 ring-green-600"
                    placeholder={t('problem_placeholder')}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-full py-4 bg-green-700 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {t('send_message')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3 text-zinc-900 dark:text-white">
            <LayoutDashboard className="text-green-700 dark:text-green-400" />
            {t('dashboard_title')}
          </h1>
          <p className="text-zinc-700 dark:text-zinc-500 mt-2 font-bold">{t('dashboard_welcome')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-700 dark:text-zinc-400 hover:text-green-700 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Bell className="w-6 h-6" />
          </button>
          <div className="h-10 w-[1px] bg-zinc-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <img src={userProfile?.avatar || "https://picsum.photos/32/32?person=1"} className="rounded-full border border-zinc-200" alt="avatar" />
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{userProfile?.name || 'Farmer'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-fit">
        {[
          { id: 'scan', label: t('tab_scan'), icon: Search },
          { id: 'chat', label: t('tab_chat'), icon: MessageSquare },
          { id: 'offices', label: t('tab_offices'), icon: MapPin },
          { id: 'specialists', label: t('tab_specialists'), icon: Users },
          { id: 'messages', label: t('tab_messages'), icon: MessageSquare },
          { id: 'profile', label: t('tab_profile'), icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-zinc-700 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default FarmerDashboard;