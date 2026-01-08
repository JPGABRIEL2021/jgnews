-- Fix push_subscriptions RLS: Require authentication for creating subscriptions

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON push_subscriptions;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can create subscriptions" 
  ON push_subscriptions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

-- Drop and recreate SELECT policy to require authentication
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;

CREATE POLICY "Users can view their own subscriptions" 
  ON push_subscriptions 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Update DELETE policy to require authentication  
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON push_subscriptions;

CREATE POLICY "Users can delete their own subscriptions" 
  ON push_subscriptions 
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);