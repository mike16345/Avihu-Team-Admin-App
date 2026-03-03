import { apiRoute, type MockScenarioMap } from "../routes";

const BLOGS_ENDPOINT = "/blogs/paginate";
const LESSON_GROUPS_ENDPOINT = "/lessonGroups";

export const blogsScenarios = {
  "blogs.success": [
    apiRoute({
      method: "GET",
      pathname: BLOGS_ENDPOINT,
      data: {
        results: [],
        totalResults: 0,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      message: "Blogs loaded",
    }),
    apiRoute({
      method: "GET",
      pathname: LESSON_GROUPS_ENDPOINT,
      data: [],
      message: "Lesson groups loaded",
    }),
  ],
} satisfies MockScenarioMap;
