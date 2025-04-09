
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "./use-toast";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user: {
    name: string;
    role: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export const useMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      
      // Get all messages where the current user is either sender or receiver
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      // Get unique user IDs from messages
      const userIds = new Set<string>();
      messages?.forEach(message => {
        if (message.sender_id !== profile.id) userIds.add(message.sender_id);
        if (message.receiver_id !== profile.id) userIds.add(message.receiver_id);
      });
      
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(userIds));
      
      if (profilesError) throw profilesError;
      
      // Create conversation objects
      const conversationMap = new Map<string, Conversation>();
      
      messages?.forEach(message => {
        const otherUserId = message.sender_id === profile.id ? message.receiver_id : message.sender_id;
        const otherUser = profiles?.find(p => p.id === otherUserId);
        
        if (!otherUser) return;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user: {
              name: otherUser.name,
              role: otherUser.role
            },
            lastMessage: message.content,
            timestamp: message.created_at,
            unread: message.receiver_id === profile.id && !message.read
          });
        }
      });
      
      setConversations(Array.from(conversationMap.values()));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      setLoading(false);
    }
  }, [profile?.id]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (userId: string) => {
    if (!profile?.id) return;
    
    try {
      setSelectedUserId(userId);
      setLoading(true);
      
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      setCurrentMessages(data || []);
      
      // Mark messages as read
      const unreadMessages = data?.filter(m => m.receiver_id === profile.id && !m.read) || [];
      
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(m => m.id);
        
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
          
        // Update conversations
        setConversations(prev => 
          prev.map(conv => 
            conv.id === userId ? { ...conv, unread: false } : conv
          )
        );
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  }, [profile?.id]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!profile?.id) return;
    
    try {
      const newMessage = {
        sender_id: profile.id,
        receiver_id: receiverId,
        content,
        read: false
      };
      
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (sendError) throw sendError;
      
      // Update current messages
      if (data && data.length > 0) {
        setCurrentMessages(prev => [...prev, data[0]]);
        
        // Update conversations
        setConversations(prev => 
          prev.map(conv => 
            conv.id === receiverId 
              ? { 
                  ...conv, 
                  lastMessage: content, 
                  timestamp: new Date().toISOString() 
                } 
              : conv
          )
        );
      }
      
      toast({
        title: "Message sent",
        variant: "default"
      });
      
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive"
      });
      return null;
    }
  }, [profile?.id, toast]);

  // Setup real-time subscription
  useEffect(() => {
    if (!profile?.id) return;
    
    fetchConversations();
    
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`
        }, 
        (payload) => {
          // Handle new message
          const newMessage = payload.new as Message;
          
          // Update messages if in current conversation
          if (selectedUserId === newMessage.sender_id) {
            setCurrentMessages(prev => [...prev, newMessage]);
            
            // Mark as read
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMessage.id);
          }
          
          // Update conversations
          fetchConversations();
          
          // Show toast notification
          toast({
            title: "New Message",
            description: "You received a new message",
            variant: "default"
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, selectedUserId, fetchConversations, toast]);

  return {
    loading,
    error,
    conversations,
    currentMessages,
    fetchConversations,
    fetchMessages,
    sendMessage
  };
};
