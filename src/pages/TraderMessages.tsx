import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendIcon, Search, UserIcon, Users } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";

const TraderMessages = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const { 
    conversations, 
    currentMessages, 
    fetchConversations, 
    fetchMessages, 
    sendMessage, 
    loading 
  } = useMessages();

  useEffect(() => {
    // Set up subscription for new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `receiver_id=eq.${profile?.id}` 
        }, 
        payload => {
          fetchConversations();
          if (selectedUser && (payload.new.sender_id === selectedUser.id)) {
            fetchMessages(selectedUser.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, selectedUser, fetchConversations, fetchMessages]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    const success = await sendMessage(selectedUser.id, newMessage.trim());
    if (success) {
      setNewMessage('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader 
        title="Messages" 
        userName={profile?.name || 'User'} 
        userRole="trader"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Conversations</CardTitle>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search users..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="h-[calc(100vh-250px)]">
              <div className="px-4 border-b">
                <TabsList className="w-full justify-start pb-0 pt-0 h-10">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="farmers" className="text-xs">Farmers</TabsTrigger>
                  <TabsTrigger value="traders" className="text-xs">Traders</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-0 overflow-auto h-[calc(100vh-300px)]">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length > 0 ? (
                  <div>
                    {conversations.map((convo) => (
                      <div 
                        key={convo.id} 
                        className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer ${selectedUser?.id === convo.id ? 'bg-muted' : ''}`}
                        onClick={() => handleSelectUser(convo.user)}
                      >
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {getInitials(convo.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{convo.user.name}</p>
                            <span className="text-xs text-muted-foreground">12m</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {convo.user.role === 'farmer' ? 'Farmer' : 'Trader'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <UserIcon className="h-8 w-8 text-muted-foreground mb-3" />
                    <h3 className="text-sm font-medium mb-1">No conversations yet</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Start chatting with farmers and other traders
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {/* Other tabs content would go here */}
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Message Content */}
        <Card className="md:col-span-2">
          {selectedUser ? (
            <>
              <CardHeader className="px-6 py-4 border-b flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{selectedUser.name}</CardTitle>
                    <CardDescription>{selectedUser.role === 'farmer' ? 'Farmer' : 'Trader'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100vh-280px)]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.sender_id === profile?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center gap-2">
                    <Textarea 
                      placeholder="Type your message..." 
                      className="min-h-10 resize-none"
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
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] px-4 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <SendIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a contact from the left to start messaging
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderMessages;
