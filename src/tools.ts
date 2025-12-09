import { z } from "zod";
import type { Request, Response } from "express";

// kleine interne Liste für gebuchte Termine
const bookings: Array<{
  id: string;
  service: string;
  date: string;
  start: string;
  durationMin: number;
  customerName: string;
  customerPhone: string;
}> = [];

// Zeit-Slots erzeugen (9–12 & 13–17 Uhr)
function generateSlots(date: string) {
  const hours = [
    { start: 9, end: 12 },
    { start: 13, end: 17 }
  ];
  const slots: string[] = [];
  for (const h of hours) {
    for (let m = h.start * 60; m <= (h.end * 60) - 30; m += 30) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  const taken = new Set(bookings.filter(b => b.date === date).map(b => b.start));
  return slots.filter(s => !taken.has(s));
}

// Tool 1: Freie Slots abrufen
export const getOpenSlots = (req: Request, res: Response) => {
  const schema = z.object({
    service: z.string(),
    date: z.string(),
    timezone: z.string()
  });
  const parse = schema.safeParse(req.body?.arguments ?? req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { date } = parse.data;
  const free = generateSlots(date).slice(0, 8);
  return res.json({ result: free.map(start => ({ start, durationMin: 30 })) });
};

// Tool 2: Termin speichern
export const bookAppointment = (req: Request, res: Response) => {
  const schema = z.object({
    service: z.string(),
    date: z.string(),
    start: z.string(),
    durationMin: z.number().default(30),
    customerName: z.string(),
    customerPhone: z.string()
  });
  const parse = schema.safeParse(req.body?.arguments ?? req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { service, date, start, durationMin, customerName, customerPhone } = parse.data;
  if (!generateSlots(date).includes(start)) {
    return res.status(409).json({ error: "Slot bereits belegt" });
  }
  const id = `BK_${Date.now()}`;
  bookings.push({ id, service, date, start, durationMin, customerName, customerPhone });
  return res.json({ result: { bookingId: id } });
};

// Tool 3: SMS-Bestätigung (Mock-Version – sendet nichts)
export const sendConfirmation = async (req: Request, res: Response) => {
  const schema = z.object({ to: z.string(), message: z.string().max(500) });
  const parse = schema.safeParse(req.body?.arguments ?? req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { to, message } = parse.data;
  // Kein Twilio – nur Testausgabe
  console.log(`(Mock-SMS) An ${to}: ${message}`);
  return res.json({ result: { status: "mocked", to, message } });
};
