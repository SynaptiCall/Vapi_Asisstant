import fs from "fs";
ics_url?: string; // read‑only calendar URL
notify_sms_to?: string; // chef's phone number for SMS
language?: string; // e.g. de-DE
hours: BusinessHours; // used only when no ICS available
};


type DB = { tenants: Record<string, Tenant> };
const DB_FILE = "./tenants.json";
let state: DB = { tenants: {} };


export function loadDB() { if (fs.existsSync(DB_FILE)) state = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
export function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2)); }
export function getTenant(did: string) { return state.tenants[did]; }
export function listTenants() { return Object.values(state.tenants); }


export function ensureTenant(did: string, partial: Partial<Tenant> = {}): Tenant {
const existing = getTenant(did); if (existing) return existing;
const t: Tenant = {
id: did,
name: partial.name || `Business ${did}`,
address: partial.address || "",
timezone: partial.timezone || process.env.DEFAULT_TIMEZONE || "Europe/Berlin",
ics_url: partial.ics_url,
notify_sms_to: partial.notify_sms_to,
language: partial.language || "de-DE",
hours: envHoursToMap()
};
state.tenants[did] = t; saveDB(); return t;
}


function envHoursToMap(): BusinessHours {
const keys = ["SU","MO","TU","WE","TH","FR","SA"]; // 0..6
const map: BusinessHours = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
keys.forEach((k, idx) => {
const v = process.env[`DEFAULT_HOURS_${k}` as keyof NodeJS.ProcessEnv] || "";
map[idx] = v ? v.split(",").map(x => x.trim()).filter(Boolean) : [];
});
return map;
}
