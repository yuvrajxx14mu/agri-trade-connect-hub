
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  BusinessDetails, 
  ExtendedBusinessData, 
  CompanyFormData,
  UpdateBusinessExtendedDataParams,
  BusinessExtendedDataResponse,
  RPCVoidResponse,
  GetBusinessExtendedDataParams
} from "@/types/trader";
import {
  fetchBusinessDetails,
  fetchExtendedBusinessData,
  updateBusinessDetails,
  createBusinessDetails,
  updateExtendedBusinessData
} from "@/services/businessService";
import {
  createDefaultExtendedData,
  createEmptyCompanyFormData,
  mapBusinessToCompanyForm,
  mapCompanyFormToBusinessDetails,
  mapCompanyFormToExtendedData
} from "@/utils/businessDataUtils";

export const useBusinessData = (userId?: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [extendedBusinessData, setExtendedBusinessData] = useState<ExtendedBusinessData>(createDefaultExtendedData());
  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>(createEmptyCompanyFormData());

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      if (!userId) return;
      
      const { data: businessData, error: businessError } = await fetchBusinessDetails(userId);
      
      if (!businessError && businessData) {
        setBusinessDetails(businessData);
        
        try {
          const { data, error: extBusinessError } = await fetchExtendedBusinessData(businessData.id || '');
            
          if (!extBusinessError && data) {
            const extendedData: ExtendedBusinessData = {
              designation: data.designation || 'Director of Procurement',
              description: data.description || '',
              areas: data.areas || ''
            };
            setExtendedBusinessData(extendedData);
            setCompanyFormData(mapBusinessToCompanyForm(businessData, extendedData));
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
    const defaultExtendedData = createDefaultExtendedData();
    setExtendedBusinessData(defaultExtendedData);
    setCompanyFormData(mapBusinessToCompanyForm(businessData, defaultExtendedData));
  };

  const setupEmptyBusinessData = () => {
    setBusinessDetails(null);
    const defaultNewBusinessData = createDefaultExtendedData();
    setExtendedBusinessData(defaultNewBusinessData);
    setCompanyFormData(createEmptyCompanyFormData());
  };

  const handleCompanySubmit = async (data: CompanyFormData) => {
    if (!userId) return;
    
    setSavingCompany(true);
    try {
      if (businessDetails?.id) {
        const businessData = {
          business_name: data.companyName,
          business_type: 'Trading',
          business_address: data.companyAddress,
          gst_number: data.gstin,
          registration_number: data.tradeLicense,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await updateBusinessDetails(businessDetails.id, businessData);
        
        if (error) throw error;
        
        try {
          const params: UpdateBusinessExtendedDataParams = { 
            business_id: businessDetails.id || '', 
            designation_text: data.designation,
            description_text: data.businessDescription,
            areas_text: data.operationalAreas
          };
          
          const { error: extError } = await updateExtendedBusinessData(params);
          
          if (!extError) {
            const extendedData = mapCompanyFormToExtendedData(data);
            setExtendedBusinessData(extendedData);
            setCompanyFormData(data);
          }
        } catch (extError) {
          console.error('Error updating extended business data:', extError);
        }
      } else {
        const businessData = mapCompanyFormToBusinessDetails(data, userId);
        
        if (!businessData.business_name) {
          throw new Error("Business name is required");
        }
        
        const { data: newBusiness, error } = await createBusinessDetails(businessData);
        
        if (error) throw error;
        
        if (newBusiness && newBusiness.length > 0) {
          const newBusinessData: BusinessDetails = newBusiness[0];
          setBusinessDetails(newBusinessData);
          
          try {
            const params: UpdateBusinessExtendedDataParams = { 
              business_id: newBusinessData.id || '', 
              designation_text: data.designation,
              description_text: data.businessDescription,
              areas_text: data.operationalAreas
            };
            
            const { error: extError } = await updateExtendedBusinessData(params);
            
            if (!extError) {
              const extendedData = mapCompanyFormToExtendedData(data);
              setExtendedBusinessData(extendedData);
              setCompanyFormData(data);
            }
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
