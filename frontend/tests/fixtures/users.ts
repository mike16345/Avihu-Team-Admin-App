const now = Date.now();

export const usersListResponse = {
  data: [
    {
      _id: 'user-1',
      firstName: 'Dana',
      lastName: 'Levi',
      email: 'dana@example.com',
      phone: '0501234567',
      dietaryType: ['צמחוני'],
      dateFinished: now + 7 * 24 * 60 * 60 * 1000,
      planType: 'Bulk',
      remindIn: 604800,
      dateJoined: now - 14 * 24 * 60 * 60 * 1000,
      isChecked: false,
      checkInAt: now + 2 * 24 * 60 * 60 * 1000,
      hasAccess: true,
    },
    {
      _id: 'user-2',
      firstName: 'Noa',
      lastName: 'Cohen',
      email: 'noa@example.com',
      phone: '0527654321',
      dietaryType: [],
      dateFinished: now + 3 * 24 * 60 * 60 * 1000,
      planType: 'Cut',
      remindIn: 1209600,
      dateJoined: now - 30 * 24 * 60 * 60 * 1000,
      isChecked: true,
      checkInAt: now + 5 * 24 * 60 * 60 * 1000,
      hasAccess: false,
    },
  ],
  message: 'ok',
};

export const emptyUsersResponse = {
  data: [],
  message: 'ok',
};

export const userDetailResponse = {
  data: usersListResponse.data[0],
  message: 'ok',
};

export const createUserResponse = {
  data: { ...usersListResponse.data[0], _id: 'user-3' },
  message: 'created',
};

export const updateUserResponse = {
  data: { ...usersListResponse.data[0], firstName: 'Dana Updated' },
  message: 'updated',
};

export const deleteUserResponse = {
  data: { success: true },
  message: 'deleted',
};
