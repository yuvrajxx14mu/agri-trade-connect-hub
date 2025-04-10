
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTraderProfile } from "@/hooks/useTraderProfile";
import ProfileSidebar from "@/components/trader/ProfileSidebar";
import PersonalInfoForm from "@/components/trader/PersonalInfoForm";
import CompanyDetailsForm from "@/components/trader/CompanyDetailsForm";
import AccountSettingsTab from "@/components/trader/AccountSettingsTab";

const TraderProfile = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const { 
    loading, 
    profileData, 
    formData, 
    actions, 
    state 
  } = useTraderProfile();
  
  if (loading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="My Profile" userName={profile?.name || "User"} userRole="trader" />
        <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Profile" userName={profile?.name || "User"} userRole="trader" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <ProfileSidebar 
          profile={profileData.profile} 
          email={profileData.email} 
          businessName={profileData.businessName} 
        />
        
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="profile">Personal Info</TabsTrigger>
              <TabsTrigger value="company">Company Details</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <PersonalInfoForm 
                initialData={formData.personal}
                onSubmit={actions.handlePersonalSubmit}
                isSaving={state.savingPersonal}
              />
            </TabsContent>
            
            <TabsContent value="company">
              <CompanyDetailsForm 
                initialData={formData.company}
                onSubmit={actions.handleCompanySubmit}
                isSaving={state.savingCompany}
              />
            </TabsContent>
            
            <TabsContent value="settings">
              <AccountSettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderProfile;
