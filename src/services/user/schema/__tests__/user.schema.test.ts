import { AddressSchema, CreateUserSchema } from '../user.schema';

describe('User Schema Validation', () => {
  describe('AddressSchema', () => {
    const validAddress = {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      line3: 'Building C',
      town: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
    };

    describe('Success cases', () => {
      it('should validate a complete address', () => {
        const result = AddressSchema.safeParse(validAddress);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validAddress);
        
      });

      it('should validate address with only required fields', () => {
        const minimalAddress = {
          line1: '123 Main Street',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        };

        const result = AddressSchema.safeParse(minimalAddress);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(minimalAddress);
      });

      it('should validate address with some optional fields', () => {
        const partialAddress = {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        };

        const result = AddressSchema.safeParse(partialAddress);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(partialAddress);
        
      });
    });

    describe('Validation errors', () => {
      it('should reject missing line1', () => {
        const { line1, ...invalidAddress } = validAddress;

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['line1'],
            message: 'Required',
          })
        );
      });

      it('should reject empty line1', () => {
        const invalidAddress = { ...validAddress, line1: '' };

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['line1'],
            message: 'Address line 1 is required',
          })
        );
      });

      it('should reject missing town', () => {
        const { town, ...invalidAddress } = validAddress;

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['town'],
            message: 'Required',
          })
        );
      });

      it('should reject missing county', () => {
        const { county, ...invalidAddress } = validAddress;

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['county'],
            message: 'Required',
          })
        );
      });

      it('should reject missing postcode', () => {
        const { postcode, ...invalidAddress } = validAddress;

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['postcode'],
            message: 'Required',
          })
        );
      });

      it('should reject multiple missing fields', () => {
        const invalidAddress = {
          line1: '123 Main Street',
          // Missing town, county, postcode
        };

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(3);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['town'],
            message: 'Required',
          })
        );
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['county'],
            message: 'Required',
          })
        );
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['postcode'],
            message: 'Required',
          })
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle whitespace-only strings', () => {
        const invalidAddress = {
          ...validAddress,
          line1: '   ',
          town: '   ',
          county: '   ',
          postcode: '   ',
        };

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(true); // Zod accepts whitespace-only strings
        expect(result.data?.line1).toBe('   ');
        expect(result.data?.town).toBe('   ');
        expect(result.data?.county).toBe('   ');
        expect(result.data?.postcode).toBe('   ');
        
      });

      it('should handle null values', () => {
        const invalidAddress = {
          ...validAddress,
          line1: null,
          town: null,
        };

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
      });

      it('should handle undefined values', () => {
        const invalidAddress = {
          ...validAddress,
          line1: undefined,
          town: undefined,
        };

        const result = AddressSchema.safeParse(invalidAddress);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('CreateUserSchema', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+447700900123',
      password: 'MySecure@Pass1',
      address: {
        line1: '123 Main Street',
        town: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
      },
    };

    describe('Success cases', () => {
      it('should validate a complete user request', () => {
        const result = CreateUserSchema.safeParse(validUser);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validUser);
      });

      it('should validate user with address containing optional fields', () => {
        const userWithFullAddress = {
          ...validUser,
          address: {
            line1: '123 Main Street',
            line2: 'Apt 4B',
            line3: 'Building C',
            town: 'London',
            county: 'Greater London',
            postcode: 'SW1A 1AA',
          },
        };

        const result = CreateUserSchema.safeParse(userWithFullAddress);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(userWithFullAddress);
      });

      it('should validate name with maximum length', () => {
        const longName = 'A'.repeat(100);
        const userWithLongName = { ...validUser, name: longName };

        const result = CreateUserSchema.safeParse(userWithLongName);
        expect(result.success).toBe(true);
        expect(result.data?.name).toBe(longName);
      });

      it('should validate password with maximum length', () => {
        const longPassword = 'MySecure@Pass1' + 'A'.repeat(50);
        const userWithLongPassword = { ...validUser, password: longPassword };

        const result = CreateUserSchema.safeParse(userWithLongPassword);
        expect(result.success).toBe(true);
        expect(result.data?.password).toBe(longPassword);
      });
    });

    describe('Name validation', () => {
      it('should reject missing name', () => {
        const { name, ...invalidUser } = validUser;

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Required',
          })
        );
      });

      it('should reject empty name', () => {
        const invalidUser = { ...validUser, name: '' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Name is required',
          })
        );
      });

      it('should reject name exceeding maximum length', () => {
        const invalidUser = { ...validUser, name: 'A'.repeat(101) };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Name must be at most 100 characters',
          })
        );
      });
    });

    describe('Email validation', () => {
      it('should reject missing email', () => {
        const { email, ...invalidUser } = validUser;

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            message: 'Required',
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
        ];

        testCases.forEach(email => {
          const invalidUser = { ...validUser, email };
          const result = CreateUserSchema.safeParse(invalidUser);
          expect(result.success).toBe(false);
          expect(result.error?.errors).toContainEqual(
            expect.objectContaining({
              path: ['email'],
              message: 'Invalid email format',
            })
          );
        });
      });

      it('should accept valid email formats', () => {
        const testCases = [
          'test@example.com',
          'user.name@example.co.uk',
          'user+tag@example.com',
          'test123@example.org',
          'user@subdomain.example.com',
        ];

        testCases.forEach(email => {
          const validUserWithEmail = { ...validUser, email };
          const result = CreateUserSchema.safeParse(validUserWithEmail);
          expect(result.success).toBe(true);
          expect(result.data?.email).toBe(email);
        });
      });
    });

    describe('Phone number validation', () => {
      it('should reject missing phone number', () => {
        const { phoneNumber, ...invalidUser } = validUser;

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['phoneNumber'],
            message: 'Required',
          })
        );
      });

      it('should reject invalid phone number formats', () => {
        const testCases = [
          '1234567890', // Missing +
          '+01234567890', // Starts with 0
          '+1234567890123456', // Too long (16 digits)
          '+123456789a', // Contains letters
          '+123 456 7890', // Contains spaces
          '+123-456-7890', // Contains hyphens
        ];

        testCases.forEach(phoneNumber => {
          const invalidUser = { ...validUser, phoneNumber };
          const result = CreateUserSchema.safeParse(invalidUser);
          expect(result.success).toBe(false);
          expect(result.error?.errors).toContainEqual(
            expect.objectContaining({
              path: ['phoneNumber'],
              message: 'Phone number must be in international format (+1234567890)',
            })
          );
        });
      });

      it('should accept valid phone number formats', () => {
        const testCases = [
          '+447700900123',
          '+1234567890',
          '+12345678901',
          '+123456789012',
          '+1234567890123',
          '+12345678901234',
        ];

        testCases.forEach(phoneNumber => {
          const validUserWithPhone = { ...validUser, phoneNumber };
          const result = CreateUserSchema.safeParse(validUserWithPhone);
          expect(result.success).toBe(true);
          expect(result.data?.phoneNumber).toBe(phoneNumber);
        });
      });
    });

    describe('Password validation', () => {
      it('should reject missing password', () => {
        const { password, ...invalidUser } = validUser;

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Required',
          })
        );
      });

      it('should reject password shorter than minimum length', () => {
        const invalidUser = { ...validUser, password: 'Short1@' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must be at least 8 characters',
          })
        );
      });

      it('should reject password exceeding maximum length', () => {
        const longPassword = 'MySecure@Pass1' + 'A'.repeat(51); // 65 characters
        const invalidUser = { ...validUser, password: longPassword };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must be at most 64 characters',
          })
        );
      });

      it('should reject password without lowercase letter', () => {
        const invalidUser = { ...validUser, password: 'MYSECURE@PASS1' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
          })
        );
      });

      it('should reject password without uppercase letter', () => {
        const invalidUser = { ...validUser, password: 'mysecure@pass1' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
          })
        );
      });

      it('should reject password without digit', () => {
        const invalidUser = { ...validUser, password: 'MySecure@Pass' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
          })
        );
      });

      it('should reject password without special character', () => {
        const invalidUser = { ...validUser, password: 'MySecurePass1' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['password'],
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
          })
        );
      });

      it('should accept valid password formats', () => {
        const testCases = [
          'MySecure@Pass1',
          'Another@Pass2',
          'Complex@Password3!',
          'Simple@Pass4',
          'Test@123',
          'Password@1',
        ];

        testCases.forEach(password => {
          const validUserWithPassword = { ...validUser, password };
          const result = CreateUserSchema.safeParse(validUserWithPassword);
          expect(result.success).toBe(true);
          expect(result.data?.password).toBe(password);
        });
      });
    });

    describe('Address validation', () => {
      it('should reject missing address', () => {
        const { address, ...invalidUser } = validUser;

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
        expect(result.error?.errors).toContainEqual(
          expect.objectContaining({
            path: ['address'],
            message: 'Required',
          })
        );
      });

      it('should reject invalid address structure', () => {
        const invalidUser = { ...validUser, address: 'invalid' };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', () => {
        const invalidUser = {
          ...validUser,
          name: null,
          email: null,
          phoneNumber: null,
          password: null,
          address: null,
        };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });

      it('should handle undefined values', () => {
        const invalidUser = {
          ...validUser,
          name: undefined,
          email: undefined,
          phoneNumber: undefined,
          password: undefined,
          address: undefined,
        };

        const result = CreateUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });

      it('should handle empty object', () => {
        const result = CreateUserSchema.safeParse({});
        expect(result.success).toBe(false);
        expect(result.error?.errors).toHaveLength(5); // name, email, phoneNumber, password, address
      });
    });
  });
}); 