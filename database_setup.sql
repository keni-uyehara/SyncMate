-- Update the users table to support dataTeamLead role
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role = ANY (ARRAY['dataTeam'::text, 'teamLead'::text, 'dataTeamLead'::text]));

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_uid TEXT REFERENCES public.users(firebase_uid),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('data_analyst', 'data_steward', 'senior_analyst', 'team_lead')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    last_active TIMESTAMP WITH TIME ZONE,
    assigned_issues INTEGER DEFAULT 0,
    performance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    member_count INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_firebase_uid ON public.team_members(firebase_uid);

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_default ON public.roles(is_default);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions, member_count, is_default) VALUES
('Data Analyst', 'Basic access to view and edit compliance issues', ARRAY['view_issues', 'edit_issues'], 0, true),
('Data Steward', 'Can view, edit, and resolve compliance issues', ARRAY['view_issues', 'edit_issues', 'resolve_issues'], 0, false),
('Senior Analyst', 'Full access including report generation and workflow management', ARRAY['view_issues', 'edit_issues', 'generate_reports', 'manage_workflows'], 0, false),
('Team Lead', 'Administrative access with role management capabilities', ARRAY['view_issues', 'edit_issues', 'resolve_issues', 'generate_reports', 'manage_workflows', 'manage_roles', 'manage_users'], 0, false)
ON CONFLICT (name) DO NOTHING;

-- Insert sample team members
INSERT INTO public.team_members (name, email, role, status, assigned_issues, performance) VALUES
('Maria Santos', 'maria.santos@company.com', 'senior_analyst', 'active', 8, 94),
('John Cruz', 'john.cruz@company.com', 'data_steward', 'active', 5, 87),
('Ana Reyes', 'ana.reyes@company.com', 'data_analyst', 'active', 3, 91),
('Carlos Mendoza', 'carlos.mendoza@company.com', 'data_steward', 'pending', 0, 0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample users (replace with your actual data team lead email)
INSERT INTO public.users (firebase_uid, email, name, role, email_verified) VALUES
('sample_datateamlead_uid', 'your-datateamlead@company.com', 'Data Team Lead', 'dataTeamLead', true)
ON CONFLICT (email) DO NOTHING;

-- Create function to update member count
CREATE OR REPLACE FUNCTION update_role_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update member count for the affected role
    UPDATE public.roles 
    SET member_count = (
        SELECT COUNT(*) 
        FROM public.team_members 
        WHERE role = COALESCE(NEW.role, OLD.role)
    )
    WHERE name = CASE 
        WHEN NEW.role = 'data_analyst' THEN 'Data Analyst'
        WHEN NEW.role = 'data_steward' THEN 'Data Steward'
        WHEN NEW.role = 'senior_analyst' THEN 'Senior Analyst'
        WHEN NEW.role = 'team_lead' THEN 'Team Lead'
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update member counts
DROP TRIGGER IF EXISTS update_role_member_count_insert ON public.team_members;
CREATE TRIGGER update_role_member_count_insert
    AFTER INSERT ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_role_member_count();

DROP TRIGGER IF EXISTS update_role_member_count_update ON public.team_members;
CREATE TRIGGER update_role_member_count_update
    AFTER UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_role_member_count();

DROP TRIGGER IF EXISTS update_role_member_count_delete ON public.team_members;
CREATE TRIGGER update_role_member_count_delete
    AFTER DELETE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_role_member_count();

-- Update member counts for existing data
UPDATE public.roles SET member_count = (
    SELECT COUNT(*) 
    FROM public.team_members 
    WHERE role = CASE 
        WHEN name = 'Data Analyst' THEN 'data_analyst'
        WHEN name = 'Data Steward' THEN 'data_steward'
        WHEN name = 'Senior Analyst' THEN 'senior_analyst'
        WHEN name = 'Team Lead' THEN 'team_lead'
    END
);

-- Create ai_insights table for storing generated AI insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_uid TEXT REFERENCES public.users(firebase_uid),
    dashboard_type TEXT NOT NULL DEFAULT 'operational',
    executive_summary TEXT,
    high_priority_recommendations TEXT[],
    medium_priority_actions TEXT[],
    strategic_opportunities TEXT[],
    impact_data JSONB,
    insights_count INTEGER DEFAULT 0,
    generation_type TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ai_insights table
CREATE INDEX IF NOT EXISTS idx_ai_insights_firebase_uid ON public.ai_insights(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dashboard_type ON public.ai_insights(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at);

-- Enable Row Level Security (RLS) for ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_insights
CREATE POLICY "Users can view their own AI insights" ON public.ai_insights
    FOR SELECT USING (auth.role() = 'authenticated' AND firebase_uid = auth.uid());

CREATE POLICY "Users can insert their own AI insights" ON public.ai_insights
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND firebase_uid = auth.uid());

CREATE POLICY "Users can update their own AI insights" ON public.ai_insights
    FOR UPDATE USING (auth.role() = 'authenticated' AND firebase_uid = auth.uid());

-- Data team leads can view all AI insights
CREATE POLICY "Data team leads can view all AI insights" ON public.ai_insights
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE firebase_uid = auth.uid() 
            AND role = 'dataTeamLead'
        )
    );

