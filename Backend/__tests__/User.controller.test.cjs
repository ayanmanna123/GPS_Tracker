// Mock the User model before importing the controller
jest.mock('../models/User.model.js', () => {
  const mockUser = {
    create: jest.fn(),
  };
  return mockUser;
});

// Mock mongoose to prevent database connections
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
  },
}));

const { createUser } = require('../controllers/User.controller.js');
const User = require('../models/User.model.js');

describe('User Controller - createUser', () => {
  let mockReq;
  let mockRes;
  let mockJson;
  let mockStatus;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockReq = {
      auth: { sub: 'auth0-user-id' },
      body: {},
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Validation Tests', () => {
    test('should return 400 when fullname is missing', async () => {
      mockReq.body = { email: 'test@example.com', picture: 'pic.jpg' };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'all fields are required',
        success: false,
      });
    });

    test('should return 400 when email is missing', async () => {
      mockReq.body = { fullname: 'John Doe', picture: 'pic.jpg' };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'all fields are required',
        success: false,
      });
    });

    test('should return 400 when picture is missing', async () => {
      mockReq.body = { fullname: 'John Doe', email: 'test@example.com' };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'all fields are required',
        success: false,
      });
    });

    test('should return 400 when name is too short', async () => {
      mockReq.body = { fullname: 'A', email: 'test@example.com', picture: 'pic.jpg' };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Name must be between 2 and 50 characters',
        success: false,
      });
    });

    test('should return 400 when name is too long', async () => {
      mockReq.body = {
        fullname: 'A'.repeat(51),
        email: 'test@example.com',
        picture: 'pic.jpg'
      };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Name must be between 2 and 50 characters',
        success: false,
      });
    });

    test('should return 400 when email format is invalid', async () => {
      mockReq.body = { fullname: 'John Doe', email: 'invalid-email', picture: 'pic.jpg' };

      await createUser(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Invalid email format',
        success: false,
      });
    });
  });

  describe('Successful Creation', () => {
    test('should create user successfully with valid data', async () => {
      const mockUserData = {
        _id: 'user-id',
        auth0Id: 'auth0-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg',
      };

      User.create.mockResolvedValue(mockUserData);

      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg'
      };

      await createUser(mockReq, mockRes);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: 'auth0-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg',
      });

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'user create success fully',
        userData: mockUserData,
        success: true,
      });
    }, 10000);

    test('should trim whitespace from inputs', async () => {
      const mockUserData = {
        _id: 'user-id',
        auth0Id: 'auth0-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg',
      };

      User.create.mockResolvedValue(mockUserData);

      mockReq.body = {
        fullname: '  John Doe  ',
        email: '  john@example.com  ',
        picture: '  profile.jpg  '
      };

      await createUser(mockReq, mockRes);

      expect(User.create).toHaveBeenCalledWith({
        auth0Id: 'auth0-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg',
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      User.create.mockRejectedValue(error);

      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        picture: 'profile.jpg'
      };

      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await createUser(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
      // The function should not call res.status or res.json on error
      // as it currently just logs the error
    });
  });
});