// AI Party Planner Chat Interface
// Slide-out panel on desktop, bottom sheet on mobile

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useVRPartnerContext } from '@/contexts/VRPartnerContext';
import { useAIPlanner, Message, VendorRecommendation } from '@/hooks/useAIPlanner';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
  PartyPopper,
  User,
  Bot,
  Plus,
  ExternalLink,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import '@/styles/party-design-tokens.css';

// Chat Message Component
interface ChatMessageProps {
  message: Message;
  primaryColor: string;
  onVendorClick?: (vendor: VendorRecommendation) => void;
}

function ChatMessage({ message, primaryColor, onVendorClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center',
          isUser ? 'bg-gray-200' : 'bg-gradient-to-br from-purple-500 to-pink-500'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 max-w-[80%]', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block px-4 py-2.5 rounded-2xl text-sm',
            isUser
              ? 'bg-gray-900 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Vendor Recommendations */}
        {message.vendorRecommendations && message.vendorRecommendations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.vendorRecommendations.slice(0, 3).map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => onVendorClick?.(vendor)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{vendor.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{vendor.vendor_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {vendor.packages?.[0]?.guest_price && (
                      <span className="text-sm font-medium" style={{ color: primaryColor }}>
                        From ${vendor.packages[0].guest_price}
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn('text-xs text-gray-400 mt-1', isUser ? 'text-right' : 'text-left')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Main Chat Interface
interface AIPlannerChatProps {
  isOpen: boolean;
  onClose: () => void;
  partyId?: string;
  initialContext?: {
    partyType?: 'bachelor' | 'bachelorette';
    partyDate?: string;
    guestCount?: number;
  };
}

export function AIPlannerChat({ isOpen, onClose, partyId, initialContext }: AIPlannerChatProps) {
  const navigate = useNavigate();
  const { primaryColor, getPartnerPath } = useVRPartnerContext();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearChat, context } = useAIPlanner({
    initialContext: {
      partyId,
      ...initialContext,
    },
    onVendorRecommended: (vendors) => {
      console.log('Vendors recommended:', vendors);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleVendorClick = (vendor: VendorRecommendation) => {
    navigate(getPartnerPath(`/vendor/${vendor.id}`));
    onClose();
  };

  // Quick suggestion chips
  const quickSuggestions = [
    "It's a bachelorette for 12 girls",
    "Looking for a luxury experience",
    "We want activities during the day",
    "Need transportation for the group",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:bg-transparent"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed z-50 bg-white shadow-2xl transition-all duration-300 ease-out',
          // Mobile: Bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]',
          isExpanded ? 'h-[85vh]' : 'h-[60vh]',
          // Desktop: Side panel
          'lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-[420px] lg:max-w-full lg:rounded-none lg:max-h-none lg:h-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Party Planner</h3>
              <p className="text-xs text-gray-500">Powered by Claude</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Expand/Collapse on mobile */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5 text-gray-500" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Party Context Banner (if we have details) */}
        {(context.partyType || context.guestCount) && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-sm">
            <PartyPopper className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {context.partyType && (
                <span className="capitalize">{context.partyType}</span>
              )}
              {context.guestCount && (
                <span> · {context.guestCount} guests</span>
              )}
              {context.partyDate && (
                <span> · {context.partyDate}</span>
              )}
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-140px)] lg:h-[calc(100%-180px)]">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              primaryColor={primaryColor}
              onVendorClick={handleVendorClick}
            />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions (only show at start) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => sendMessage(suggestion)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me about your party..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                'px-4 py-3 rounded-xl font-medium text-white transition-all',
                inputValue.trim() && !isLoading
                  ? 'hover:opacity-90'
                  : 'opacity-50 cursor-not-allowed'
              )}
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Floating Action Button to open chat
interface AIPlannerFABProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export function AIPlannerFAB({ onClick, hasUnread }: AIPlannerFABProps) {
  const { primaryColor } = useVRPartnerContext();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-105 transition-transform"
      style={{ backgroundColor: primaryColor }}
    >
      <Sparkles className="w-6 h-6 text-white" />
      {hasUnread && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

export default AIPlannerChat;
