const cron = require("node-cron");
const pool = require("../config/db");

cron.schedule("* * * * *", async () => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM snoozed_emails
       WHERE snooze_until <= NOW()`
    );

    if (rowCount > 0)
      console.log(`Deleted ${rowCount} expired snooze records`);
  } catch (err) {
    console.error("Snooze scheduler error:", err.message);
  }
});

console.log("Snooze scheduler started");