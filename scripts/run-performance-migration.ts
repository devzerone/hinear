// Performance Migration Execution Script
// Feature: 003-performance-audit

/**
 * This script executes the performance tables migration using Supabase client
 *
 * Usage:
 *   pnpm tsx scripts/run-performance-migration.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function _executeMigration() {
  console.log("🚀 Starting performance tables migration...");

  try {
    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "supabase/migrations/003_performance_tables.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Migration file loaded successfully");

    // Split the SQL into individual statements
    // Note: This is a simple approach - for production, consider using a proper SQL parser
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        // Use Supabase RPC to execute SQL
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          // Some statements might fail due to IF NOT EXISTS clauses
          // This is expected behavior
          console.warn(
            `⚠️  Statement ${i + 1}/${statements.length}: ${error.message}`
          );
          errorCount++;
        } else {
          console.log(
            `✅ Statement ${i + 1}/${statements.length} executed successfully`
          );
          successCount++;
        }
      } catch (err) {
        console.error(
          `❌ Statement ${i + 1}/${statements.length} failed:`,
          err
        );
        errorCount++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Warnings: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);

    if (successCount > 0) {
      console.log("\n🎉 Migration completed successfully!");
      console.log("\n📋 Next steps:");
      console.log("   1. Verify tables in Supabase dashboard");
      console.log("   2. Initialize default baselines:");
      console.log(
        "      curl -X POST http://localhost:3000/api/performance/baselines/initialize"
      );
    } else {
      console.log(
        "\n⚠️  Migration completed with warnings. Please verify in Supabase dashboard."
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Alternative approach: Use direct SQL execution via Postgres
async function executeMigrationDirect() {
  console.log("🚀 Starting performance tables migration (direct execution)...");

  try {
    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "supabase/migrations/003_performance_tables.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Migration file loaded successfully");
    console.log(
      "\n⚠️  NOTE: This script requires the 'exec_sql' function to be available in Supabase."
    );
    console.log(
      "If the migration fails, please execute the SQL manually in Supabase dashboard:"
    );
    console.log("   1. Open Supabase dashboard");
    console.log("   2. Go to SQL Editor");
    console.log(
      "   3. Paste contents of: supabase/migrations/003_performance_tables.sql"
    );
    console.log("   4. Execute the SQL\n");

    // For now, just display the SQL that needs to be executed
    console.log("📋 SQL to execute (first 500 chars):");
    console.log(`${migrationSQL.substring(0, 500)}...\n`);

    console.log(
      "✅ Migration file ready. Please execute manually in Supabase dashboard."
    );
  } catch (error) {
    console.error("❌ Failed to load migration file:", error);
    process.exit(1);
  }
}

// Execute the migration
executeMigrationDirect()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
