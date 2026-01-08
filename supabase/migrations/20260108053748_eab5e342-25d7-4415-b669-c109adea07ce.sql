-- Fix push_subscriptions RLS: Remove access to NULL user_id subscriptions to prevent data exposure

-- Drop and recreate SELECT policy - only allow users to view their OWN subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;

CREATE POLICY "Users can view their own subscriptions" 
  ON push_subscriptions 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Update DELETE policy - only allow users to delete their OWN subscriptions  
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON push_subscriptions;

CREATE POLICY "Users can delete their own subscriptions" 
  ON push_subscriptions 
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Update INSERT policy - require user_id to match authenticated user
DROP POLICY IF EXISTS "Authenticated users can create subscriptions" ON push_subscriptions;

CREATE POLICY "Authenticated users can create subscriptions" 
  ON push_subscriptions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());