-- BabyAssist AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT NOT NULL,
    area TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mothers table
CREATE TABLE public.mothers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 12 AND age <= 60),
    mobile TEXT NOT NULL,
    address TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('high', 'medium', 'low')),
    pregnancy_week INTEGER CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
    last_visit DATE NOT NULL,
    children_count INTEGER NOT NULL DEFAULT 0 CHECK (children_count >= 0),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE public.children (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    age_in_months INTEGER NOT NULL CHECK (age_in_months >= 0 AND age_in_months <= 60),
    mother_id UUID NOT NULL REFERENCES public.mothers(id) ON DELETE CASCADE,
    health_status TEXT NOT NULL CHECK (health_status IN ('good', 'needs_attention', 'critical')),
    last_screening DATE NOT NULL,
    vaccinations_completed INTEGER NOT NULL DEFAULT 0 CHECK (vaccinations_completed >= 0),
    vaccinations_total INTEGER NOT NULL DEFAULT 18 CHECK (vaccinations_total >= 0),
    has_photo BOOLEAN NOT NULL DEFAULT false,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits table
CREATE TABLE public.visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mother_id UUID REFERENCES public.mothers(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('prenatal', 'postnatal', 'child', 'screening')),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mothers_user_id ON public.mothers(user_id);
CREATE INDEX idx_mothers_risk_level ON public.mothers(risk_level);
CREATE INDEX idx_children_user_id ON public.children(user_id);
CREATE INDEX idx_children_mother_id ON public.children(mother_id);
CREATE INDEX idx_children_age ON public.children(age_in_months);
CREATE INDEX idx_visits_user_id ON public.visits(user_id);
CREATE INDEX idx_visits_date ON public.visits(visit_date);
CREATE INDEX idx_visits_status ON public.visits(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mothers_updated_at BEFORE UPDATE ON public.mothers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

-- Mothers policies
CREATE POLICY "Users can view own mothers" ON public.mothers FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can insert own mothers" ON public.mothers FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own mothers" ON public.mothers FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own mothers" ON public.mothers FOR DELETE USING (user_id::text = auth.uid()::text);

-- Children policies
CREATE POLICY "Users can view own children" ON public.children FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can insert own children" ON public.children FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own children" ON public.children FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own children" ON public.children FOR DELETE USING (user_id::text = auth.uid()::text);

-- Visits policies
CREATE POLICY "Users can view own visits" ON public.visits FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can insert own visits" ON public.visits FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own visits" ON public.visits FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own visits" ON public.visits FOR DELETE USING (user_id::text = auth.uid()::text);

-- Insert sample data for testing
INSERT INTO public.users (name, email, mobile, area) VALUES 
('Priya Nair', 'priya@babyassist.local', '9876543210', 'Kochi District'),
('Sunita Sharma', 'sunita@babyassist.local', '9876543211', 'Ernakulam District'),
('Lakshmi Devi', 'lakshmi@babyassist.local', '9876543212', 'Thrissur District');

-- Insert sample mothers
INSERT INTO public.mothers (name, age, mobile, address, risk_level, pregnancy_week, last_visit, children_count, user_id) VALUES 
('Meera Devi', 24, '9876543210', 'Kakkanad, Kochi', 'high', 32, '2024-01-15', 1, (SELECT id FROM public.users WHERE mobile = '9876543210')),
('Sunita Sharma', 28, '9876543211', 'Edapally, Kochi', 'medium', NULL, '2024-01-14', 2, (SELECT id FROM public.users WHERE mobile = '9876543210')),
('Lakshmi Nair', 22, '9876543212', 'Palarivattom, Kochi', 'low', 28, '2024-01-13', 0, (SELECT id FROM public.users WHERE mobile = '9876543210'));

-- Insert sample children
INSERT INTO public.children (name, age_in_months, mother_id, health_status, last_screening, vaccinations_completed, vaccinations_total, has_photo, user_id) VALUES 
('Arjun Nair', 8, (SELECT id FROM public.mothers WHERE name = 'Lakshmi Nair'), 'good', '2024-01-10', 6, 8, true, (SELECT id FROM public.users WHERE mobile = '9876543210')),
('Kavya Sharma', 24, (SELECT id FROM public.mothers WHERE name = 'Sunita Sharma'), 'needs_attention', '2024-01-08', 12, 14, true, (SELECT id FROM public.users WHERE mobile = '9876543210')),
('Ravi Kumar', 48, (SELECT id FROM public.mothers WHERE name = 'Meera Devi'), 'good', '2024-01-12', 18, 18, false, (SELECT id FROM public.users WHERE mobile = '9876543210'));

-- Insert sample visits
INSERT INTO public.visits (user_id, mother_id, visit_date, visit_type, status, notes) VALUES 
((SELECT id FROM public.users WHERE mobile = '9876543210'), (SELECT id FROM public.mothers WHERE name = 'Meera Devi'), '2024-01-20', 'prenatal', 'scheduled', 'Regular checkup'),
((SELECT id FROM public.users WHERE mobile = '9876543210'), (SELECT id FROM public.mothers WHERE name = 'Sunita Sharma'), '2024-01-20', 'postnatal', 'scheduled', 'Post-delivery follow-up'); 