-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.shipments;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.reports;

-- Drop related functions
DROP FUNCTION IF EXISTS public.get_user_messages(UUID);
DROP FUNCTION IF EXISTS public.get_conversation_messages(UUID, UUID); 