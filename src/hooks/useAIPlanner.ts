// AI Party Planner Hook
// Manages chat state and communication with Claude AI

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  vendorRecommendations?: VendorRecommendation[];
}

export interface VendorRecommendation {
  id: string;
  name: string;
  vendor_type: string;
  description: string;
  packages: {
    id: string;
    name: string;
    guest_price: number;
    price_type: string;
  }[];
}

export interface PartyContext {
  partyId?: string;
  partyType?: 'bachelor' | 'bachelorette';
  partyDate?: string;
  guestCount?: number;
  budget?: string;
  location?: string;
  preferences?: string[];
}

interface UseAIPlannerOptions {
  initialContext?: PartyContext;
  onVendorRecommended?: (vendors: VendorRecommendation[]) => void;
}

interface UseAIPlannerReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  context: PartyContext;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  updateContext: (updates: Partial<PartyContext>) => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hey! I'm your Austin party planning assistant. I'm here to help you plan an amazing bachelor or bachelorette party!

Tell me a bit about what you're planning - is it a bachelor or bachelorette party? When's the big day, and how many people are celebrating?`,
  timestamp: new Date(),
};

export function useAIPlanner(options: UseAIPlannerOptions = {}): UseAIPlannerReturn {
  const { initialContext = {}, onVendorRecommended } = options;

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<PartyContext>(initialContext);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate unique message ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Send a message to the AI
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (exclude welcome message's special id)
      const apiMessages = [...messages, userMessage]
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Also include welcome message content if it's the first real message
      if (apiMessages.length === 1) {
        apiMessages.unshift({
          role: 'assistant',
          content: WELCOME_MESSAGE.content,
        });
      }

      const { data, error: fnError } = await supabase.functions.invoke('ai-party-planner', {
        body: {
          messages: apiMessages,
          partyContext: context,
          stream: false,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get response');
      }

      if (!data || !data.message) {
        throw new Error('Invalid response from AI');
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        vendorRecommendations: data.recommendedVendors,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update context if extracted
      if (data.updatedContext) {
        setContext((prev) => ({ ...prev, ...data.updatedContext }));
      }

      // Notify about vendor recommendations
      if (data.recommendedVendors?.length > 0 && onVendorRecommended) {
        onVendorRecommended(data.recommendedVendors);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('AI Planner error:', err);
      setError(err.message || 'Something went wrong. Please try again.');

      // Add error message as assistant response
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: "I'm having a bit of trouble right now. Could you try asking again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, context, isLoading, onVendorRecommended]);

  // Clear chat and reset
  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setContext(initialContext);
  }, [initialContext]);

  // Update party context
  const updateContext = useCallback((updates: Partial<PartyContext>) => {
    setContext((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    messages,
    isLoading,
    error,
    context,
    sendMessage,
    clearChat,
    updateContext,
  };
}

export default useAIPlanner;
