
import { 
  BusinessDetails, 
  ExtendedBusinessData, 
  CompanyFormData 
} from "@/types/trader";

export function createDefaultExtendedData(): ExtendedBusinessData {
  return {
    designation: 'Director of Procurement',
    description: '',
    areas: ''
  };
}

export function createEmptyCompanyFormData(): CompanyFormData {
  return {
    companyName: '',
    designation: 'Director of Procurement',
    gstin: '',
    tradeLicense: '',
    companyAddress: '',
    businessDescription: '',
    operationalAreas: ''
  };
}

export function mapBusinessToCompanyForm(
  businessDetails: BusinessDetails, 
  extendedData: ExtendedBusinessData
): CompanyFormData {
  return {
    companyName: businessDetails.business_name || '',
    designation: extendedData.designation,
    gstin: businessDetails.gst_number || '',
    tradeLicense: businessDetails.registration_number || '',
    companyAddress: businessDetails.business_address || '',
    businessDescription: extendedData.description,
    operationalAreas: extendedData.areas
  };
}

export function mapCompanyFormToBusinessDetails(
  data: CompanyFormData, 
  userId: string
): BusinessDetails {
  return {
    user_id: userId,
    business_name: data.companyName,
    business_type: 'Trading',
    business_address: data.companyAddress,
    gst_number: data.gstin,
    registration_number: data.tradeLicense,
    updated_at: new Date().toISOString()
  };
}

export function mapCompanyFormToExtendedData(data: CompanyFormData): ExtendedBusinessData {
  return {
    designation: data.designation,
    description: data.businessDescription,
    areas: data.operationalAreas
  };
}
