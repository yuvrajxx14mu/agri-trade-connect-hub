
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfileData } from "./useProfileData";
import { useBusinessData } from "./useBusinessData";
import { ProfileFormData } from "@/types/trader";
import { CompanyFormData } from "@/types/trader";

export const useTraderProfile = () => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const {
    extendedProfile,
    profileEmail,
    profileBio,
    personalFormData,
    savingPersonal,
    fetchProfileData,
    handlePersonalSubmit
  } = useProfileData(profile?.id);
  
  const {
    businessDetails,
    companyFormData,
    savingCompany,
    fetchBusinessData,
    handleCompanySubmit
  } = useBusinessData(profile?.id);

  const refreshProfile = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfileData(),
      fetchBusinessData()
    ]);
    setLoading(false);
  };

  // Handle personal form submit with profile update
  const handlePersonalFormSubmit = async (data: ProfileFormData) => {
    await handlePersonalSubmit(data);
    
    // Update the auth context profile
    if (profile) {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      updateProfile({
        ...profile,
        name: fullName,
        phone: data.phone
      });
    }
  };

  useEffect(() => {
    if (profile?.id) {
      refreshProfile();
    }
  }, [profile?.id]);

  useEffect(() => {
    // When both profile and business data are loaded, set the loading state to false
    if (!loading && extendedProfile && personalFormData && companyFormData) {
      setLoading(false);
    }
  }, [extendedProfile, personalFormData, companyFormData]);

  return {
    loading,
    profileData: {
      profile: extendedProfile,
      email: profileEmail,
      businessName: businessDetails?.business_name || "",
      bio: profileBio
    },
    formData: {
      personal: personalFormData,
      company: companyFormData
    },
    actions: {
      handlePersonalSubmit: handlePersonalFormSubmit,
      handleCompanySubmit,
      refreshProfile
    },
    state: {
      savingPersonal,
      savingCompany
    }
  };
};
