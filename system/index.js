const express = require("express");
const app = express();

app.use(express.json()); // JSON-Body lesen

// ---- Health & Root ----
app.get("/", (_req, res) => res.status(200).send("OK"));
app.get("/__health", (_req, res) => res.json({ ok: true, port: process.env.PORT }));

// ---- (Optional) API-Key-Check: aktivieren, wenn du willst ----
// app.use((req, res, next) => {
//   const key = req.header("X-API-Key") || (req.headers.authorization || "").replace("Bearer ", "");
//   if (!key) return res.status(401).json({ error: "Missing API key" });
//   // TODO: hier später echte Prüfung (DB). Für jetzt akzeptieren wir jeden Wert:
//   next();
// });

// ---- TOOLS ----

// A) Availability (Mock: alle 30 Min von 08:00–18:00, außer 12:00–12:30 blockiert)
app.get("/tools/availability", (req, res) => {
  const date = String(req.query.date || "");
  const duration = Number(req.query.duration_minutes || "30");
  if (!date) return res.status(400).json({ error: "date required (YYYY-MM-DD)" });

  const start = new Date(`${date}T08:00:00`);
  const end   = new Date(`${date}T18:00:00`);

  // Beispiel: ein „busy“-Block (12:00–12:30)
  const busy = [
    { start: new Date(`${date}T12:00:00`), end: new Date(`${date}T12:30:00`) }
  ];

  const slots = [];
  let cursor = new Date(start);

  function free(s, e) {
    return !busy.some(b => !(e <= b.start || s >= b.end));
  }

  while (cursor < end) {
    const s = new Date(cursor);
    const e = new Date(cursor.getTime() + duration * 60 * 1000);
    if (e > end) break;
    if (free(s, e)) slots.push(s.toISOString());
    cursor = new Date(cursor.getTime() + duration * 60 * 1000);
  }

  res.json({ slots, duration_minutes: duration, timezone: "Europe/Berlin" });
});

// B) Book (Mock: nimmt alles an und gibt IDs zurück)
app.post("/tools/book", (req, res) => {
  const { customer_name, customer_phone, starts_at, ends_at, notes } = req.body || {};
  if (!customer_name || !customer_phone || !starts_at || !ends_at) {
    return res.status(400).json({ error: "customer_name, customer_phone, starts_at, ends_at required" });
  }
  // In echt würdest du hier Google Calendar eintragen & DB speichern.
  const eventId = "evt_" + Math.random().toString(36).slice(2, 10);
  const bookingId = Math.floor(Math.random() * 1000000);
  res.json({ ok: true, booking_id: bookingId, event_id: eventId, echo: { notes: notes || "" } });
});

// C) Cancel (Mock: bestätigt immer)
app.post("/tools/cancel", (req, res) => {
  const { booking_id, calendar_event_id } = req.body || {};
  if (!booking_id && !calendar_event_id) {
    return res.status(400).json({ error: "booking_id or calendar_event_id required" });
  }
  res.json({ ok: true });
});

// ---- Start ----
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ API listening on " + port));
