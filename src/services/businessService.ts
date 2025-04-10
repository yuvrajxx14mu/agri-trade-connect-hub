
import { supabase } from "@/integrations/supabase/client";
import { 
  BusinessDetails, 
  ExtendedBusinessData, 
  BusinessExtendedDataResponse,
  RPCVoidResponse,
  GetBusinessExtendedDataParams,
  UpdateBusinessExtendedDataParams
} from "@/types/trader";

export async function fetchBusinessDetails(userId: string) {
  return await supabase
    .from('business_details')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function fetchExtendedBusinessData(businessId: string) {
  const params: GetBusinessExtendedDataParams = { b_id: businessId };
  
  // Use rpc with explicit any type to bypass TypeScript constraints
  const { data, error } = await supabase
    .rpc<any>('get_business_extended_data', params);
    
  return { 
    data: data as BusinessExtendedDataResponse, 
    error 
  };
}

export async function updateBusinessDetails(businessId: string, businessData: Partial<BusinessDetails>) {
  return await supabase
    .from('business_details')
    .update(businessData)
    .eq('id', businessId);
}

export async function createBusinessDetails(businessData: BusinessDetails) {
  return await supabase
    .from('business_details')
    .insert(businessData)
    .select();
}

export async function updateExtendedBusinessData(params: UpdateBusinessExtendedDataParams) {
  // Use rpc with explicit any type to bypass TypeScript constraints
  const { data, error } = await supabase
    .rpc<any>('update_business_extended_data', params);
    
  return { 
    data: data as RPCVoidResponse, 
    error 
  };
}
