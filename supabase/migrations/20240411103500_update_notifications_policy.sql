-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own notifications
CREATE POLICY "Users can read their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to create notifications for others
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for users to update their own notifications (e.g., marking as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id); 