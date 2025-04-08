
import React from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
  status: "upcoming" | "completed" | "cancelled" | "pending";
  onAccept?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
}

const AppointmentCard = ({
  id,
  title,
  date,
  startTime,
  endTime,
  location,
  attendees,
  status,
  onAccept,
  onDecline,
  onReschedule,
}: AppointmentCardProps) => {
  const statusConfig = {
    upcoming: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />,
    },
    completed: {
      color: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />,
    },
    cancelled: {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />,
    },
    pending: {
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />,
    },
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="font-bold text-base sm:text-lg">{title}</h3>
          <Badge 
            variant="outline" 
            className={cn(`text-xxs sm:text-xs`, statusConfig[status].color)}
          >
            {statusConfig[status].icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground" />
            <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground" />
            <span>{startTime} - {endTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-start">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-1 text-muted-foreground" />
            <div>
              <span className="block text-xs sm:text-sm font-medium mb-1">Attendees:</span>
              <div className="flex flex-wrap gap-1">
                {attendees.map((attendee, index) => (
                  <Badge key={index} variant="secondary" className="text-xxs sm:text-xs">
                    {attendee}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {status === "pending" && (
        <CardFooter className="p-3 pt-0 flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            onClick={onDecline}
          >
            Decline
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            onClick={onAccept}
          >
            Accept
          </Button>
        </CardFooter>
      )}
      
      {status === "upcoming" && (
        <CardFooter className="p-3 pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm h-8 sm:h-9"
            onClick={onReschedule}
          >
            Reschedule
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AppointmentCard;
