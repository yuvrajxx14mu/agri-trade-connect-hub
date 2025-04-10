
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail, Calendar, Upload } from "lucide-react";

interface ProfileSidebarProps {
  profile: {
    id?: string;
    name?: string;
    address?: string;
    phone?: string;
    created_at?: string;
  } | null;
  email: string;
  businessName: string;
}

const ProfileSidebar = ({ profile, email, businessName }: ProfileSidebarProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative mt-2 mb-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt={profile?.name || "User"} />
              <AvatarFallback>
                {profile?.name?.split(' ').map((n) => n[0]).join('') || "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">{profile?.name}</h2>
          <p className="text-sm text-muted-foreground mb-1">Agricultural Trader</p>
          <Badge variant="outline" className="bg-agri-trader/10 text-agri-trader mb-4">Verified Trader</Badge>
          
          <div className="w-full space-y-3 mt-2">
            <div className="flex items-center text-sm">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{businessName || "Not specified"}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{profile?.address || "Not specified"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{profile?.phone || "Not specified"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{email || "Not specified"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}</span>
            </div>
          </div>
          
          <div className="w-full mt-6 pt-6 border-t">
            <h3 className="font-medium mb-2">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Top Buyer</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">50+ Trades</Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Premium Partner</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar;
