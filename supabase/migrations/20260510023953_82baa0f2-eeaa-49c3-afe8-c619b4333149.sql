CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND (
        _role <> 'admin'::public.app_role
        OR lower(p.email) = 'therynzo7@gmail.com'
      )
  )
$$;

DELETE FROM public.user_roles
WHERE role = 'admin'::public.app_role
  AND user_id NOT IN (
    SELECT id FROM public.profiles WHERE lower(email) = 'therynzo7@gmail.com'
  );

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE lower(email) = 'therynzo7@gmail.com'
ON CONFLICT DO NOTHING;