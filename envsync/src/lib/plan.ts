import type { Plan } from "@prisma/client";

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 1,
  PRO: 5,
  TEAM: Infinity,
};

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  PRO: "Pro",
  TEAM: "Team",
};
