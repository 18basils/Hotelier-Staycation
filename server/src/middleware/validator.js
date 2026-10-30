import { ZodError } from 'zod';

/**
 * Express middleware for validating request body against a Zod schema.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          error: issues[0]?.message || 'Validation error',
          details: issues
        });
      }
      return res.status(400).json({ error: 'Malformed request payload' });
    }
  };
}

/**
 * Express middleware for validating request query parameters against a Zod schema.
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          error: issues[0]?.message || 'Validation error in query parameters',
          details: issues
        });
      }
      return res.status(400).json({ error: 'Malformed request query parameters' });
    }
  };
}
