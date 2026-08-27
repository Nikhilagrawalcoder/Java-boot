"use server";

import { auth } from "@/auth";
import { getPrimaryMembership } from "@/lib/org";
import { getRepositoryDashboardData } from "@/lib/scan/dashboard-data";
import { answerCopilotQuestion } from "@/lib/copilot";

export interface CopilotState {
  question: string;
  answer: string | null;
}

export async function askCopilotAction(
  repositoryId: string,
  _prevState: CopilotState,
  formData: FormData
): Promise<CopilotState> {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const membership = await getPrimaryMembership(session.user.id);
  const owns = membership?.organization.repositories.some((r) => r.id === repositoryId);
  if (!owns) throw new Error("Not authorized for this repository");

  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { question: "", answer: null };

  const data = await getRepositoryDashboardData(repositoryId);
  const answer = answerCopilotQuestion(question, data);

  return { question, answer };
}
