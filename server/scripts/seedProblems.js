import fs from "fs";
import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
// import fs from "fs";

dotenv.config();

const filePath = path.resolve(process.cwd(), "scripts/problems.json");

const raw = fs.readFileSync(filePath, "utf-8");
const problems = JSON.parse(raw);

console.log("📦 JSON file loaded successfully");
console.log("📊 Total problems in JSON:", problems.length);
console.log("🔍 First item sample:", problems[0]);
console.log("🔍 Last item sample:", problems[problems.length - 1]);

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function seed() {
  try {
    await client.connect();

    console.log("Connected");

    const dbInfo = await client.query(`
      SELECT
        current_database() AS database,
        current_user AS user,
        inet_server_addr() AS server,
        inet_server_port() AS port
    `);

    console.log("DATABASE CONNECTION:", dbInfo.rows[0]);

    await client.query("BEGIN");

    const batchSize = 25;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let start = 0; start < problems.length; start += batchSize) {
      const batch = problems.slice(start, start + batchSize);

      const values = batch
        .map(
          (_, i) =>
            `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
        )
        .join(",");

      const params = batch.flatMap((p) => [
        p.title,
        p.question_link,
        p.difficulty,
        p.topic,
        p.tags,
        p.platform,
      ]);

      const result = await client.query(
        `
        INSERT INTO problems
        (title, question_link, difficulty, topic, tags, platform)
        VALUES ${values}
        ON CONFLICT (question_link) DO NOTHING
        RETURNING id
        `,
        params
      );

      insertedCount += result.rowCount;
      skippedCount += batch.length - result.rowCount;

      console.log(
        `Batch ${Math.floor(start / batchSize) + 1}: ` +
        `${result.rowCount} inserted, ` +
        `${batch.length - result.rowCount} already existed`
      );
    }

    await client.query("COMMIT");

    console.log("\n==============================");
    console.log("SEED COMPLETE");
    console.log("==============================");
    console.log("JSON problems :", problems.length);
    console.log("Newly inserted:", insertedCount);
    console.log("Already existed:", skippedCount);
    console.log("==============================\n");

    await client.end();
  } catch (err) {
    console.error("\n❌ SEED FAILED");
    console.error(err);

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message);
    }

    try {
      await client.end();
    } catch (closeError) {
      console.error("Connection close failed:", closeError.message);
    }

    process.exit(1);
  }
}


seed();