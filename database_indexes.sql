-- ==========================================
-- DATABASE PERFORMANCE INDEXES
-- Phase 1: Foundation - Task 1.8
-- ==========================================

-- Loans table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_loans_status_lender 
  ON public.loans(status, lender_id);

CREATE INDEX IF NOT EXISTS idx_loans_group_id 
  ON public.loans(group_id) 
  WHERE group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_loans_due_date 
  ON public.loans(due_date) 
  WHERE due_date IS NOT NULL;

-- Repayments table for loan history queries
CREATE INDEX IF NOT EXISTS idx_repayments_loan_created 
  ON public.repayments(loan_id, created_at DESC);

-- Notifications for user notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created 
  ON public.notifications(created_at DESC);

-- Group members for membership lookups
CREATE INDEX IF NOT EXISTS idx_group_members_user 
  ON public.group_members(user_id);

-- Update table statistics for query optimizer
ANALYZE public.loans;
ANALYZE public.repayments;
ANALYZE public.notifications;
ANALYZE public.group_members;

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
