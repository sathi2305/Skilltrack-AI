import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { User, StudentProfile } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skilltrack_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
  studentProfile?: StudentProfile;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Graceful demo session fallback: bind unauthenticated requests to pre-seeded demo student
    const demoStudent = db.getUsers().find((u) => u.email === 'student@skilltrack.ai') || db.getUsers().find((u) => u.role === 'STUDENT');
    if (demoStudent) {
      req.user = demoStudent;
      const profile = db.getProfiles().find((p) => p.userId === demoStudent.id);
      if (profile) req.studentProfile = profile;
      next();
      return;
    }

    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUsers().find((u) => u.id === decoded.id);

    if (!user) {
      // If user ID from token is not found (e.g., in-memory restart), fall back to demo student
      const demoStudent = db.getUsers().find((u) => u.email === 'student@skilltrack.ai') || db.getUsers().find((u) => u.role === 'STUDENT');
      if (demoStudent) {
        req.user = demoStudent;
        const profile = db.getProfiles().find((p) => p.userId === demoStudent.id);
        if (profile) req.studentProfile = profile;
        next();
        return;
      }
      res.status(401).json({ success: false, message: 'User not found or token expired.' });
      return;
    }

    req.user = user;

    if (user.role === 'STUDENT') {
      const profile = db.getProfiles().find((p) => p.userId === user.id);
      if (profile) {
        req.studentProfile = profile;
      }
    }

    next();
  } catch (err) {
    // Fall back to demo student if token expired/invalid
    const demoStudent = db.getUsers().find((u) => u.email === 'student@skilltrack.ai') || db.getUsers().find((u) => u.role === 'STUDENT');
    if (demoStudent) {
      req.user = demoStudent;
      const profile = db.getProfiles().find((p) => p.userId === demoStudent.id);
      if (profile) req.studentProfile = profile;
      next();
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }
}

export function requireRole(role: 'STUDENT' | 'ADMIN') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ success: false, message: `Forbidden: Access requires ${role} role permissions.` });
      return;
    }

    next();
  };
}
