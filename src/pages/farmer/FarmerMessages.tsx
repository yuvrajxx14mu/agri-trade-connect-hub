import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: {
    name: string;
  };
  receiver: {
    name: string;
  };
}

interface Conversation {
  trader_id: string;
  trader_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const FarmerMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(name),
          receiver:profiles(name)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueConversations = new Map();
      data?.forEach((message) => {
        const traderId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
        const traderName = message.sender_id === user?.id ? message.receiver.name : message.sender.name;
        
        if (!uniqueConversations.has(traderId)) {
          uniqueConversations.set(traderId, {
            trader_id: traderId,
            trader_name: traderName,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0
          });
        }

        // Update unread count
        if (message.receiver_id === user?.id && !message.read) {
          const conversation = uniqueConversations.get(traderId);
          conversation.unread_count += 1;
          uniqueConversations.set(traderId, conversation);
        }
      });

      setConversations(Array.from(uniqueConversations.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (traderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(name),
          receiver:profiles(name)
        `)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${traderId}),and(sender_id.eq.${traderId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user?.id)
        .eq('sender_id', traderId)
        .eq('read', false);

      if (updateError) throw updateError;
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user?.id,
          receiver_id: selectedConversation,
          content: newMessage,
          read: false
        }]);

      if (error) throw error;

      // Create a notification for the receiver
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: selectedConversation,
          title: 'New Message',
          message: `You have received a new message from ${user?.user_metadata?.full_name || 'a farmer'}`,
          type: 'message',
          metadata: {
            sender_id: user?.id
          }
        }]);

      if (notificationError) throw notificationError;

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="flex gap-6">
          <div className="w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <Button
                        key={conversation.trader_id}
                        variant={selectedConversation === conversation.trader_id ? 'default' : 'outline'}
                        className="w-full justify-start relative"
                        onClick={() => setSelectedConversation(conversation.trader_id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{conversation.trader_name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedConversation
                    ? conversations.find(c => c.trader_id === selectedConversation)?.trader_name
                    : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <>
                    <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                      />
                      <Button type="submit">Send</Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    Select a conversation to start messaging
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}; 