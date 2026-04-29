module.exports = (err, req, res, next) => {
  console.error(err.stack);
  console.error("❌ Full error:", err);

  // Axios/NIBSS errors
  if (err.response) {
    return res.status(err.response.status).json({
      message: "NIBSS API error",
      error: err.response.data,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
};
