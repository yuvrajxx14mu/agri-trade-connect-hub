
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ExtendedProfileData, 
  ProfileFormData, 
  TraderBioResponse, 
  RPCVoidResponse,
  GetTraderBioParams,
  UpdateTraderBioParams
} from "@/types/trader";

export const useProfileData = (userId?: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfileData | null>(null);
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [personalFormData, setPersonalFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (!userId) return;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      setExtendedProfile({
        ...profileData,
        bio: ""
      });
      
      try {
        const params: GetTraderBioParams = { user_id: userId };
        const { data, error: extendedError } = await supabase
          .rpc<TraderBioResponse, GetTraderBioParams>('get_trader_bio', params);
        
        if (!extendedError && data) {
          setProfileBio(data.bio_text || "");
        }
      } catch (bioError) {
        console.error('Bio data not available:', bioError);
        setProfileBio("");
      }
      
      const nameParts = profileData.name?.split(' ') || ['', ''];
      const newPersonalForm = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileBio || '',
        email: ''
      };
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (userData?.user?.email) {
        setProfileEmail(userData.user.email);
        newPersonalForm.email = userData.user.email;
      }
      
      setPersonalFormData(newPersonalForm);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    setSavingPersonal(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          phone: data.phone,
          address: data.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      try {
        const params: UpdateTraderBioParams = { 
          user_id: userId, 
          bio_text: data.bio 
        };
        
        await supabase
          .rpc<RPCVoidResponse, UpdateTraderBioParams>('update_trader_bio', params);
        
        setProfileBio(data.bio);
      } catch (bioError) {
        console.error('Error updating bio:', bioError);
      }
      
      setExtendedProfile(prev => prev ? {
        ...prev,
        name: fullName,
        phone: data.phone
      } : null);
      
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive"
      });
    } finally {
      setSavingPersonal(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  return {
    loading,
    extendedProfile,
    profileEmail,
    profileBio,
    personalFormData,
    savingPersonal,
    fetchProfileData,
    handlePersonalSubmit
  };
};
