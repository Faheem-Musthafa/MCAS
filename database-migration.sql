-- Fix production issue: Remove NOT NULL constraint from date column
-- Run this SQL in your Supabase SQL Editor or database console

-- Make the date column nullable to match our updated application code
ALTER TABLE events ALTER COLUMN date DROP NOT NULL;

-- Optional: You can also set existing NULL dates to empty string if needed
-- UPDATE events SET date = '' WHERE date IS NULL;

-- Verify the change
-- SELECT column_name, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'events' AND column_name = 'date';