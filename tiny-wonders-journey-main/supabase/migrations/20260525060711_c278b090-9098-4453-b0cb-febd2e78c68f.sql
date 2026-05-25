
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Albums
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  album_name TEXT NOT NULL,
  subtitle TEXT,
  album_cover TEXT,
  theme_name TEXT NOT NULL DEFAULT 'pink',
  category TEXT NOT NULL DEFAULT 'month',
  emoji TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Admins manage albums" ON public.albums FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Photos
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_photos_album ON public.photos(album_id, display_order);
CREATE POLICY "Public can view photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Admins manage photos" ON public.photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER albums_updated BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('album-photos','album-photos',true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read album-photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'album-photos');
CREATE POLICY "Admin upload album-photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin update album-photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete album-photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'album-photos' AND public.has_role(auth.uid(),'admin'));

-- Seed albums
INSERT INTO public.albums (slug, album_name, subtitle, theme_name, category, emoji, display_order) VALUES
  ('month-1','Month 1','Tiny Beginnings','pink','month','🌸',1),
  ('month-2','Month 2','Stars in Her Eyes','sky','month','⭐',2),
  ('month-3','Month 3','Cuddles & Comfort','teddy','month','🧸',3),
  ('month-4','Month 4','Rainbow Smiles','rainbow','month','🌈',4),
  ('month-5','Month 5','Playful Days','toys','month','🎈',5),
  ('month-6','Month 6','Cartoon Adventures','cartoon','month','🎨',6),
  ('month-7','Month 7','To the Moon','moon','month','🌙',7),
  ('month-8','Month 8','Up, Up & Away','balloon','month','🎉',8),
  ('month-9','Month 9','Little Explorer','nature','month','🌿',9),
  ('month-10','Month 10','Animal Friends','animal','month','🐻',10),
  ('month-11','Month 11','Sweet as Candy','candy','month','🍭',11),
  ('month-12','Month 12','One Year of Wonder','celebration','month','🎂',12),
  ('naming-ceremony','Naming Ceremony','The day we whispered her name','pink','event','🕊️',13),
  ('first-birthday','First Birthday','One whole year of magic','party','event','🎂',14),
  ('family-moments','Family Moments','Wrapped in love together','teddy','event','👨‍👩‍👧',15),
  ('special-memories','Special Memories','Little moments, big magic','rainbow','event','✨',16);

-- Seed admin user
DO $$
DECLARE _uid uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', _uid, 'authenticated','authenticated',
    'anvithasri@admin.local', crypt('Anu@123', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"Anvithasri"}'::jsonb,
    now(), now(), '', '', '', ''
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), _uid,
    jsonb_build_object('sub', _uid::text, 'email','anvithasri@admin.local','email_verified',true),
    'email', _uid::text, now(), now(), now());
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin');
END $$;
