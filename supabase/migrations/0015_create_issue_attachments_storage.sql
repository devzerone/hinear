-- Create storage bucket for issue attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'issue-attachments',
  'issue-attachments',
  true, -- Public bucket for image access
  10485760, -- 10MB limit per file
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for issue-attachments bucket

-- Allow authenticated users to select (view) attachments
-- Access is controlled through the bucket's public setting
CREATE POLICY "attachments_select_for_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'issue-attachments');

-- Allow authenticated users to insert (upload) attachments
CREATE POLICY "attachments_insert_for_authenticated"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'issue-attachments');

-- Allow authenticated users to delete attachments
CREATE POLICY "attachments_delete_for_authenticated"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'issue-attachments');
