-- ==============================================================================
-- Migration: Creator Coupons & Promo Codes System
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- ==============================================================================

-- 1. Create Coupon Table
CREATE TABLE IF NOT EXISTS public."Coupon" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
    "templateId" TEXT REFERENCES public."Template"("id") ON DELETE CASCADE,
    "discountType" TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
    "discountValue" NUMERIC NOT NULL,                  -- e.g. 25 for 25% or 50 for 50 EGP
    "maxUses" INTEGER DEFAULT NULL,                    -- NULL = unlimited
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMPTZ DEFAULT NULL,              -- NULL = no expiration
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on uppercase code to prevent duplicates regardless of case
CREATE UNIQUE INDEX IF NOT EXISTS "idx_coupon_code_upper" ON public."Coupon" (UPPER("code"));
CREATE INDEX IF NOT EXISTS "idx_coupon_creator" ON public."Coupon" ("creatorId");
CREATE INDEX IF NOT EXISTS "idx_coupon_template" ON public."Coupon" ("templateId");

-- 2. Add Coupon tracking columns to Order Table
ALTER TABLE public."Order" 
ADD COLUMN IF NOT EXISTS "couponId" TEXT REFERENCES public."Coupon"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS "originalTotal" NUMERIC DEFAULT NULL;

-- 3. Atomic Coupon Usage Increment RPC Function
-- This safely increments usedCount and checks maxUses/expiration atomically to prevent race conditions.
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE public."Coupon"
    SET "usedCount" = "usedCount" + 1,
        "updatedAt" = NOW()
    WHERE "id" = p_coupon_id
      AND "isActive" = true
      AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW());
      
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$;

-- Grant permissions for service_role and authenticated
GRANT ALL ON TABLE public."Coupon" TO postgres, service_role;
GRANT SELECT ON TABLE public."Coupon" TO authenticated, anon;
