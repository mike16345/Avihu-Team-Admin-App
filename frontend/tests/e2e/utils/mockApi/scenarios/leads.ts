import { apiRoute, type MockScenarioMap } from "../routes";

const LEADS_ENDPOINT = "/leads";

export const leadsScenarios = {
  "leads.success": [
    apiRoute({
      method: "GET",
      pathname: LEADS_ENDPOINT,
      data: {
        items: [
          {
            _id: "lead-001",
            fullName: "Lead Example",
            email: "lead@example.com",
            phone: "0501234567",
            isContacted: false,
            registeredAt: "2025-02-01T09:00:00.000Z",
            createdAt: "2025-02-01T09:00:00.000Z",
            updatedAt: "2025-02-01T09:00:00.000Z",
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
      },
      message: "Leads loaded",
    }),
  ],
} satisfies MockScenarioMap;
