module.exports = {
  createURL: jest.fn().mockReturnValue('exp://localhost:19000/--/auth/callback'),
  openURL: jest.fn().mockResolvedValue(),
  getInitialURL: jest.fn().mockResolvedValue(''),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
};