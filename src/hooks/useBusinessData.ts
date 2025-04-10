import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BusinessDetails, 
  ExtendedBusinessData, 
  CompanyFormData,
  BusinessExtendedDataResponse,
  RPCVoidResponse,
  GetBusinessExtendedDataParams,
  UpdateBusinessExtendedDataParams
} from "@/types/trader";

export const useBusinessData = (userId?: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [extendedBusinessData, setExtendedBusinessData] = useState<ExtendedBusinessData>({
    designation: 'Director of Procurement',
    description: '',
    areas: ''
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

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      if (!userId) return;
      
      const { data: businessData, error: businessError } = await supabase
        .from('business_details')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!businessError && businessData) {
        setBusinessDetails(businessData);
        
        try {
          const params: GetBusinessExtendedDataParams = { b_id: businessData.id };
          const { data, error: extBusinessError } = await supabase
            .rpc('get_business_extended_data', params)
            .returns<BusinessExtendedDataResponse>();
            
          if (!extBusinessError && data) {
            const extendedData: ExtendedBusinessData = {
              designation: data.designation || 'Director of Procurement',
              description: data.description || '',
              areas: data.areas || ''
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
      console.error('Error fetching business data:', error);
      toast({
        title: "Error",
        description: "Failed to load business data",
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

  const handleCompanySubmit = async (data: CompanyFormData) => {
    if (!userId) return;
    
    setSavingCompany(true);
    try {
      const businessData: BusinessDetails = {
        user_id: userId,
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
          const params: UpdateBusinessExtendedDataParams = { 
            business_id: businessDetails.id, 
            designation_text: data.designation,
            description_text: data.businessDescription,
            areas_text: data.operationalAreas
          };
          
          await supabase.rpc('update_business_extended_data', params)
            .returns<RPCVoidResponse>();
          
          const extendedData: ExtendedBusinessData = {
            designation: data.designation,
            description: data.businessDescription,
            areas: data.operationalAreas
          };
          setExtendedBusinessData(extendedData);
          
          setCompanyFormData(data);
        } catch (extError) {
          console.error('Error updating extended business data:', extError);
        }
      } else {
        const { data: newBusiness, error } = await supabase
          .from('business_details')
          .insert({
            user_id: userId,
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
            const params: UpdateBusinessExtendedDataParams = { 
              business_id: newBusinessData.id, 
              designation_text: data.designation,
              description_text: data.businessDescription,
              areas_text: data.operationalAreas
            };
            
            await supabase.rpc('update_business_extended_data', params)
              .returns<RPCVoidResponse>();
            
            const extendedData: ExtendedBusinessData = {
              designation: data.designation,
              description: data.businessDescription,
              areas: data.operationalAreas
            };
            setExtendedBusinessData(extendedData);
            
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
    if (userId) {
      fetchBusinessData();
    }
  }, [userId]);

  return {
    loading,
    businessDetails,
    companyFormData,
    savingCompany,
    fetchBusinessData,
    handleCompanySubmit
  };
};
