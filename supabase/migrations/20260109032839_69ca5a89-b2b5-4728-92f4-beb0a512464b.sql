-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
BEGIN
  -- Convert to lowercase, remove accents, replace non-alphanumeric with hyphens
  base_slug := lower(title);
  base_slug := unaccent(base_slug);
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  
  RETURN base_slug;
END;
$$;

-- Function to ensure slug is unique
CREATE OR REPLACE FUNCTION public.ensure_unique_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
  slug_exists boolean;
BEGIN
  -- If slug is empty or null, generate from title
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.generate_slug(NEW.title);
  ELSE
    base_slug := NEW.slug;
  END IF;
  
  new_slug := base_slug;
  
  -- Check if slug exists (excluding current record on update)
  LOOP
    IF TG_OP = 'UPDATE' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.posts 
        WHERE slug = new_slug AND id != NEW.id
      ) INTO slug_exists;
    ELSE
      SELECT EXISTS(
        SELECT 1 FROM public.posts 
        WHERE slug = new_slug
      ) INTO slug_exists;
    END IF;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$;

-- Create trigger to run before insert or update
DROP TRIGGER IF EXISTS ensure_unique_slug_trigger ON public.posts;
CREATE TRIGGER ensure_unique_slug_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_unique_slug();