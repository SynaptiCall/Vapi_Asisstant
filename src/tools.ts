import { z } from "zod";


const to = t.notify_sms_to;
const body = `Neuer Terminwunsch – ${t.name}\n${date} ${time}${service?` – ${service}`:''}\nKunde: ${customerName} (${customerPhone})${note?`\nHinweis: ${note}`:''}`;


const sid = process.env.TWILIO_ACCOUNT_SID; const token = process.env.TWILIO_AUTH_TOKEN; const from = process.env.TWILIO_FROM;
try {
if (sid && token && from && to){
const client = twilio(sid, token);
const sms = await client.messages.create({ from, to, body });
return res.json({ result: { status: 'sent', sid: sms.sid } });
}
return res.json({ result: { status: 'mocked', to, body } });
} catch(e:any){
return res.status(500).json({ error: e?.message || 'SMS failed' });
}
};


export const provisionTenant = (req: Request, res: Response) => {
const b = (req.body?.arguments ?? req.body) as any;
const did = String(b.did||'').trim();
const name = String(b.name||'').trim();
if (!did || !name) return res.status(400).json({ error: 'did und name erforderlich' });
const t = ensureTenant(did, { name, address: b.address, ics_url: b.ics_url, notify_sms_to: b.notify_sms_to, timezone: b.timezone });
return res.json({ result: t });
};


export const listAllTenants = (_req: Request, res: Response) => res.json({ result: listTenants() });


// ---------- src/server.ts ----------
import express from "express";
import dotenv from "dotenv";
import { assistantDefinition } from "./assistant.js";
import { resolveTenant, checkAvailability, notifyChef, provisionTenant, listAllTenants } from "./tools.js";
import { loadDB } from "./tenants.js";


dotenv.config();
loadDB();


const app = express();
app.use(express.json());


app.get('/health', (_req,res)=>res.send('ok'));


app.get('/assistant.json', (_req,res)=>{
const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT||3030}`;
const withUrls = JSON.parse(JSON.stringify(assistantDefinition).replaceAll('${PUBLIC_BASE_URL}', base));
res.json(withUrls);
});


// Vapi API Tools
app.post('/tools/resolve_tenant', resolveTenant);
app.post('/tools/check_availability', checkAvailability);
app.post('/tools/notify_chef', notifyChef);


// Admin
app.post('/admin/provision_tenant', provisionTenant);
app.get('/admin/tenants', listAllTenants);


const PORT = Number(process.env.PORT||3030);
app.listen(PORT, ()=>{ console.log(`ICS‑Notify Vapi server listening on :${PORT}`); });
