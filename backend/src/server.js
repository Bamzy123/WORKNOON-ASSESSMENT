import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {db, initDatabase, seedDatabase} from "./db.js";
import {detectPromptInjection} from "./security.js";
import {evaluatePolicy} from "./policy.js";
import {analyzeRequest} from "./ai.js";

initDatabase(); seedDatabase();
const app = express();
app.use(helmet());
app.use(cors({origin:["http://localhost:3000","http://localhost:5173"]}));
app.use(express.json({limit:"20kb"}));

app.get("/health", (_,res)=>res.json({status:"ok"}));

app.get("/api/orders/:orderNumber",(req,res)=>{
  const row=db.prepare(`SELECT o.*,c.name customer,c.email FROM orders o JOIN customers c ON c.id=o.customer_id
                        WHERE o.order_number=?`).get(req.params.orderNumber.toUpperCase());
  if(!row) return res.status(404).json({error:"Order not found"});
  res.json(row);
});

app.post("/api/refunds", async (req,res)=>{
  const {order_number,message}=req.body || {};
  if(typeof order_number!=="string" || typeof message!=="string" || message.trim().length<5 || message.length>2000)
    return res.status(400).json({error:"A valid order_number and message (5–2000 characters) are required."});

  const order=db.prepare(`SELECT o.*,c.name customer FROM orders o JOIN customers c ON c.id=o.customer_id
                          WHERE o.order_number=?`).get(order_number.toUpperCase());
  if(!order) return res.status(404).json({error:"Order not found"});

  const injection=detectPromptInjection(message);
  const ai=await analyzeRequest(message);
  const policy=evaluatePolicy(order,ai.classification,injection);

  const result=db.prepare(`INSERT INTO refund_requests
    (order_id,customer_message,classification,decision,reason_code,policy_reason,ai_summary,injection_flag)
    VALUES (?,?,?,?,?,?,?,?)`).run(order.id,message,ai.classification,policy.decision,policy.reasonCode,policy.reason,ai.summary,injection?1:0);

  res.status(201).json({
    request_id:result.lastInsertRowid, decision:policy.decision, reason_code:policy.reasonCode,
    policy_reason:policy.reason, classification:ai.classification, ai_summary:ai.summary,
    ai_source:ai.source, injection_flag:injection
  });
});

app.get("/api/admin/refunds",(_,res)=>{
  const rows=db.prepare(`SELECT r.*,o.order_number,o.item_name item,o.amount,c.name customer
    FROM refund_requests r JOIN orders o ON o.id=r.order_id JOIN customers c ON c.id=o.customer_id
    ORDER BY r.id DESC`).all().map(r=>({...r,injection_flag:Boolean(r.injection_flag)}));
  res.json(rows);
});

app.get("/api/admin/stats",(_,res)=>{
  const rows=db.prepare("SELECT decision,COUNT(*) count FROM refund_requests GROUP BY decision").all();
  const out={total:0,approved:0,denied:0,escalated:0};
  for(const r of rows){out.total+=r.count;out[r.decision.toLowerCase()]=r.count}
  res.json(out);
});

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:"Internal server error"});});
const port=process.env.PORT || 8000;
app.listen(port,"0.0.0.0",()=>console.log(`API listening on ${port}`));
