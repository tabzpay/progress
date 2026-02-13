-- Fix RLS Policies for Group Deletion
-- Allows group creators and admins to update (soft delete) groups

-- First, check if the update policy exists and drop it if needed
DROP POLICY IF EXISTS "Group creators and admins can update groups" ON public.groups;

-- Create a policy that allows creators and admins to update groups
CREATE POLICY "Group creators and admins can update groups"
ON public.groups
FOR UPDATE
USING (
  -- User is the creator
  created_by = auth.uid()
  OR
  -- User is an admin member
  EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);

-- Also ensure there's a select policy so users can see their groups
DROP POLICY IF EXISTS "Users can view their groups" ON public.groups;

CREATE POLICY "Users can view their groups"
ON public.groups
FOR SELECT
USING (
  -- User is the creator
  created_by = auth.uid()
  OR
  -- User is a member
  EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);
