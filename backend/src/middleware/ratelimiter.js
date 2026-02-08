const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 250, 
  message: 'Too many requests from this IP',
});


module.exports = limiter;