import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHotels } from '../hooks/useHotelQueries';
import { useCurrency } from '../context/CurrencyContext';
import { 
  Sparkles, X, Send, Bot, User, MapPin, Star, 
  ArrowRight, Compass, RefreshCw, MessageSquareHeart, Check
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { label: '🌿 Romantic Stays in Munnar', query: 'Show me romantic luxury resorts in Munnar with scenic views' },
  { label: '🏖️ Beachfront Kovalam with Pool', query: 'Looking for beachfront properties in Kovalam with a swimming pool' },
  { label: '🛶 Backwater Ayurvedic Retreat', query: 'Recommend peaceful Alleppey or Kumarakom backwater stays with spa' },
  { label: '💰 Budget Stays Under ₹4,000', query: 'Best highly-rated stays under ₹4,000 per night' },
  { label: '🗺️ 3-Day Kerala Itinerary', query: 'Plan an ideal 3-day holiday itinerary across Kerala with hotel recommendations' }
];

export default function AIConciergeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Namaste! I'm Aria, your AI Hospitality Concierge. How can I help craft your perfect staycation across God's Own Country today?",
      hotels: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const { data: hotels = [] } = useHotels();
  const { formatPrice } = useCurrency();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Intelligent matching engine based on hotels database
  const generateAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    let matchedHotels = [];
    let responseText = '';

    // Destination filters
    const places = ['munnar', 'kochi', 'cochin', 'alleppey', 'alappuzha', 'kovalam', 'wayanad', 'varkala', 'thekkady', 'kumarakom'];
    const matchedPlace = places.find(p => q.includes(p));

    if (matchedPlace) {
      matchedHotels = hotels.filter(h => 
        (h.place_name && h.place_name.toLowerCase().includes(matchedPlace)) ||
        (h.address && h.address.toLowerCase().includes(matchedPlace)) ||
        (h.name && h.name.toLowerCase().includes(matchedPlace))
      );
    }

    // Amenity keywords
    if (q.includes('pool') || q.includes('swimming')) {
      matchedHotels = (matchedHotels.length > 0 ? matchedHotels : hotels).filter(h => 
        Array.isArray(h.amenities) && h.amenities.some(a => a.toLowerCase().includes('pool'))
      );
    }

    if (q.includes('spa') || q.includes('ayurveda') || q.includes('wellness')) {
      matchedHotels = (matchedHotels.length > 0 ? matchedHotels : hotels).filter(h => 
        Array.isArray(h.amenities) && h.amenities.some(a => a.toLowerCase().includes('spa'))
      );
    }

    // Budget checks
    if (q.includes('under') || q.includes('budget') || q.includes('cheap') || q.includes('4000') || q.includes('5000')) {
      const budgetCap = q.includes('4000') ? 4000 : q.includes('5000') ? 5000 : 4500;
      matchedHotels = (matchedHotels.length > 0 ? matchedHotels : hotels).filter(h => 
        (h.min_price || 2500) <= budgetCap
      );
    }

    // Itinerary generation
    if (q.includes('itinerary') || q.includes('plan') || q.includes('3-day') || q.includes('holiday')) {
      responseText = `Here is a curated 3-Day Kerala Holiday Itinerary crafted just for you:\n\n` +
        `• Day 1: Heritage & Backwaters (Kochi & Alleppey)\n` +
        `  Arrive at Cochin, explore Fort Kochi heritage street art and Chinese fishing nets. Evening houseboat backwater cruise at Alleppey.\n\n` +
        `• Day 2: Mist & Tea Trails (Munnar Hills)\n` +
        `  Drive up to the verdant hills of Munnar, visit tea plantations and enjoy an Ayurvedic spa rejuvenation session.\n\n` +
        `• Day 3: Sunset & Coastal Leisure\n` +
        `  Unwind at tranquil coastal cliffs, sample fresh coastal Malabar cuisine, and watch the Arabian Sea sunset.\n\n` +
        `Here are the top-rated luxury stays along this route:`;
      
      matchedHotels = hotels.slice(0, 3);
    } else if (matchedHotels.length > 0) {
      responseText = `I found ${matchedHotels.length} fantastic ${matchedPlace ? matchedPlace.toUpperCase() : 'handpicked'} stay${matchedHotels.length > 1 ? 's' : ''} matching your preferences:`;
    } else {
      // Fallback top rated
      matchedHotels = [...hotels].sort((a, b) => (b.average_rating || b.star_rating) - (a.average_rating || a.star_rating)).slice(0, 3);
      responseText = `I couldn't find an exact match for that specific search, but here are our top-rated Kerala retreats that guests love:`;
    }

    return {
      text: responseText,
      hotels: matchedHotels.slice(0, 3)
    };
  };

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Realistic AI thinking delay
    setTimeout(() => {
      const response = generateAIResponse(textToSend);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        hotels: response.hotels,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: "Namaste! I'm Aria, your AI Hospitality Concierge. How can I help craft your perfect staycation across God's Own Country today?",
        hotels: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-200 border border-emerald-400/40"
          aria-label="Ask AI Concierge"
        >
          <div className="relative">
            <Sparkles size={18} className="animate-spin-slow text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">Ask AI Concierge</span>
        </button>
      )}

      {/* Floating Concierge Chat Drawer */}
      {isOpen && (
        <aside 
          aria-label="AI Concierge Assistant Drawer"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[86vh] sm:max-h-[620px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot size={22} className="text-amber-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-800" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">Aria AI Concierge</h3>
                  <span className="text-[10px] font-semibold bg-white/20 px-1.5 py-0.2 rounded-md">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">Smart Kerala Holiday & Stay Planner</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Restart conversation"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Close Concierge"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 mt-1">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Embedded Hotel Recommendation Cards */}
                  {msg.hotels && msg.hotels.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.hotels.map((h) => (
                        <div
                          key={h.id}
                          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3 hover:border-emerald-500 transition-all"
                        >
                          <img
                            src={h.image_url || h.images?.[0]}
                            alt={h.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {h.name}
                            </h4>
                            <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              <MapPin size={11} className="text-emerald-500 shrink-0" />
                              <span>{h.place_name || h.address}</span>
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                {formatPrice(h.min_price || 2500)}
                                <span className="text-[9px] font-normal text-slate-400"> /nt</span>
                              </span>
                              <Link
                                to={`/hotel/${h.id}`}
                                onClick={() => setIsOpen(false)}
                                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                              >
                                <span>View</span>
                                <ArrowRight size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className={`text-[10px] text-slate-400 block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Bot size={13} />
                </div>
                <div className="flex items-center gap-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations, places, itineraries..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
              title="Send prompt"
            >
              <Send size={14} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
