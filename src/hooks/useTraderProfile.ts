
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@/components/trader/PersonalInfoForm";
import { CompanyFormData } from "@/components/trader/CompanyDetailsForm";

interface ExtendedProfileData {
  id: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  email?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface BusinessDetails {
  id?: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_email?: string;
  business_phone?: string;
  business_website?: string;
  business_address: string;
  gst_number?: string;
  registration_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExtendedBusinessData {
  designation: string;
  description: string;
  areas: string;
}

export const useTraderProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfileData | null>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [extendedBusinessData, setExtendedBusinessData] = useState<ExtendedBusinessData>({
    designation: 'Director of Procurement',
    description: '',
    areas: ''
  });
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
  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>({
    companyName: '',
    designation: 'Director of Procurement',
    gstin: '',
    tradeLicense: '',
    companyAddress: '',
    businessDescription: '',
    operationalAreas: ''
  });

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (!profile?.id) return;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (profileError) throw profileError;

      setExtendedProfile({
        ...profileData,
        bio: ""
      });
      
      try {
        const { data: extendedData, error: extendedError } = await supabase
          .rpc('get_trader_bio', { user_id: profile.id });
        
        if (!extendedError && extendedData) {
          setProfileBio(extendedData || "");
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
      
      const { data: businessData, error: businessError } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (!businessError && businessData) {
        setBusinessDetails(businessData);
        
        try {
          const { data: extBizData, error: extBusinessError } = await supabase
            .rpc('get_business_extended_data', { b_id: businessData.id });
            
          if (!extBusinessError && extBizData) {
            const extendedData: ExtendedBusinessData = {
              designation: extBizData.designation || 'Director of Procurement',
              description: extBizData.description || '',
              areas: extBizData.areas || ''
            };
            setExtendedBusinessData(extendedData);
            
            const newCompanyForm: CompanyFormData = {
              companyName: businessData.business_name || '',
              designation: extendedData.designation,
              gstin: businessData.gst_number || '',
              tradeLicense: businessData.registration_number || '',
              companyAddress: businessData.business_address || '',
              businessDescription: extendedData.description,
              operationalAreas: extendedData.areas
            };
            
            setCompanyFormData(newCompanyForm);
          } else {
            setupDefaultBusinessData(businessData);
          }
        } catch (extError) {
          console.error('Error fetching extended business data:', extError);
          setupDefaultBusinessData(businessData);
        }
      } else {
        setupEmptyBusinessData();
      }
      
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

  const setupDefaultBusinessData = (businessData: BusinessDetails) => {
    const defaultExtendedData: ExtendedBusinessData = {
      designation: 'Director of Procurement',
      description: '',
      areas: ''
    };
    setExtendedBusinessData(defaultExtendedData);
    
    const newCompanyForm: CompanyFormData = {
      companyName: businessData.business_name || '',
      designation: defaultExtendedData.designation,
      gstin: businessData.gst_number || '',
      tradeLicense: businessData.registration_number || '',
      companyAddress: businessData.business_address || '',
      businessDescription: defaultExtendedData.description,
      operationalAreas: defaultExtendedData.areas
    };
    
    setCompanyFormData(newCompanyForm);
  };

  const setupEmptyBusinessData = () => {
    setBusinessDetails(null);
    const defaultNewBusinessData: ExtendedBusinessData = {
      designation: 'Director of Procurement',
      description: '',
      areas: ''
    };
    setExtendedBusinessData(defaultNewBusinessData);
    
    const newCompanyForm: CompanyFormData = {
      companyName: '',
      designation: defaultNewBusinessData.designation,
      gstin: '',
      tradeLicense: '',
      companyAddress: '',
      businessDescription: '',
      operationalAreas: ''
    };
    
    setCompanyFormData(newCompanyForm);
  };
  
  const handlePersonalSubmit = async (data: ProfileFormData) => {
    if (!profile?.id) return;
    
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
        .eq('id', profile.id);
      
      if (error) throw error;
      
      try {
        await supabase.rpc('update_trader_bio', { 
          user_id: profile.id, 
          bio_text: data.bio 
        });
        setProfileBio(data.bio);
      } catch (bioError) {
        console.error('Error updating bio:', bioError);
      }
      
      updateProfile({
        ...profile,
        name: fullName,
        phone: data.phone
      });
      
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
  
  const handleCompanySubmit = async (data: CompanyFormData) => {
    if (!profile?.id) return;
    
    setSavingCompany(true);
    try {
      const businessData: BusinessDetails = {
        user_id: profile.id,
        business_name: data.companyName,
        business_type: 'Trading',
        business_address: data.companyAddress,
        gst_number: data.gstin,
        registration_number: data.tradeLicense,
        updated_at: new Date().toISOString()
      };
      
      if (businessDetails?.id) {
        const { error } = await supabase
          .from('business_details')
          .update({
            business_name: data.companyName,
            business_type: 'Trading',
            business_address: data.companyAddress,
            gst_number: data.gstin,
            registration_number: data.tradeLicense,
            updated_at: new Date().toISOString()
          })
          .eq('id', businessDetails.id);
        
        if (error) throw error;
        
        try {
          await supabase.rpc('update_business_extended_data', { 
            business_id: businessDetails.id, 
            designation_text: data.designation,
            description_text: data.businessDescription,
            areas_text: data.operationalAreas
          });
          
          const extendedData: ExtendedBusinessData = {
            designation: data.designation,
            description: data.businessDescription,
            areas: data.operationalAreas
          };
          setExtendedBusinessData(extendedData);
          
          // Update company form data state
          setCompanyFormData(data);
        } catch (extError) {
          console.error('Error updating extended business data:', extError);
        }
      } else {
        const { data: newBusiness, error } = await supabase
          .from('business_details')
          .insert({
            user_id: profile.id,
            business_name: data.companyName,
            business_type: 'Trading',
            business_address: data.companyAddress,
            gst_number: data.gstin,
            registration_number: data.tradeLicense
          })
          .select();
        
        if (error) throw error;
        
        if (newBusiness && newBusiness.length > 0) {
          const newBusinessData: BusinessDetails = newBusiness[0];
          setBusinessDetails(newBusinessData);
          
          try {
            await supabase.rpc('update_business_extended_data', { 
              business_id: newBusinessData.id, 
              designation_text: data.designation,
              description_text: data.businessDescription,
              areas_text: data.operationalAreas
            });
            
            const extendedData: ExtendedBusinessData = {
              designation: data.designation,
              description: data.businessDescription,
              areas: data.operationalAreas
            };
            setExtendedBusinessData(extendedData);
            
            // Update company form data state
            setCompanyFormData(data);
          } catch (extError) {
            console.error('Extended business data function not available:', extError);
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      console.error('Error updating business details:', error);
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive"
      });
    } finally {
      setSavingCompany(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchProfileData();
    }
  }, [profile?.id]);

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
      handlePersonalSubmit,
      handleCompanySubmit,
      refreshProfile: fetchProfileData
    },
    state: {
      savingPersonal,
      savingCompany
    }
  };
};
