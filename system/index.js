const express = require("express");
const app = express();

app.get("/", (_req, res) => res.status(200).send("OK"));
app.get("/__health", (_req, res) => res.json({ ok: true, port: process.env.PORT }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ API listening on " + port));
