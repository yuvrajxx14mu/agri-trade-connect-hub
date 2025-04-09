
-- Create a function to get messages for a user
CREATE OR REPLACE FUNCTION public.get_user_messages(user_id UUID)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    read BOOLEAN,
    created_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, sender_id, receiver_id, content, read, created_at
    FROM public.messages
    WHERE sender_id = user_id OR receiver_id = user_id
    ORDER BY created_at DESC;
$$;

-- Create a function to get conversation messages
CREATE OR REPLACE FUNCTION public.get_conversation_messages(user1_id UUID, user2_id UUID)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    read BOOLEAN,
    created_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, sender_id, receiver_id, content, read, created_at
    FROM public.messages
    WHERE (sender_id = user1_id AND receiver_id = user2_id)
       OR (sender_id = user2_id AND receiver_id = user1_id)
    ORDER BY created_at ASC;
$$;

-- Create a function to get a user's price alerts
CREATE OR REPLACE FUNCTION public.get_user_price_alerts(user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    product_name TEXT,
    condition TEXT,
    target_price NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, user_id, product_name, condition, target_price, status, created_at
    FROM public.price_alerts
    WHERE user_id = user_id
    ORDER BY created_at DESC;
$$;
