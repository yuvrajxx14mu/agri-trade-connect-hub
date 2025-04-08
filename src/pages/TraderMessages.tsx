import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip } from "lucide-react";

const messages = [
  {
    id: "m1",
    sender: "Rajesh Kumar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    lastMessage: "I have a new batch of Organic Wheat available for auction.",
    time: "9:15 AM",
    unread: true
  },
  {
    id: "m2",
    sender: "Meena Patel",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meena",
    lastMessage: "The shipment has been delivered successfully.",
    time: "Yesterday",
    unread: false
  },
  {
    id: "m3",
    sender: "Arun Singh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
    lastMessage: "Would you like to discuss the contract terms?",
    time: "2 days ago",
    unread: true
  }
];

const TraderMessages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Messages" userName="Vikram Sharma" userRole="trader" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Chat with farmers and sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === message.id
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedChat(message.id)}
                  >
                    <Avatar>
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback>
                        {message.sender.split(' ').map(name => name[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium truncate">{message.sender}</h4>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{message.lastMessage}</p>
                    </div>
                    {message.unread && (
                      <Badge variant="default" className="ml-2">New</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              {selectedChat
                ? `Chat with ${messages.find(m => m.id === selectedChat)?.sender}`
                : "Select a conversation to start chatting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100vh-20rem)]">
            {selectedChat ? (
              <>
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {/* Chat messages would go here */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg py-2 px-4 max-w-[80%]">
                        <p>Hi! I'm interested in your Organic Wheat.</p>
                        <span className="text-xs opacity-70">9:15 AM</span>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg py-2 px-4 max-w-[80%]">
                        <p>Hello! The auction will start tomorrow at 10 AM. Would you like to participate?</p>
                        <span className="text-xs opacity-70">9:16 AM</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input placeholder="Type your message..." />
                  <Button>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderMessages; 