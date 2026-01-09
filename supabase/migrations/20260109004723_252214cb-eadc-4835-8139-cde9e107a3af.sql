-- Fix newsletter_subscribers security issues

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can update subscriptions" ON newsletter_subscribers;

-- Create proper admin-only SELECT policy (admins need to see subscribers to send newsletters)
CREATE POLICY "Admins can view all subscribers"
ON newsletter_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow users to update only their own subscription by email (for unsubscribe links)
-- This uses a secure pattern where the email must match
CREATE POLICY "Users can update their own subscription by email"
ON newsletter_subscribers
FOR UPDATE
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Fix news_collection_logs - restrict to admin only
DROP POLICY IF EXISTS "Anyone can read logs" ON news_collection_logs;

CREATE POLICY "Admins can read logs"
ON news_collection_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add UPDATE policy for push_subscriptions (info level but good to fix)
CREATE POLICY "Users can update their own subscriptions"
ON push_subscriptions
FOR UPDATE
USING (user_id = auth.uid());