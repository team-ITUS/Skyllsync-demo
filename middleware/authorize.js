// Authorization middleware with username-based restrictions for Admins
// Backend-only enforcement; UI remains unchanged

// Explicit deny list for restricted Admin accounts (action identifiers)
const RESTRICTED_ADMIN_DENY = new Set([
  'issueCertificate',
  'photoBulkAccept',
  'certificateIdChange',
  'deleteBatch',
]);

// Helper to read restricted admin usernames from env (comma-separated). Falls back to STAFF_ADMIN_NAME if provided.
function getRestrictedAdminUsernames() {
  const raw = (process.env.RESTRICTED_ADMIN_USERNAMES || process.env.STAFF_ADMIN_NAME || '')
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * authorize(actionId[, options]) returns an express middleware that:
 * - For role=admin: if username is in restricted list, deny specific actions; otherwise allow.
 * - For other roles: deny by default unless an explicit role allowlist is provided via options.allowRoles
 *
 * actionId is a short, stable identifier used by routes, e.g., 'issueCertificate'
 */
const authorize = (actionId, options = {}) => {
  const { allowRoles = [] } = options;
  return (req, res, next) => {
    try {
      // role may come from token/user, body, query, or headers
      const roleRaw = (req.user && req.user.role) || req.body.role || req.query.role || req.headers['x-role'];
      const role = (roleRaw || '').toString().trim().toLowerCase();

      // Attempt to infer the acting admin username from multiple locations
      const usernameRaw =
        (req.user && (req.user.adminName || req.user.userName)) ||
        req.body.adminName ||
        req.body.userName ||
        req.query.adminName ||
        req.query.userName ||
        req.headers['x-admin-username'] ||
        req.headers['x-username'] ||
        req.headers['username'] ||
        req.headers['x-profile-name'];
      const username = (usernameRaw || '').toString().trim().toLowerCase();

      // Admin role: allow by default, but enforce username-based restrictions if configured
      if (role === 'admin') {
        const restricted = getRestrictedAdminUsernames();
        if (username && restricted.has(username) && RESTRICTED_ADMIN_DENY.has(actionId)) {
          return res.status(403).json({ success: false, message: 'server error' });
        }
        return next();
      }

      // If role is not provided and username indicates a known restricted admin, still enforce denies
      // This helps if client only sends username without role
      if (!role) {
        const restricted = getRestrictedAdminUsernames();
        if (username && restricted.has(username) && RESTRICTED_ADMIN_DENY.has(actionId)) {
          return res.status(403).json({ success: false, message: 'server error' });
        }
        // If no role, but not a restricted admin context, proceed (backward-compatible for existing admin-only endpoints)
        return next();
      }

      // Non-admin roles: allow only if explicitly whitelisted via options
      if (allowRoles.map((r) => r.toLowerCase()).includes(role)) {
        return next();
      }

  return res.status(403).json({ success: false, message: 'server error' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Authorization error' });
    }
  };
};

module.exports = { authorize, RESTRICTED_ADMIN_DENY, getRestrictedAdminUsernames };
