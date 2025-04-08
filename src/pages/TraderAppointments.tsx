
import { useState } from "react";
import { format, addDays } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const appointments = [
  {
    id: "APT001",
    title: "Product Inspection",
    with: "Rajesh Kumar (Farmer)",
    date: addDays(new Date(), 2),
    time: "10:00 AM - 11:00 AM",
    location: "Farm Location, Amritsar",
    status: "upcoming"
  },
  {
    id: "APT002",
    title: "Contract Discussion",
    with: "Anand Singh (Farmer)",
    date: addDays(new Date(), 4),
    time: "2:00 PM - 3:30 PM",
    location: "Virtual Meeting",
    status: "upcoming"
  },
  {
    id: "APT003",
    title: "Product Sampling",
    with: "Suresh Verma (Farmer)",
    date: addDays(new Date(), 7),
    time: "11:30 AM - 1:00 PM",
    location: "Farm Location, Indore",
    status: "upcoming"
  },
  {
    id: "APT004",
    title: "Quality Assessment",
    with: "Meena Patel (Farmer)",
    date: addDays(new Date(), -3),
    time: "10:00 AM - 11:00 AM",
    location: "Warehouse, Guntur",
    status: "completed"
  },
  {
    id: "APT005",
    title: "Delivery Confirmation",
    with: "Harpreet Singh (Farmer)",
    date: addDays(new Date(), -7),
    time: "3:00 PM - 4:00 PM",
    location: "Virtual Meeting",
    status: "completed"
  }
];

const TraderAppointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.with.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = appointment.status === activeTab;
    
    const matchesDate = selectedDate 
      ? appointment.date.toDateString() === selectedDate.toDateString()
      : true;
    
    return matchesSearch && matchesTab && matchesDate;
  });
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Appointments" userName="Vikram Sharma" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>Manage meetings with farmers and suppliers</CardDescription>
            </div>
            <Button className="mt-4 sm:mt-0 bg-agri-trader">
              <Plus className="mr-2 h-4 w-4" />
              Schedule New
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search appointments..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-agri-trader p-4 sm:p-6 text-primary-foreground sm:w-32 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-start">
                            <div className="text-xl sm:text-2xl font-bold">
                              {format(appointment.date, "dd")}
                            </div>
                            <div className="text-sm">
                              {format(appointment.date, "MMM yyyy")}
                            </div>
                          </div>
                          <div className="p-4 sm:p-6 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{appointment.title}</h3>
                              <Badge variant="outline" className={appointment.status === "upcoming" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}>
                                {appointment.status === "upcoming" ? "Upcoming" : "Completed"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              With: {appointment.with}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{appointment.time}</span>
                              </div>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === "upcoming" 
                        ? "You don't have any upcoming appointments for the selected filters." 
                        : "You don't have any completed appointments matching your search."}
                    </p>
                    <Button className="bg-agri-trader">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule New Appointment
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select date to filter appointments</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
            <div className="pt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderAppointments;
