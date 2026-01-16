const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const safeBody = { ...req.body };
    // Remove sensitive fields
    delete safeBody.password;
    delete safeBody.confirmPassword;
    delete safeBody.currentPassword;
    delete safeBody.token;
    delete safeBody.refreshToken;

    if (Object.keys(safeBody).length > 0) {
      console.log(`[${timestamp}] Request Body:`, JSON.stringify(safeBody, null, 2));
    }
  }

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode || 200;

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`);

    // Log error responses
    if (statusCode >= 400) {
      console.error(`[${new Date().toISOString()}] Error Response:`, JSON.stringify(data, null, 2));
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;