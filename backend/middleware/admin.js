/**
 * BONUS — lightweight admin protection.
 *
 * If ADMIN_KEY is set in .env, admin/mutating routes require the request header:
 *     x-admin-key: <ADMIN_KEY>
 * If ADMIN_KEY is not set, the API runs in open dev mode (anyone can call admin routes).
 */
module.exports = function adminOnly(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return next();
  if (req.headers['x-admin-key'] === key) return next();
  return res
    .status(401)
    .json({ message: 'Unauthorized: a valid x-admin-key header is required' });
};
