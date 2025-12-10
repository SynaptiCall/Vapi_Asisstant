const http = require("http");

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("OK");
    return;
  }
  if (req.url === "/__health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, port }));
    return;
  }
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Not found");
});

server.listen(port, "0.0.0.0", () => {
  console.log("✅ HTTP server listening on " + port);
});
