-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Allow anyone to view post images (public bucket)
CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update post images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images');

-- Allow authenticated users to delete post images
CREATE POLICY "Authenticated users can delete post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-images');