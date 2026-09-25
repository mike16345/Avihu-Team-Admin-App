export default {
  repository: "Avihu Team Admin App",
  outputDir: ".test-report",
  workflowPath: ".github/workflows/pr-tests.yml",
  email: {
    from: "Avihu CI <michaelgani815@gmail.com>",
    to: "michaelgani815@gmail.com",
  },
  suites: [
    {
      name: "Unit tests",
      framework: "playwright",
      cwd: "frontend",
      command: "npx",
      args: ["playwright", "test", "--config=playwright.unit.config.ts"],
    },
    {
      name: "End-to-end tests",
      framework: "playwright",
      cwd: "frontend",
      command: "npx",
      args: ["playwright", "test"],
    },
  ],
};
