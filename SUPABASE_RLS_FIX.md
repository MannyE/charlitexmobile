# 🔒 Supabase RLS Fix for Duplicate Detection

## Problem

Row Level Security (RLS) is preventing duplicate phone number detection because users can only see their own records, not other users' records.

## Root Cause

The current RLS policy:

```sql
create policy "select-own-waitlist-row"
on public.waitlist
for select
to authenticated
using (auth.uid() = user_id);
```

This blocks duplicate detection when a user tries to join with a phone number that was registered in a different session (different user_id).

## Solution

Add a **new policy** that allows checking for phone number existence during the signup process.

### Option 1: Allow Anonymous Phone Check (Recommended)

```sql
-- Allow anonymous users to check if a phone number exists (for duplicate detection)
create policy "check-phone-exists"
on public.waitlist
for select
to anon
using (true);
```

### Option 2: Allow Authenticated Phone Check Only

```sql
-- Allow authenticated users to check if any phone number exists (for duplicate detection)
create policy "check-phone-exists-auth"
on public.waitlist
for select
to authenticated
using (true);
```

### Option 3: Most Secure - Phone Number Only

```sql
-- Allow checking phone existence but only return phone column
create policy "check-phone-duplicate"
on public.waitlist
for select
to public
using (true);

-- Then modify your app to only select 'phone' column for duplicate checks
```

## Implementation Steps

1. **Go to your Supabase Dashboard**
2. **Navigate to:** SQL Editor
3. **Run ONE of the policies above** (I recommend Option 1)
4. **Test the duplicate detection**

## Security Considerations

- Option 1 allows anonymous users to see if phone numbers exist (minimal security risk)
- Option 2 requires authentication but allows seeing all phone numbers
- Option 3 is most restrictive but still allows duplicate checking

The phone number existence check is generally considered safe to expose as it's needed for UX (preventing duplicate signups).
