// Server-only. Aggregates peer evaluations for the public profile section
// "What people say about my skills". Pass an ADMIN (service-role) Supabase client.
// Only call this for profiles the owner has made public.

export type SkillFeedback = {
  skill: string;
  avg: number;
  ratings: number;
  peers: number;
};

export type PeerFeedback = {
  evaluationCount: number;
  peerCount: number;
  dimensions: { key: string; label: string; avg: number }[];
  skills: SkillFeedback[];
  comments: { text: string; date: string }[]; // "what went well" only
};

const DIMS: [string, string][] = [
  ["communication", "Communication"],
  ["structure", "Structure"],
  ["knowledge", "Knowledge"],
  ["problem_solving", "Problem solving"],
  ["overall", "Overall"],
];

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function getPeerFeedback(admin: any, userId: string): Promise<PeerFeedback> {
  const empty: PeerFeedback = {
    evaluationCount: 0,
    peerCount: 0,
    dimensions: [],
    skills: [],
    comments: [],
  };

  const [evalRes, skillRes] = await Promise.all([
    admin
      .from("session_evaluations")
      .select("evaluator_id, communication, structure, knowledge, problem_solving, overall, strengths, created_at")
      .eq("evaluatee_id", userId)
      .order("created_at", { ascending: false }),
    admin
      .from("skill_validations")
      .select("skill, rating_count, evaluator_count, avg_rating")
      .eq("evaluatee_id", userId)
      .order("avg_rating", { ascending: false }),
  ]);

  if (evalRes.error || skillRes.error) return empty;

  const evals: any[] = evalRes.data ?? [];
  if (evals.length === 0) return empty;

  const dimensions = DIMS.map(([key, label]) => ({
    key,
    label,
    avg: round1(evals.reduce((sum: number, e: any) => sum + Number(e[key] ?? 0), 0) / evals.length),
  }));

  const skills: SkillFeedback[] = (skillRes.data ?? []).map((s: any) => ({
    skill: String(s.skill),
    avg: Number(s.avg_rating),
    ratings: Number(s.rating_count),
    peers: Number(s.evaluator_count),
  }));

  const comments = evals
    .filter((e: any) => typeof e.strengths === "string" && e.strengths.trim().length > 0)
    .slice(0, 5)
    .map((e: any) => ({ text: String(e.strengths).trim(), date: String(e.created_at) }));

  return {
    evaluationCount: evals.length,
    peerCount: new Set(evals.map((e: any) => e.evaluator_id)).size,
    dimensions,
    skills,
    comments,
  };
}
