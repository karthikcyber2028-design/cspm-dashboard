const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const env = require("./src/config/env");

const authRoutes = require("./src/routes/auth.routes");
const awsRoutes = require("./src/routes/aws.routes");
const scanRoutes = require("./src/routes/scan.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const alertRoutes = require("./src/routes/alert.routes");

const { errorHandler } = require("./src/middleware/errorHandler");
const { authenticate } = require("./src/middleware/auth");

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "CSPM Backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/aws", authenticate, awsRoutes);
app.use("/api/scans", authenticate, scanRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);
app.use("/api/alerts", authenticate, alertRoutes);

const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`CSPM Dashboard running on port ${PORT} [${env.NODE_ENV}]`);
});

module.exports = app;
