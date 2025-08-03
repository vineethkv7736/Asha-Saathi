// Authentication utilities for production-ready security

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minutes
};

export const authUtils = {
  // Check if login attempts are rate limited
  isRateLimited(identifier: string): { limited: boolean; remainingTime?: number } {
    const entry = rateLimitStore.get(identifier);
    
    if (!entry) {
      return { limited: false };
    }

    const now = Date.now();

    // Check if user is blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const remainingTime = Math.ceil((entry.blockedUntil - now) / 1000 / 60);
      console.log(`🚫 [RATE_LIMIT] User blocked: ${identifier}, remaining time: ${remainingTime} minutes`);
      return { 
        limited: true, 
        remainingTime 
      };
    }

    // Reset if window has passed
    if (now - entry.lastAttempt > RATE_LIMIT_CONFIG.WINDOW_MS) {
      rateLimitStore.delete(identifier);
      console.log(`🔄 [RATE_LIMIT] Rate limit window expired, resetting for: ${identifier}`);
      return { limited: false };
    }

    // Check if max attempts reached
    if (entry.attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
      const blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS;
      entry.blockedUntil = blockedUntil;
      const remainingTime = Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION_MS / 1000 / 60);
      console.log(`🚫 [RATE_LIMIT] Max attempts reached, blocking user: ${identifier} for ${remainingTime} minutes`);
      return { 
        limited: true, 
        remainingTime 
      };
    }

    const remainingAttempts = RATE_LIMIT_CONFIG.MAX_ATTEMPTS - entry.attempts;
    console.log(`ℹ️ [RATE_LIMIT] Rate limit check for: ${identifier}, remaining attempts: ${remainingAttempts}`);
    return { limited: false };
  },

  // Record a login attempt
  recordAttempt(identifier: string, success: boolean): void {
    const entry = rateLimitStore.get(identifier) || {
      attempts: 0,
      lastAttempt: 0,
    };

    entry.lastAttempt = Date.now();

    if (success) {
      // Reset on successful login
      rateLimitStore.delete(identifier);
      console.log(`✅ [RATE_LIMIT] Login successful, resetting attempts for: ${identifier}`);
    } else {
      // Increment failed attempts
      entry.attempts += 1;
      rateLimitStore.set(identifier, entry);
      console.log(`🚫 [RATE_LIMIT] Failed attempt recorded for: ${identifier}, total attempts: ${entry.attempts}`);
    }
  },

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate password strength
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },

  // Generate secure password
  generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },

  // Get remaining attempts
  getRemainingAttempts(identifier: string): number {
    const entry = rateLimitStore.get(identifier);
    if (!entry) return RATE_LIMIT_CONFIG.MAX_ATTEMPTS;
    return Math.max(0, RATE_LIMIT_CONFIG.MAX_ATTEMPTS - entry.attempts);
  }
}; 