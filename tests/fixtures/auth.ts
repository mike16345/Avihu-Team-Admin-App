export const loginSuccessResponse = {
  data: {
    _id: 'session-1',
    userId: 'user-1',
    type: 'login',
    data: {
      user: {
        firstName: 'Admin',
        lastName: 'User',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  message: 'ok',
};

export const loginFailureResponse = {
  data: null,
  message: 'Invalid credentials',
};
