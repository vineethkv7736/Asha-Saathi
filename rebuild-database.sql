-- Rebuild Database Script for Supabase Auth Integration

-- 1. Drop existing users table (since we'll use Supabase Auth)
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Drop related tables that might reference users
DROP TABLE IF EXISTS public.screenings CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.mothers CASCADE;

-- 3. Create mothers table (no user_id dependency)
CREATE TABLE public.mothers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    mobile TEXT,
    address TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    pregnancy_week INTEGER,
    last_visit DATE,
    children_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create children table
CREATE TABLE public.children (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    mother_id UUID REFERENCES public.mothers(id) ON DELETE CASCADE,
    age_in_months INTEGER,
    health_status TEXT CHECK (health_status IN ('healthy', 'needs_attention', 'critical')),
    last_screening DATE,
    vaccinations_completed INTEGER DEFAULT 0,
    vaccinations_total INTEGER DEFAULT 0,
    has_photo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create visits table
CREATE TABLE public.visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mother_id UUID REFERENCES public.mothers(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_type TEXT CHECK (visit_type IN ('prenatal', 'postnatal', 'screening', 'vaccination')),
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create screenings table
CREATE TABLE public.screenings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID NOT NULL,
    person_type TEXT CHECK (person_type IN ('mother', 'child')) NOT NULL,
    image_url TEXT,
    analysis_results JSONB NOT NULL,
    analysis_type TEXT CHECK (analysis_type IN ('skin', 'posture', 'general', 'combined')) NOT NULL,
    condition TEXT,
    notes TEXT,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create examinations table
CREATE TABLE public.examinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID NOT NULL,
    person_type TEXT CHECK (person_type IN ('mother', 'child')) NOT NULL,
    answers JSONB NOT NULL,
    bmi DECIMAL(5,2),
    bmi_category TEXT CHECK (bmi_category IN ('underweight', 'normal', 'overweight', 'obese')),
    health_status TEXT CHECK (health_status IN ('healthy', 'needs_attention', 'critical')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create vaccinations table
CREATE TABLE public.vaccinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    bcg BOOLEAN DEFAULT FALSE,
    opv_0 BOOLEAN DEFAULT FALSE,
    hepatitis_b BOOLEAN DEFAULT FALSE,
    pentavalent_1 BOOLEAN DEFAULT FALSE,
    rotavirus_1 BOOLEAN DEFAULT FALSE,
    measles_rubella_1 BOOLEAN DEFAULT FALSE,
    total_vaccines INTEGER DEFAULT 6,
    completed_vaccines INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mothers_updated_at BEFORE UPDATE ON public.mothers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screenings_updated_at BEFORE UPDATE ON public.screenings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examinations_updated_at BEFORE UPDATE ON public.examinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON public.vaccinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.mothers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies (allow all authenticated users to access all data)
CREATE POLICY "Allow authenticated users to read mothers" ON public.mothers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert mothers" ON public.mothers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update mothers" ON public.mothers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete mothers" ON public.mothers
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read children" ON public.children
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert children" ON public.children
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update children" ON public.children
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete children" ON public.children
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read visits" ON public.visits
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert visits" ON public.visits
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update visits" ON public.visits
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete visits" ON public.visits
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read screenings" ON public.screenings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert screenings" ON public.screenings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update screenings" ON public.screenings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete screenings" ON public.screenings
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read examinations" ON public.examinations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert examinations" ON public.examinations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update examinations" ON public.examinations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete examinations" ON public.examinations
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read vaccinations" ON public.vaccinations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert vaccinations" ON public.vaccinations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vaccinations" ON public.vaccinations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete vaccinations" ON public.vaccinations
    FOR DELETE USING (auth.role() = 'authenticated');

-- 10. Insert sample data
INSERT INTO public.mothers (name, age, mobile, address, risk_level, pregnancy_week, last_visit, children_count) VALUES
('Priya Thomas', 28, '9876543210', 'Kochi, Kerala', 'low', 24, '2024-01-15', 1),
('Anjali Kumar', 32, '9876543211', 'Thrissur, Kerala', 'medium', 18, '2024-01-10', 2),
('Sneha Pillai', 25, '9876543212', 'Kottayam, Kerala', 'high', 32, '2024-01-20', 0),
('Meera Nair', 29, '9876543213', 'Alappuzha, Kerala', 'low', 12, '2024-01-05', 1);

INSERT INTO public.children (name, mother_id, age_in_months, health_status, last_screening, vaccinations_completed, vaccinations_total, has_photo) VALUES
('Aarav Thomas', (SELECT id FROM public.mothers WHERE name = 'Priya Thomas'), 6, 'healthy', '2024-01-10', 4, 6, TRUE),
('Zara Kumar', (SELECT id FROM public.mothers WHERE name = 'Anjali Kumar'), 12, 'healthy', '2024-01-05', 8, 10, TRUE),
('Vivaan Kumar', (SELECT id FROM public.mothers WHERE name = 'Anjali Kumar'), 24, 'needs_attention', '2024-01-08', 12, 15, FALSE),
('Aisha Pillai', (SELECT id FROM public.mothers WHERE name = 'Sneha Pillai'), 3, 'healthy', '2024-01-15', 2, 4, TRUE),
('Arjun Nair', (SELECT id FROM public.mothers WHERE name = 'Meera Nair'), 9, 'healthy', '2024-01-12', 6, 8, TRUE);

INSERT INTO public.visits (mother_id, visit_date, visit_type, status, notes) VALUES
((SELECT id FROM public.mothers WHERE name = 'Priya Thomas'), '2024-01-25', 'prenatal', 'scheduled', 'Regular checkup'),
((SELECT id FROM public.mothers WHERE name = 'Anjali Kumar'), '2024-01-26', 'postnatal', 'scheduled', 'Follow-up visit'),
((SELECT id FROM public.mothers WHERE name = 'Sneha Pillai'), '2024-01-24', 'prenatal', 'completed', 'High-risk monitoring'),
((SELECT id FROM public.mothers WHERE name = 'Meera Nair'), '2024-01-27', 'screening', 'scheduled', 'First trimester screening');

-- 11. Insert sample screening data
INSERT INTO public.screenings (person_id, person_type, analysis_results, risk_level, notes) VALUES
((SELECT id FROM public.mothers WHERE name = 'Priya Thomas'), 'mother', 
 '{"bloodPressure": "120/80 mmHg", "weight": "65 kg", "skinTone": "Normal", "edema": "Not detected", "anemia": "Not detected", "overallHealth": "Good"}', 
 'low', 'Regular maternal screening - all parameters normal'),
((SELECT id FROM public.children WHERE name = 'Aarav Thomas'), 'child', 
 '{"height": "68 cm", "weight": "7.2 kg", "skinTone": "Normal", "jaundice": "Not detected", "anemia": "Mild signs detected", "eyeCondition": "Normal", "spinalAlignment": "Normal", "overallHealth": "Good"}', 
 'low', '6-month screening - mild anemia signs detected, monitor iron levels');

-- 12. Verify the setup
SELECT 'Database rebuilt successfully!' as status;
SELECT COUNT(*) as mothers_count FROM public.mothers;
SELECT COUNT(*) as children_count FROM public.children;
SELECT COUNT(*) as visits_count FROM public.visits;
SELECT COUNT(*) as screenings_count FROM public.screenings; 