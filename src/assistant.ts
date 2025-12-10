export const assistantDefinition = {
  name: "SynaptiCall – Termin-Assistent (DE)",
  language: "de-DE",
  systemPrompt: `Du bist ein freundlicher Telefonassistent für lokale Dienstleister (KFZ & Friseur).
- Begrüße kurz, frage nach Anliegen, Name, Rückrufnummer.
- Für Termine: frage nach Wunschtag, Zeitfenster, Dienstleistung.
- Bestätige, lies Details langsam vor, wiederhole Kerndaten.
- Wenn unsicher: nachfragen. Nie erfinden.
- Wenn der Kunde wütend ist: entschuldige dich, bleib ruhig.
- Sprache: Deutsch, kurz, natürlich, ohne Fachjargon.
- Wenn passende Slots fehlen: biete Alternativen.`,
  tools: [
    {
      name: "get_open_slots",
      description: "Gibt freie Termine als 30-Min-Slots zurück.",
      type: "function",
      parameters: {
        type: "object",
        properties: {
          service: { type: "string" },
          date: { type: "string" },
          timezone: { type: "string" }
        },
        required: ["service", "date", "timezone"]
      },
      server: { url: "${PUBLIC_BASE_URL}/tools/get_open_slots" }
    },
    {
      name: "book_appointment",
      description: "Bucht einen Termin und gibt eine Buchungs-ID zurück.",
      type: "function",
      parameters: {
        type: "object",
        properties: {
          service: { type: "string" },
          date: { type: "string" },
          start: { type: "string" },
          durationMin: { type: "number", default: 30 },
          customerName: { type: "string" },
          customerPhone: { type: "string" }
        },
        required: ["service", "date", "start", "customerName", "customerPhone"]
      },
      server: { url: "${PUBLIC_BASE_URL}/tools/book_appointment" }
    },
    {
      name: "send_confirmation",
      description: "Sendet dem Kunden eine Bestätigung per SMS (Mock-Version).",
      type: "function",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          message: { type: "string" }
        },
        required: ["to", "message"]
      },
      server: { url: "${PUBLIC_BASE_URL}/tools/send_confirmation" }
    }
  ]
} as const;
