import express from "express";
import dotenv from "dotenv";
import { assistantDefinition } from "./assistant";
import { getOpenSlots, bookAppointment, sendConfirmation } from "./tools";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.send("ok"));

app.get("/assistant.json", (_req, res) => {
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3030}`;
  const withUrls = JSON.parse(JSON.stringify(assistantDefinition).replaceAll("${PUBLIC_BASE_URL}", base));
  res.json(withUrls);
});

app.post("/tools/get_open_slots", getOpenSlots);
app.post("/tools/book_appointment", bookAppointment);
app.post("/tools/send_confirmation", sendConfirmation);

const PORT = Number(process.env.PORT || 3030);
app.listen(PORT, () => {
  console.log(`Vapi Assistant server listening on :${PORT}`);
});
