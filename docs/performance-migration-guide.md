# Performance Tables Migration Guide

## 🎯 Overview

This guide will help you execute the performance tables migration (T013) for the Performance Investigation and Optimization feature.

## 📋 What This Migration Does

The migration creates 4 new tables in your Supabase database:

1. **performance_metrics** - Stores individual performance measurements
2. **performance_bottlenecks** - Tracks identified performance issues
3. **performance_baselines** - Defines target performance values
4. **optimization_records** - Documents performance improvements

## 🚀 How to Execute

### Option 1: Manual Execution (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/pmyrrckkiomjwjqntymr

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste the Migration**
   - Open file: `supabase/migrations/003_performance_tables.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute**
   - Click "Run" button (or press `Ctrl+Enter` / `Cmd+Enter`)
   - Wait for execution to complete

5. **Verify**
   - Go to "Table Editor" in Supabase dashboard
   - You should see the 4 new tables: `performance_*`

### Option 2: Using the Script (Experimental)

```bash
# Run the migration script
pnpm tsx scripts/run-performance-migration.ts
```

⚠️ **Note**: The script approach may not work due to Supabase security restrictions. Manual execution is recommended.

## ✅ Verification Steps

After execution, verify the migration:

1. **Check Tables Exist**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'performance_%';
   ```

2. **Check Indexes**
   ```sql
   SELECT indexname
   FROM pg_indexes
   WHERE tablename LIKE 'performance_%';
   ```

3. **Check RLS Policies**
   ```sql
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE tablename LIKE 'performance_%';
   ```

## 🎉 After Migration

Once the migration is complete, you can:

1. **Initialize Default Baselines**
   ```bash
   curl -X PUT http://localhost:3000/api/performance/baselines/initialize
   ```

2. **Test the API**
   ```bash
   # Record a test metric
   curl -X POST http://localhost:3000/api/performance/metrics \
     -H "Content-Type: application/json" \
     -d '{
       "name": "test_metric",
       "value": 100,
       "unit": "ms"
     }'
   ```

3. **Continue Implementation**
   - Proceed with Phase 3: User Story 1 (Profiling)
   - Or Phase 5: User Story 3 (Monitoring)

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already exist. This is fine - the migration uses `IF NOT EXISTS` clauses.

### Error: "permission denied"
**Solution**: Make sure you're using the service role key with admin privileges.

### Error: "must be owner of table"
**Solution**: Ensure you're the project owner or have admin rights in Supabase.

## 📞 Need Help?

If you encounter issues:

1. Check the migration file: `supabase/migrations/003_performance_tables.sql`
2. Review Supabase logs in the dashboard
3. Verify environment variables in `.env.local`

## ✨ Next Steps

After migration:
- ✅ T013 will be marked complete
- 🚀 Ready for Phase 3: User Story 1 implementation
- 📊 Performance monitoring infrastructure ready!