-- Enable Row Level Security (RLS)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_members
CREATE POLICY "Team members are viewable by authenticated users" ON public.team_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Team members can be created by data team leads" ON public.team_members
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE firebase_uid = auth.uid() 
            AND role = 'dataTeamLead'
        )
    );

CREATE POLICY "Team members can be updated by data team leads" ON public.team_members
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE firebase_uid = auth.uid() 
            AND role = 'dataTeamLead'
        )
    );

-- Create RLS policies for roles
CREATE POLICY "Roles are viewable by authenticated users" ON public.roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Roles can be managed by data team leads" ON public.roles
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE firebase_uid = auth.uid() 
            AND role = 'dataTeamLead'
        )
    );

-- Create the data_glossary table (simplified version without foreign key dependencies)
create table if not exists public.data_glossary (
  id serial not null,
  term character varying(255) not null,
  definition text not null,
  source_columns text[] null,
  data_types text[] null,
  sample_values text[] null,
  synonyms text[] null,
  category character varying(100) null,
  confidence numeric(3, 2) null,
  dataset_id character varying(100) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  source_file_id uuid null,
  source_filename text null,
  constraint data_glossary_pkey primary key (id),
  constraint unique_term_per_dataset unique (term, dataset_id),
  constraint data_glossary_confidence_check check (
    (
      (confidence >= 0.00)
      and (confidence <= 1.00)
    )
  ),
  constraint valid_confidence check (
    (
      (confidence is null)
      or (
        (confidence >= 0.00)
        and (confidence <= 1.00)
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
create index IF not exists idx_data_glossary_dataset on public.data_glossary using btree (dataset_id) TABLESPACE pg_default;

create index IF not exists idx_data_glossary_term on public.data_glossary using btree (term) TABLESPACE pg_default;

create index IF not exists idx_data_glossary_category on public.data_glossary using btree (category) TABLESPACE pg_default;

create index IF not exists idx_data_glossary_confidence on public.data_glossary using btree (confidence) TABLESPACE pg_default;

create index IF not exists idx_data_glossary_created_at on public.data_glossary using btree (created_at) TABLESPACE pg_default;

-- Create full-text search index
create index IF not exists idx_data_glossary_fts on public.data_glossary using gin (
  to_tsvector(
    'english'::regconfig,
    (((term)::text || ' '::text) || definition)
  )
) TABLESPACE pg_default;

create index IF not exists data_glossary_source_file_id_idx on public.data_glossary using btree (source_file_id) TABLESPACE pg_default;

-- Create function to refresh extracted terms count (placeholder - implement as needed)
CREATE OR REPLACE FUNCTION refresh_extracted_terms_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be implemented to update counts in other tables
  -- For now, it's a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update dataset term count (placeholder - implement as needed)
CREATE OR REPLACE FUNCTION update_dataset_term_count()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be implemented to update dataset statistics
  -- For now, it's a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
create trigger trg_terms_count_del
after DELETE on data_glossary for EACH row
execute FUNCTION refresh_extracted_terms_count ();

create trigger trg_terms_count_ins
after INSERT on data_glossary for EACH row
execute FUNCTION refresh_extracted_terms_count ();

create trigger trg_terms_count_upd
after
update OF source_file_id on data_glossary for EACH row
execute FUNCTION refresh_extracted_terms_count ();

create trigger trigger_update_dataset_count
after INSERT
or DELETE
or
update on data_glossary for EACH row
execute FUNCTION update_dataset_term_count ();

-- Enable Row Level Security (RLS)
ALTER TABLE public.data_glossary ENABLE ROW LEVEL SECURITY;

-- Create policies for data access
-- Allow authenticated users to read all glossary terms
CREATE POLICY "Allow authenticated users to read glossary terms" ON public.data_glossary
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert glossary terms
CREATE POLICY "Allow authenticated users to insert glossary terms" ON public.data_glossary
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update glossary terms
CREATE POLICY "Allow authenticated users to update glossary terms" ON public.data_glossary
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete glossary terms
CREATE POLICY "Allow authenticated users to delete glossary terms" ON public.data_glossary
  FOR DELETE USING (auth.role() = 'authenticated');
