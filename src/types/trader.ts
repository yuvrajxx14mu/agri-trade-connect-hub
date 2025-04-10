
export interface ExtendedProfileData {
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

export interface BusinessDetails {
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

export interface ExtendedBusinessData {
  designation: string;
  description: string;
  areas: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

export interface CompanyFormData {
  companyName: string;
  designation: string;
  gstin: string;
  tradeLicense: string;
  companyAddress: string;
  businessDescription: string;
  operationalAreas: string;
}

// Supabase RPC function response types
export interface TraderBioResponse {
  bio_text?: string;
}

export interface BusinessExtendedDataResponse {
  designation?: string;
  description?: string;
  areas?: string;
}
