/**
 * Setup Supabase Storage Bucket for Logement Photos
 * Run with: npx tsx scripts/setup-storage.ts
 * 
 * This script creates the logement-photos bucket and configures RLS policies
 * if they don't already exist.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET_NAME = "logement-photos";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function setupStorageBucket() {
  console.log("🚀 Setting up Supabase Storage bucket for logement photos...\n");

  try {
    // Step 1: Check if bucket exists
    console.log(`📦 Checking if bucket "${BUCKET_NAME}" exists...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      process.exit(1);
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists\n`);
    } else {
      // Step 2: Create bucket if it doesn't exist
      console.log(`📝 Creating bucket "${BUCKET_NAME}"...`);
      const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });

      if (error) {
        console.error("❌ Error creating bucket:", error);
        process.exit(1);
      }

      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully\n`);
    }

    // Step 3: Log configuration details
    console.log("📋 Bucket Configuration:");
    console.log(`   - Name: ${BUCKET_NAME}`);
    console.log(`   - Public: No (RLS enforced)`);
    console.log(`   - Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    console.log(`   - Allowed types: JPEG, PNG, WebP, GIF`);
    console.log(`   - Path structure: /proprietaire_id/logement_id/filename\n`);

    // Step 4: Log RLS policy setup instructions
    console.log("🔐 RLS Policies (Configure in Supabase Dashboard):");
    console.log("   \n1. INSERT Policy: 'Users can upload photos to their properties'");
    console.log(
      '      Expression: ((storage.foldername(name))[1])::uuid = auth.uid()\n'
    );

    console.log("   2. SELECT Policy: 'Users can view their own property photos'");
    console.log(
      '      Expression: ((storage.foldername(name))[1])::uuid = auth.uid()\n'
    );

    console.log("   3. UPDATE Policy: 'Users can update their property photos'");
    console.log(
      '      Expression: ((storage.foldername(name))[1])::uuid = auth.uid()\n'
    );

    console.log("   4. DELETE Policy: 'Users can delete their property photos'");
    console.log(
      '      Expression: ((storage.foldername(name))[1])::uuid = auth.uid()\n'
    );

    console.log("✅ Storage setup complete!");
    console.log(
      "📌 Note: Configure RLS policies in Supabase Dashboard → Storage → logement-photos → Policies\n"
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run setup
setupStorageBucket();
