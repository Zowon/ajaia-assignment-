const { Pool } = require("pg");

const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1",
  "eu-north-1",
  "af-south-1",
  "me-south-1"
];

async function checkRegion(region) {
  const url = `postgresql://postgres.tvrjrxqrisgenmvthtiu:Yousaf123%40%40@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
  try {
    const res = await pool.query("SELECT 1");
    console.log("SUCCESS:", region);
    return true;
  } catch (err) {
    // console.log("FAILED:", region, err.message);
    return false;
  } finally {
    pool.end();
  }
}

async function run() {
  const promises = regions.map(r => checkRegion(r).then(success => { if (success) process.exit(0); }));
  await Promise.all(promises);
  console.log("No region matched.");
}

run();
