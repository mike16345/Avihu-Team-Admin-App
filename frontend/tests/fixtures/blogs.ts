export const blogGroupsResponse = {
  data: [
    { _id: 'group-1', name: 'כללי' },
    { _id: 'group-2', name: 'כושר' },
  ],
  message: 'ok',
};

export const blogsPageResponse = {
  data: {
    results: [
      {
        _id: 'blog-1',
        title: 'אימונים למתחילים',
        content: '<p>תוכן ראשוני</p>',
        planType: 'General',
        group: blogGroupsResponse.data[0],
        link: 'https://youtube.com/watch?v=123',
      },
    ],
    totalResults: 1,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  message: 'ok',
};

export const emptyBlogsPageResponse = {
  data: {
    results: [],
    totalResults: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  message: 'ok',
};

export const blogDetailResponse = {
  data: blogsPageResponse.data.results[0],
  message: 'ok',
};

export const createBlogResponse = {
  data: { ...blogsPageResponse.data.results[0], _id: 'blog-2' },
  message: 'created',
};
