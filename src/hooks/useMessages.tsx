
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
}

interface Conversation {
  id: string;
  user: User;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export const useMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      // Get unique conversations where the current user is either sender or receiver
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', profile.id);

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', profile.id);

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine unique user IDs manually without using distinct
      const uniqueUserIds = new Set([
        ...(sentMessages || []).map(msg => msg.receiver_id),
        ...(receivedMessages || []).map(msg => msg.sender_id)
      ]);

      // Fetch user details for these IDs
      const userIds = Array.from(uniqueUserIds);
      if (userIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const formattedConversations = (profiles || []).map(user => ({
        id: user.id,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.id, toast]);

  const fetchMessages = useCallback(async (userId: string) => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark received messages as read
      const unreadMessageIds = data
        ?.filter(msg => msg.receiver_id === profile.id && !msg.read)
        .map(msg => msg.id) || [];

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadMessageIds);
      }

      setCurrentMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [profile?.id, toast]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!profile?.id) return false;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: receiverId,
          content: content,
          read: false
        });

      if (error) throw error;
      
      // Refresh messages
      fetchMessages(receiverId);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  }, [profile?.id, fetchMessages, toast]);

  useEffect(() => {
    if (profile?.id) {
      fetchConversations();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, 
          () => {
            fetchConversations();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id, fetchConversations]);

  return {
    loading,
    conversations,
    currentMessages,
    fetchConversations,
    fetchMessages,
    sendMessage
  };
};
