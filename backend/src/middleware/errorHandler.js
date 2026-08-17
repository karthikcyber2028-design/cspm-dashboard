const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({ error: "Database operation failed", details: err.message });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err.message,
  });
};

module.exports = { errorHandler };
