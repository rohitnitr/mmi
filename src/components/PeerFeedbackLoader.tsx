import { createClient } from "@supabase/supabase-js";
import PeerFeedbackSection from "@/components/PeerFeedbackSection";
import { getPeerFeedback } from "@/lib/peer-feedback";

// Server component. Give it the page's "params"; it finds the user, checks the
// profile is public, and renders the section. Renders nothing on any problem.
type P = { username: string };

export default async function PeerFeedbackLoader({ params }: { params: Promise<P> | P }) {
  try {
    const { username } = await params;
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!sbUrl || !key) return null;

    const admin: any = createClient(sbUrl, key, { auth: { persistSession: false } });

    const { data: user } = await admin
      .from("users")
      .select("id")
      .eq("username", decodeURIComponent(username))
      .maybeSingle();
    if (!user) return null;

    // profiles may be keyed by id or user_id; try both
    let profile: any = null;
    for (const col of ["id", "user_id"]) {
      const r = await admin.from("profiles").select("*").eq(col, user.id).maybeSingle();
      if (!r.error) {
        profile = r.data;
        break;
      }
    }
    if (!profile || profile.is_public !== true) return null;

    const data = await getPeerFeedback(admin, user.id);
    return <PeerFeedbackSection data={data} />;
  } catch {
    return null;
  }
}
