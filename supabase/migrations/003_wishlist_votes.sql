-- Create wishlist_votes table
CREATE TABLE IF NOT EXISTS public.wishlist_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood text NOT NULL,
  category text NOT NULL,
  vote_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.wishlist_votes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.wishlist_votes FOR SELECT USING (true);

-- Allow public update access (we let anyone increment the vote count)
CREATE POLICY "Allow public update access" ON public.wishlist_votes FOR UPDATE USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON public.wishlist_votes FOR INSERT WITH CHECK (true);

-- Seed initial realistic vote counts
INSERT INTO public.wishlist_votes (neighborhood, category, vote_count) VALUES
('Downtown', '🛣️ Road Repairs', 234),
('Cloverdale', '🛣️ Road Repairs', 89),
('Garden District', '🛣️ Road Repairs', 112),
('Mobile Heights', '🛣️ Road Repairs', 245),
('Old Cloverdale', '🛣️ Road Repairs', 78),
('Capitol Heights', '🛣️ Road Repairs', 189),

('Mobile Heights', '🔦 Better Street Lighting', 167),
('Downtown', '🔦 Better Street Lighting', 145),
('Cloverdale', '🔦 Better Street Lighting', 67),
('Highland Park', '🔦 Better Street Lighting', 134),
('Chisholm', '🔦 Better Street Lighting', 98),

('Garden District', '🌳 More Green Spaces', 156),
('Old Cloverdale', '🌳 More Green Spaces', 123),
('Cloverdale', '🌳 More Green Spaces', 94),
('Downtown', '🌳 More Green Spaces', 88),

('Downtown', '🚶 Safer Crosswalks', 210),
('Cloverdale', '🚶 Safer Crosswalks', 145),
('Garden District', '🚶 Safer Crosswalks', 98),

('Mobile Heights', '🧹 Cleaner Streets', 178),
('Chisholm', '🧹 Cleaner Streets', 134),
('Downtown', '🧹 Cleaner Streets', 112),

('Highland Park', '🚌 Better Public Transit', 145),
('Chisholm', '🚌 Better Public Transit', 112),
('Mobile Heights', '🚌 Better Public Transit', 105),
('Downtown', '🚌 Better Public Transit', 267);
