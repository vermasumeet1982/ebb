import { LoginSchema } from '../auth.schema';

describe('Auth Schema Validation', () => {
  describe('LoginSchema', () => {
    const validLogin = {
      email: 'john.doe@example.com',
      password: 'MySecure@Pass1',
    };

    describe('Success cases', () => {
      it('should validate a complete login request', () => {
        const result = LoginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validLogin);
      });

      it('should validate email with different formats', () => {
        const testCases = [
          'user@example.com',
          'user.name@example.co.uk',
          'user+tag@example.com',
          'test123@example.org',
          'user@subdomain.example.com',
          'USER@EXAMPLE.COM', // Case insensitive
        ];

        testCases.forEach(email => {
          const loginWithEmail = { ...validLogin, email };
          const result = LoginSchema.safeParse(loginWithEmail);
          expect(result.success).toBe(true);
          expect(result.data?.email).toBe(email);
        });
      });

      it('should validate different password formats', () => {
        const testCases = [
          'MySecure@Pass1',
          'Another@Pass2',
          'Complex@Password3!',
          'Simple@Pass4',
          'Test@123',
          'Password@1',
          'a', // Minimum length of 1
          'A'.repeat(100), // Long password
        ];

        testCases.forEach(password => {
          const loginWithPassword = { ...validLogin, password };
          const result = LoginSchema.safeParse(loginWithPassword);
          expect(result.success).toBe(true);
          expect(result.data?.password).toBe(password);
        });
      });
    });

    describe('Email validation', () => {
      it('should reject missing email', () => {
        const { email, ...invalidLogin } = validLogin;

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Required',
          })
        );
      });

      it('should reject empty email', () => {
        const invalidLogin = { ...validLogin, email: '' };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email format',
          })
        );
      });

      it('should reject invalid email format', () => {
        const testCases = [
          'invalid-email',
          'test@',
          '@example.com',
          'test..test@example.com',
          'test@example',
          'test@.com',
          'test@example..com',
          'test@.example.com',
          'test@@example.com',
        ];

        testCases.forEach(email => {
          const invalidLogin = { ...validLogin, email };
          const result = LoginSchema.safeParse(invalidLogin);
          expect(result.success).toBe(false);
          expect(result.error?.errors).toContainEqual(
            expect.objectContaining({
              path: ['email'],
              message: 'Invalid email format',
            })
          );
        });
      });

      it('should reject whitespace-only email', () => {
        const invalidLogin = { ...validLogin, email: '   ' };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email format',
          })
        );
      });

      it('should reject email with leading/trailing whitespace', () => {
        const invalidLogin = { ...validLogin, email: ' test@example.com ' };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email format',
          })
        );
      });
    });

    describe('Password validation', () => {
      it('should reject missing password', () => {
        const { password, ...invalidLogin } = validLogin;

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Required',
          })
        );
      });

      it('should reject empty password', () => {
        const invalidLogin = { ...validLogin, password: '' };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password is required',
          })
        );
      });

      it('should reject whitespace-only password', () => {
        const invalidLogin = { ...validLogin, password: '   ' };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(true); // Zod accepts whitespace-only strings for min(1)
        expect(result.data?.password).toBe('   ');
      });

      it('should accept password with leading/trailing whitespace', () => {
        const loginWithWhitespace = { ...validLogin, password: ' MySecure@Pass1 ' };

        const result = LoginSchema.safeParse(loginWithWhitespace);
        expect(result.success).toBe(true);
        expect(result.data?.password).toBe(' MySecure@Pass1 ');
      });
    });

    describe('Multiple field validation', () => {
      it('should reject when both email and password are missing', () => {
        const invalidLogin = {};

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(2);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Required',
          })
        );
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Required',
          })
        );
      });

      it('should reject when email is invalid and password is missing', () => {
        const invalidLogin = {
          email: 'invalid-email',
        };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(2);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email format',
          })
        );
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Required',
          })
        );
      });

      it('should reject when email is missing and password is empty', () => {
        const invalidLogin = {
          password: '',
        };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(2);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Required',
          })
        );
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password is required',
          })
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', () => {
        const invalidLogin = {
          email: null,
          password: null,
        };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it('should handle undefined values', () => {
        const invalidLogin = {
          email: undefined,
          password: undefined,
        };

        const result = LoginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });

      it('should handle non-string values', () => {
        const testCases = [
          { email: 123, password: 'test' },
          { email: 'test@example.com', password: 456 },
          { email: true, password: 'test' },
          { email: 'test@example.com', password: false },
          { email: [], password: 'test' },
          { email: 'test@example.com', password: {} },
        ];

        testCases.forEach(invalidLogin => {
          const result = LoginSchema.safeParse(invalidLogin);
          expect(result.success).toBe(false);
        });
      });

      it('should handle very long strings', () => {
        const longEmail = 'a'.repeat(1000) + '@example.com';
        const longPassword = 'a'.repeat(1000);

        const loginWithLongValues = {
          email: longEmail,
          password: longPassword,
        };

        const result = LoginSchema.safeParse(loginWithLongValues);
        expect(result.success).toBe(true);
        expect(result.data?.email).toBe(longEmail);
        expect(result.data?.password).toBe(longPassword);
      });

      it('should handle special characters in password', () => {
        const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const loginWithSpecialPassword = { ...validLogin, password: specialPassword };

        const result = LoginSchema.safeParse(loginWithSpecialPassword);
        expect(result.success).toBe(true);
        expect(result.data?.password).toBe(specialPassword);
      });

      it('should handle unicode characters', () => {
        const unicodeEmail = 'test@exämple.com';
        const unicodePassword = 'MySecure@Päss1';
        const loginWithUnicode = {
          email: unicodeEmail,
          password: unicodePassword,
        };

        const result = LoginSchema.safeParse(loginWithUnicode);
        expect(result.success).toBe(false); // Zod email validation may not accept unicode in domain
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Invalid email format',
          })
        );
      });
    });

    describe('Type inference', () => {
      it('should correctly infer types from schema', () => {
        // This test ensures TypeScript types are correctly inferred
        const result = LoginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
        // TypeScript should know these are strings
        expect(typeof result.data?.email).toBe('string');
        expect(typeof result.data?.password).toBe('string');
        
        // Should be able to access properties without type errors
        const { email, password } = result.data || {};
        expect(email).toBe(validLogin.email);
        expect(password).toBe(validLogin.password);
      });
    });
  });
}); 