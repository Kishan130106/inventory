// utils/asyncHandler.js
// Wraps async controller functions so you never write try/catch in controllers.
// All thrown errors fall through to errorHandler middleware automatically.

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
