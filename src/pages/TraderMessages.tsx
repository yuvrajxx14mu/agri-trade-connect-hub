
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TraderMessages = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchConversations();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, 
          (payload) => {
            handleNewMessage(payload.new);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  const fetchConversations = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      // Get unique conversations where the current user is either sender or receiver
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', profile.id)
        .distinct();

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', profile.id)
        .distinct();

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine unique user IDs
      const uniqueUserIds = new Set([
        ...(sentMessages || []).map(msg => msg.receiver_id),
        ...(receivedMessages || []).map(msg => msg.sender_id)
      ]);

      // Fetch user details for these IDs
      const userIds = Array.from(uniqueUserIds);
      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const formattedConversations = (profiles || []).map(profile => ({
        id: profile.id,
        user: {
          id: profile.id,
          name: profile.name,
          role: profile.role,
          initials: profile.name.split(' ').map((n: string) => n[0]).join('')
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
  };

  const fetchMessages = async (userId: string) => {
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
  };

  const handleNewMessage = (message: any) => {
    // If this is a message from the currently selected chat, add it to the conversation
    if (selectedChat === message.sender_id) {
      setCurrentMessages(prev => [...prev, message]);
      
      // Mark as read immediately
      supabase
        .from('messages')
        .update({ read: true })
        .eq('id', message.id)
        .then(() => {});
    }
    
    // Refresh conversations to show latest message
    fetchConversations();
  };

  const handleChatSelect = (userId: string) => {
    setSelectedChat(userId);
    fetchMessages(userId);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !profile?.id || !newMessage.trim()) return;
    
    setSendingMessage(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: selectedChat,
          content: newMessage.trim(),
          read: false
        });

      if (error) throw error;

      // Clear input field
      setNewMessage("");
      
      // Fetch updated messages
      fetchMessages(selectedChat);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Messages" userName={profile?.name || "User"} userRole="trader" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              Chat with farmers and other traders
            </CardDescription>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedChat === conversation.id 
                          ? 'bg-secondary' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => handleChatSelect(conversation.id)}
                    >
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conversation.user.name}`} />
                        <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium leading-none mb-1">{conversation.user.name}</div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.user.role === 'farmer' ? 'Farmer' : 'Trader'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                {conversations.find(c => c.id === selectedChat)?.user && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                          conversations.find(c => c.id === selectedChat)?.user.name
                        }`} 
                      />
                      <AvatarFallback>
                        {conversations.find(c => c.id === selectedChat)?.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.id === selectedChat)?.user.name}
                      </CardTitle>
                      <CardDescription>
                        {conversations.find(c => c.id === selectedChat)?.user.role === 'farmer' 
                          ? 'Farmer' 
                          : 'Trader'}
                      </CardDescription>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  {currentMessages.length > 0 ? (
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${
                            message.sender_id === profile?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div 
                            className={`max-w-[75%] rounded-lg p-3 ${
                              message.sender_id === profile?.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                </ScrollArea>
                <Separator />
                <div className="p-4 flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] p-4">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a contact from the list to start chatting or resume a conversation.
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderMessages;
