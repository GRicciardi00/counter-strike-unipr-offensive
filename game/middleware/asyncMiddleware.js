//asyncMiddleware take another function as an argument and it wraps it in a promise. When route handlers resolve, this new promise will resolve with that value
//if there is an error it will be caught here and it will be passed onto the next middleware.
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
module.exports = asyncMiddleware;