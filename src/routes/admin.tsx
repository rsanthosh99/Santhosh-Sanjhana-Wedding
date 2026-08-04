import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeroPicker } from "@/components/AdminHeroPicker";
import { claimFirstAdmin, getAdminStatus } from "@/lib/gallery.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Manage Photos — Santhosh & Sanjhana" },
      { name: "description", content: "Private dashboard for choosing chapter hero photos." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Manage Photos — Santhosh & Sanjhana" },
      { property: "og:description", content: "Private photo management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-32 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="font-serif text-4xl text-foreground sm:text-5xl">Manage Photos</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Drop photos into the matching folder in your Google Cloud bucket, then choose a hero
          image for each chapter here.
        </p>

        <div className="mt-12">
          {session === null ? null : session ? <AdminArea /> : <SignIn />}
        </div>
      </div>
    </main>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setBusy(false);
    if (error) setMessage(error.message);
    else if (mode === "up") setMessage("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4 border border-border p-8">
      <h2 className="font-serif text-2xl text-foreground">
        {mode === "in" ? "Sign in" : "Create account"}
      </h2>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
      />
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-foreground py-3 text-[11px] tracking-editorial text-background disabled:opacity-50"
      >
        {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
      </button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="text-[11px] tracking-editorial text-muted-foreground underline"
      >
        {mode === "in" ? "Need an account?" : "Already have an account?"}
      </button>
    </form>
  );
}

function AdminArea() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getAdminStatus(),
  });

  if (isLoading) return null;

  if (!data?.isAdmin) {
    return (
      <div className="max-w-md space-y-4 border border-border p-8">
        <p className="text-sm text-muted-foreground">
          This account is not an administrator yet. If you are the first person setting this up,
          claim admin access below.
        </p>
        <button
          onClick={async () => {
            await claimFirstAdmin();
            refetch();
          }}
          className="bg-foreground px-6 py-3 text-[11px] tracking-editorial text-background"
        >
          Claim admin access
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="block text-[11px] tracking-editorial text-muted-foreground underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-[11px] tracking-editorial text-muted-foreground underline"
        >
          Sign out
        </button>
      </div>
      <AdminHeroPicker />
    </>
  );
}
