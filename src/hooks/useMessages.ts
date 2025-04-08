import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender: {
    name: string;
    role: string;
  };
  receiver: {
    name: string;
    role: string;
  };
};

export type Conversation = {
  id: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  lastMessage: string;
  unread: boolean;
  timestamp: string;
};

export const useMessages = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      // Get all messages where user is either sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          created_at,
          sender:profiles!sender_id(name, role),
          receiver:profiles!receiver_id(name, role)
        `)
        .or(`sender_id.eq.${profile?.id},receiver_id.eq.${profile?.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation partner
      const conversationsMap = new Map<string, Conversation>();
      
      messages?.forEach((message) => {
        const isUserSender = message.sender_id === profile?.id;
        const partnerId = isUserSender ? message.receiver_id : message.sender_id;
        const partner = isUserSender ? message.receiver : message.sender;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            id: partnerId,
            user: {
              id: partnerId,
              name: partner.name,
              role: partner.role,
            },
            lastMessage: message.content,
            unread: !isUserSender,
            timestamp: message.created_at,
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (partnerId: string) => {
    try {
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          created_at,
          sender:profiles!sender_id(name, role),
          receiver:profiles!receiver_id(name, role)
        `)
        .or(`and(sender_id.eq.${profile?.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile?.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setCurrentMessages(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Send a new message
  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          sender_id: profile?.id,
          receiver_id: receiverId,
          content,
        });

      if (sendError) throw sendError;
      
      // Refresh messages
      await fetchMessages(receiverId);
      await fetchConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${profile.id},receiver_id=eq.${profile.id}`,
        },
        async (payload) => {
          // Refresh conversations and messages
          await fetchConversations();
          const currentPartnerId = currentMessages[0]?.sender_id === profile.id 
            ? currentMessages[0]?.receiver_id 
            : currentMessages[0]?.sender_id;
          if (currentPartnerId) {
            await fetchMessages(currentPartnerId);
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchConversations();
    setLoading(false);

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id]);

  return {
    conversations,
    currentMessages,
    loading,
    error,
    sendMessage,
    fetchMessages,
  };
}; 