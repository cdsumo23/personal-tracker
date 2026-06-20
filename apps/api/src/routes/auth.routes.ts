import { Router } from 'express';
import { z } from 'zod';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { authLimiter, strictLimiter } from '@/middleware/rateLimiter.middleware';
import { validate } from '@/middleware/validate.middleware';
import { profilePhotoUpload } from '@/middleware/upload.middleware';

const router = Router();

// ─────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().length(3).optional().default('USD'),
  timezone: z.string().optional().default('UTC'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Public Routes
router.post('/register', authLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.get('/verify-email/:token', authController.verifyEmail.bind(authController));
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/reset-password', strictLimiter, validate(resetPasswordSchema), authController.resetPassword.bind(authController));

// Protected Routes
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get('/me', authenticate, authController.getProfile.bind(authController));
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile.bind(authController));
router.post('/me/photo', authenticate, profilePhotoUpload.single('photo'), authController.uploadProfilePhoto.bind(authController));

export default router;
