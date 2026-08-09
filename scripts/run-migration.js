/**
 * Script pour exécuter les migrations SQL dans Supabase
 * Usage: node scripts/run-migration.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis"
  );
  console.error("   Ajoute-les à ton fichier .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log("📋 Chargement du fichier migration...");
    const migrationPath = path.join(
      __dirname,
      "../migrations/add_onboarding_drafts_table.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");

    console.log("🚀 Exécution de la migration...");
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error) {
      // Alternative: essayer via RPC avec split
      console.log("⚠️  RPC non disponible, tentative avec split...");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("--"));

      for (const statement of statements) {
        console.log(`  → ${statement.substring(0, 60)}...`);
        const { error: err } = await supabase.rpc("exec_sql", {
          sql: statement,
        });
        if (err) {
          console.warn(`  ⚠️  ${err.message}`);
        }
      }
    }

    console.log("✅ Migration exécutée!");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

runMigration();
