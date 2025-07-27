import { mapUserToResponse, mapPrismaUserToUser } from '../user.mapper';
import { User } from '../../entities';

describe('User Mapper', () => {
  describe('mapPrismaUserToUser', () => {
    const mockPrismaUser = {
      id: 'internal-uuid-123',
      userId: 'usr-abc123def456',
      name: 'John Doe',
      address: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        town: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
      },
      phoneNumber: '+447700900123',
      email: 'john.doe@example.com',
      createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
      updatedTimestamp: new Date('2024-01-16T14:20:00.000Z'),
    };

    it('should convert Prisma User to User interface correctly', () => {
      const result = mapPrismaUserToUser(mockPrismaUser);

      expect(result).toEqual({
        id: 'internal-uuid-123',
        userId: 'usr-abc123def456',
        name: 'John Doe',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
        phoneNumber: '+447700900123',
        email: 'john.doe@example.com',
        createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
        updatedTimestamp: new Date('2024-01-16T14:20:00.000Z'),
      });
    });

    it('should preserve internal database ID', () => {
      const result = mapPrismaUserToUser(mockPrismaUser);
      
      expect(result.id).toBe('internal-uuid-123');
      expect(result.id).toBe(mockPrismaUser.id);
    });

    it('should preserve customer-facing userId', () => {
      const result = mapPrismaUserToUser(mockPrismaUser);
      
      expect(result.userId).toBe('usr-abc123def456');
      expect(result.userId).toBe(mockPrismaUser.userId);
    });

    it('should handle address with optional fields missing', () => {
      const prismaUserWithMinimalAddress = {
        ...mockPrismaUser,
        address: {
          line1: '456 Oak Street',
          town: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'M1 1AA',
        },
      };

      const result = mapPrismaUserToUser(prismaUserWithMinimalAddress);

      expect(result.address).toEqual({
        line1: '456 Oak Street',
        town: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M1 1AA',
      });
      expect(result.address.line2).toBeUndefined();
      expect(result.address.line3).toBeUndefined();
    });

    it('should handle address with all fields present', () => {
      const prismaUserWithFullAddress = {
        ...mockPrismaUser,
        address: {
          line1: '789 Business Park',
          line2: 'Building A',
          line3: 'Floor 5',
          town: 'Birmingham',
          county: 'West Midlands',
          postcode: 'B1 1AA',
        },
      };

      const result = mapPrismaUserToUser(prismaUserWithFullAddress);

      expect(result.address.line1).toBe('789 Business Park');
      expect(result.address.line2).toBe('Building A');
      expect(result.address.line3).toBe('Floor 5');
      expect(result.address.town).toBe('Birmingham');
      expect(result.address.county).toBe('West Midlands');
      expect(result.address.postcode).toBe('B1 1AA');
    });

    it('should preserve Date objects for timestamps', () => {
      const result = mapPrismaUserToUser(mockPrismaUser);
      
      expect(result.createdTimestamp).toBeInstanceOf(Date);
      expect(result.updatedTimestamp).toBeInstanceOf(Date);
      expect(result.createdTimestamp).toEqual(new Date('2024-01-15T10:30:00.000Z'));
      expect(result.updatedTimestamp).toEqual(new Date('2024-01-16T14:20:00.000Z'));
    });

    it('should handle different email formats', () => {
      const prismaUserWithDifferentEmail = {
        ...mockPrismaUser,
        email: 'JANE.DOE@EXAMPLE.COM',
      };

      const result = mapPrismaUserToUser(prismaUserWithDifferentEmail);
      
      expect(result.email).toBe('JANE.DOE@EXAMPLE.COM');
    });

    it('should handle different phone number formats', () => {
      const prismaUserWithDifferentPhone = {
        ...mockPrismaUser,
        phoneNumber: '+1234567890',
      };

      const result = mapPrismaUserToUser(prismaUserWithDifferentPhone);
      
      expect(result.phoneNumber).toBe('+1234567890');
    });

    it('should handle different name formats', () => {
      const prismaUserWithDifferentName = {
        ...mockPrismaUser,
        name: 'Dr. Jane Smith-Jones',
      };

      const result = mapPrismaUserToUser(prismaUserWithDifferentName);
      
      expect(result.name).toBe('Dr. Jane Smith-Jones');
    });
  });

  describe('mapUserToResponse', () => {
    const mockUser: User = {
      id: 'internal-uuid-123',
      userId: 'usr-abc123def456',
      name: 'John Doe',
      address: {
        line1: '123 Main Street',
        line2: 'Apt 4B',
        town: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
      },
      phoneNumber: '+447700900123',
      email: 'john.doe@example.com',
      createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
      updatedTimestamp: new Date('2024-01-16T14:20:00.000Z'),
    };

    it('should map User entity to UserResponse DTO correctly', () => {
      const result = mapUserToResponse(mockUser);

      expect(result).toEqual({
        id: 'usr-abc123def456', // Internal userId mapped to API id
        name: 'John Doe',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
        phoneNumber: '+447700900123',
        email: 'john.doe@example.com',
        createdTimestamp: '2024-01-15T10:30:00.000Z', // Date converted to ISO string
        updatedTimestamp: '2024-01-16T14:20:00.000Z', // Date converted to ISO string
      });
    });

    it('should map internal userId to API id field', () => {
      const result = mapUserToResponse(mockUser);
      
      expect(result.id).toBe(mockUser.userId);
      expect(result.id).not.toBe(mockUser.id); // Should not expose internal ID
    });

    it('should convert Date objects to ISO strings', () => {
      const result = mapUserToResponse(mockUser);
      
      expect(typeof result.createdTimestamp).toBe('string');
      expect(typeof result.updatedTimestamp).toBe('string');
      expect(result.createdTimestamp).toBe('2024-01-15T10:30:00.000Z');
      expect(result.updatedTimestamp).toBe('2024-01-16T14:20:00.000Z');
    });

    it('should handle address with optional fields missing', () => {
      const userWithMinimalAddress: User = {
        ...mockUser,
        address: {
          line1: '456 Oak Street',
          town: 'Manchester',
          county: 'Greater Manchester',
          postcode: 'M1 1AA',
        },
      };

      const result = mapUserToResponse(userWithMinimalAddress);

      expect(result.address).toEqual({
        line1: '456 Oak Street',
        town: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M1 1AA',
      });
      expect(result.address.line2).toBeUndefined();
      expect(result.address.line3).toBeUndefined();
    });

    it('should preserve all address fields when present', () => {
      const userWithFullAddress: User = {
        ...mockUser,
        address: {
          line1: '789 Business Park',
          line2: 'Building A',
          line3: 'Floor 5',
          town: 'Birmingham',
          county: 'West Midlands',
          postcode: 'B1 1AA',
        },
      };

      const result = mapUserToResponse(userWithFullAddress);

      expect(result.address.line1).toBe('789 Business Park');
      expect(result.address.line2).toBe('Building A');
      expect(result.address.line3).toBe('Floor 5');
      expect(result.address.town).toBe('Birmingham');
      expect(result.address.county).toBe('West Midlands');
      expect(result.address.postcode).toBe('B1 1AA');
    });

    it('should not expose internal database ID', () => {
      const result = mapUserToResponse(mockUser);
      
      expect(result).not.toHaveProperty('internalId');
      expect(Object.keys(result)).not.toContain('internalId');
    });
  });

  describe('Integration: mapPrismaUserToUser + mapUserToResponse', () => {
    it('should correctly transform Prisma User to API Response', () => {
      const mockPrismaUser = {
        id: 'internal-uuid-123',
        userId: 'usr-abc123def456',
        name: 'John Doe',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
        phoneNumber: '+447700900123',
        email: 'john.doe@example.com',
        createdTimestamp: new Date('2024-01-15T10:30:00.000Z'),
        updatedTimestamp: new Date('2024-01-16T14:20:00.000Z'),
      };

      // Step 1: Convert Prisma User to our User interface
      const user = mapPrismaUserToUser(mockPrismaUser);
      
      // Step 2: Convert User interface to API Response
      const response = mapUserToResponse(user);

      // Verify the final API response
      expect(response).toEqual({
        id: 'usr-abc123def456', // Customer-facing ID
        name: 'John Doe',
        address: {
          line1: '123 Main Street',
          line2: 'Apt 4B',
          town: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
        },
        phoneNumber: '+447700900123',
        email: 'john.doe@example.com',
        createdTimestamp: '2024-01-15T10:30:00.000Z',
        updatedTimestamp: '2024-01-16T14:20:00.000Z',
      });

      // Verify internal ID is not exposed
      expect(response).not.toHaveProperty('internalId');
      expect(response.id).not.toBe('internal-uuid-123');
    });
  });
}); 