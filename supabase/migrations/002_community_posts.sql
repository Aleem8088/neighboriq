-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  details text NOT NULL,
  location text NOT NULL,
  urgency text NOT NULL,
  contact text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.community_posts FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON public.community_posts FOR INSERT WITH CHECK (true);

-- Seed initial community posts
INSERT INTO public.community_posts (category, title, details, location, urgency, contact, image_url) VALUES
('Safety Alert', 'Power outage in Garden District', 'Lost power around 2 hours ago. My elderly mother uses an oxygen machine, does anyone have a portable generator we could borrow for a few hours?', 'Garden District', 'Urgent', '555-0192', 'https://images.unsplash.com/photo-1621614917454-e91ddba4b54e?q=80&w=2000&auto=format&fit=crop'),
('Volunteer Needed', 'Cloverdale Park Cleanup', 'Organizing a quick weekend trash pickup. Bringing bags and gloves, just need more hands!', 'Cloverdale Park', 'Normal', 'Email me at cleanup@example.com', 'https://images.unsplash.com/photo-1618477461853-cf6ed80f488f?q=80&w=2000&auto=format&fit=crop'),
('Emergency Help', 'Lost elder with dementia', 'My grandfather wandered off around 2pm wearing a blue jacket. He has dementia and may be confused. Please keep an eye out and call me immediately if spotted.', 'Near Dexter Ave and Decatur St', 'Critical', '555-0100', 'https://images.unsplash.com/photo-1549495447-0eab8667dc97?q=80&w=2000&auto=format&fit=crop'),
('Resource Share', 'Extra baby formula available', 'Switched brands, I have 2 unopened cans of Similac infant formula (expires next year). Happy to give to a family in need.', 'Downtown area', 'Normal', 'Message me here or text 555-0811', 'https://images.unsplash.com/photo-1518175027878-953b1bce21d0?q=80&w=2000&auto=format&fit=crop');
