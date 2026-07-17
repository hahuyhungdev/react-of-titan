import {
  handleLoginUser,
  handleRegisterUser,
  handleGetCurrentUser,
  handleLogoutUser,
  handleGetDashboardStats,
  handleGetRecentActivities,
  handleGetInvoices,
  handleRefundInvoice,
} from "../../shared/api/generated/msw.gen";

export const handlers = [
  handleLoginUser({
    body: {
      user: {
        id: "usr_1",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      },
    },
  }),

  handleRegisterUser({
    body: {
      user: {
        id: "usr_2",
        email: "guest@example.com",
        firstName: "Guest",
        lastName: "User",
        avatarUrl: null,
      },
    },
  }),

  handleGetCurrentUser({
    body: {
      user: {
        id: "usr_1",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      },
    },
  }),

  handleLogoutUser({
    status: 204,
    body: undefined,
  }),

  handleGetDashboardStats({
    body: {
      totalUsers: 1284,
      activeUsers: 342,
      revenue: 48250,
      growth: 12.5,
    },
  }),

  handleGetRecentActivities({
    body: [
      { id: "act_1", message: "New user registered", timestamp: "2026-06-25T10:00:00.000Z", type: "success" },
      { id: "act_2", message: "Server memory utilization reached 92%", timestamp: "2026-06-25T11:30:00.000Z", type: "warning" },
      { id: "act_3", message: "Production deployment successful", timestamp: "2026-06-24T18:00:00.000Z", type: "info" },
    ],
  }),

  handleGetInvoices({
    body: [
      { id: "inv_1", customer: "Acme Corp", amount: 1500.0, status: "paid", date: "2026-06-20T00:00:00.000Z" },
      { id: "inv_2", customer: "Globex Corp", amount: 850.5, status: "pending", date: "2026-06-22T00:00:00.000Z" },
      { id: "inv_3", customer: "Initech", amount: 250.0, status: "failed", date: "2026-06-23T00:00:00.000Z" },
    ],
  }),

  handleRefundInvoice({
    body: {
      success: true,
    },
  }),
];
