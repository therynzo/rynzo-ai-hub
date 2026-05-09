
-- Admin-only secrets storage (API keys)
CREATE TABLE IF NOT EXISTS public.admin_secrets (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read secrets" ON public.admin_secrets
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins write secrets" ON public.admin_secrets
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_secrets (key, value) VALUES
  ('OPENAI_API_KEY',''),
  ('GEMINI_API_KEY','')
ON CONFLICT (key) DO NOTHING;

-- Make sure trigger is attached for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
