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

// Free and Pro are single-seat per the pricing page ("Team members" is a Team-only line item).
export const MEMBER_LIMITS: Record<Plan, number> = {
  FREE: 1,
  PRO: 1,
  TEAM: Infinity,
};

export const API_KEY_LIMITS: Record<Plan, number> = {
  FREE: 1,
  PRO: 3,
  TEAM: Infinity,
};
