import "dotenv/config";
import { createApp } from "./app.js";
import { initDatabase, seedDatabase } from "./db.js";

const port = Number(process.env.PORT ?? 8000);

initDatabase();
seedDatabase();

createApp().listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});
