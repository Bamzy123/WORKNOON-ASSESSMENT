import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || "./data/refunds.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      amount REAL NOT NULL,
      ordered_at TEXT NOT NULL,
      final_sale INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS refund_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      customer_message TEXT NOT NULL,
      classification TEXT NOT NULL,
      decision TEXT NOT NULL,
      reason_code TEXT NOT NULL,
      policy_reason TEXT NOT NULL,
      ai_summary TEXT,
      injection_flag INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );
  `);
}

const seedRows = [
 ["Amina Yusuf","amina@example.test","ORD-1001","Wireless Headphones",120,5,0],
 ["David Cole","david@example.test","ORD-1002","Laptop",850,4,0],
 ["Sarah Williams","sarah@example.test","ORD-1003","Running Shoes",95,10,0],
 ["Michael Brown","michael@example.test","ORD-1004","Smart Watch",220,45,0],
 ["Grace Okafor","grace@example.test","ORD-1005","Designer Bag",300,3,1],
 ["James Smith","james@example.test","ORD-1006","Mechanical Keyboard",140,2,0],
 ["Fatima Bello","fatima@example.test","ORD-1007","Tablet",480,8,0],
 ["Daniel Johnson","daniel@example.test","ORD-1008","Monitor",390,12,0],
 ["Chloe Martin","chloe@example.test","ORD-1009","Winter Jacket",180,6,0],
 ["Noah Wilson","noah@example.test","ORD-1010","Camera",620,9,0],
 ["Olivia Taylor","olivia@example.test","ORD-1011","Coffee Machine",160,20,0],
 ["Ethan Anderson","ethan@example.test","ORD-1012","Gaming Mouse",75,1,0],
 ["Sophia Thomas","sophia@example.test","ORD-1013","Dress",110,7,1],
 ["Liam Jackson","liam@example.test","ORD-1014","Bluetooth Speaker",130,35,0],
 ["Emma White","emma@example.test","ORD-1015","Office Chair",450,14,0]
];

export function seedDatabase() {
  if (db.prepare("SELECT COUNT(*) AS count FROM customers").get().count > 0) return;
  const insertCustomer = db.prepare("INSERT INTO customers(name,email) VALUES (?,?)");
  const insertOrder = db.prepare(`INSERT INTO orders(order_number,customer_id,item_name,amount,ordered_at,final_sale)
                                  VALUES (?,?,?,?,?,?)`);
  const tx = db.transaction(() => {
    for (const [name,email,number,item,amount,days,finalSale] of seedRows) {
      const c = insertCustomer.run(name,email);
      const d = new Date(Date.now() - days*86400000).toISOString();
      insertOrder.run(number,c.lastInsertRowid,item,amount,d,finalSale);
    }
  });
  tx();
}
