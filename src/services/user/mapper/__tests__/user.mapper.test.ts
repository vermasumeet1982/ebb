import { mapUserToResponse } from '../user.mapper';
import { User } from '../../entities';

describe('User Mapper', () => {
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
}); 