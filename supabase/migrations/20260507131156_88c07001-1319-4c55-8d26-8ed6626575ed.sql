
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  has_active_key BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.redeem_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.key_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES public.redeem_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key_id, user_id)
);

CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_provider TEXT NOT NULL DEFAULT 'lovable',
  default_model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  openai_enabled BOOLEAN NOT NULL DEFAULT false,
  gemini_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (1);

-- Security definer function to check role without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Trigger to create profile + assign admin role to the seed admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    NEW.email
  );

  IF lower(NEW.email) = 'therynzo7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeem_keys    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings   ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- redeem_keys
CREATE POLICY "auth read keys" ON public.redeem_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins insert keys" ON public.redeem_keys FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update keys" ON public.redeem_keys FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete keys" ON public.redeem_keys FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- key_redemptions
CREATE POLICY "users view own redemptions" ON public.key_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins view redemptions" ON public.key_redemptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "users insert own redemption" ON public.key_redemptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- chats
CREATE POLICY "users own chats" ON public.chats FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins view all chats" ON public.chats FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- chat_messages
CREATE POLICY "users own messages" ON public.chat_messages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins view all messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- app_settings
CREATE POLICY "auth read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins update settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Atomic redeem function
CREATE OR REPLACE FUNCTION public.redeem_key(_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _key public.redeem_keys%ROWTYPE;
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;

  SELECT * INTO _key FROM public.redeem_keys WHERE code = _code FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  IF NOT _key.is_active THEN RETURN jsonb_build_object('ok', false, 'error', 'inactive'); END IF;
  IF _key.expires_at IS NOT NULL AND _key.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;
  IF _key.used_count >= _key.usage_limit THEN
    RETURN jsonb_build_object('ok', false, 'error', 'limit_reached');
  END IF;

  IF EXISTS (SELECT 1 FROM public.key_redemptions WHERE key_id = _key.id AND user_id = _uid) THEN
    UPDATE public.profiles SET has_active_key = true WHERE id = _uid;
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  INSERT INTO public.key_redemptions (key_id, user_id) VALUES (_key.id, _uid);
  UPDATE public.redeem_keys SET used_count = used_count + 1 WHERE id = _key.id;
  UPDATE public.profiles SET has_active_key = true WHERE id = _uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;
