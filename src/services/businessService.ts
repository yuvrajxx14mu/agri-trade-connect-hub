
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
  
  // Use rpc without type parameters and cast the result
  const { data, error } = await supabase
    .rpc('get_business_extended_data', params);
    
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
  // Use rpc without type parameters and cast the result
  const { data, error } = await supabase
    .rpc('update_business_extended_data', params);
    
  return { 
    data: data as RPCVoidResponse, 
    error 
  };
}
