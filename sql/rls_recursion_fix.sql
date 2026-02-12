-- ==========================================
-- NUCLEAR RLS RECURSION FIX (V3)
-- ==========================================

-- 1. DROP ALL POTICIES ON GROUPS AND GROUP_MEMBERS
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('groups', 'group_members')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. RECREATE SECURITY DEFINER FUNCTIONS WITH SEARCH PATH
-- This is critical for bypass stability in Supabase
CREATE OR REPLACE FUNCTION public.check_is_group_member(group_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = group_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_is_group_admin(group_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = group_uuid
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. APPLY CLEAN POLICIES

-- Ensure RLS is enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- GROUPS: Use the function which bypasses RLS on group_members
CREATE POLICY "groups_select_policy" ON public.groups
FOR SELECT USING (
  created_by = auth.uid() 
  OR public.check_is_group_member(id)
);

CREATE POLICY "groups_insert_policy" ON public.groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- GROUP MEMBERS: Use the function which bypasses RLS on group_members
-- Important: Avoid checking the 'groups' table here to prevent cross-table recursion
CREATE POLICY "members_select_policy" ON public.group_members
FOR SELECT USING (
  user_id = auth.uid() 
  OR public.check_is_group_member(group_id)
);

CREATE POLICY "members_insert_policy" ON public.group_members
FOR INSERT WITH CHECK (
  public.check_is_group_admin(group_id)
  OR EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = group_members.group_id 
    AND created_by = auth.uid()
  )
);
