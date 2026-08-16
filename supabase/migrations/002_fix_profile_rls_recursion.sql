-- Avoid recursive RLS evaluation when admin policies check profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admin reads all profiles" ON public.profiles;
CREATE POLICY "Admin reads all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on books" ON public.books;
CREATE POLICY "Admin full access on books" ON public.books
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Authorized read on book_pages" ON public.book_pages;
CREATE POLICY "Authorized read on book_pages" ON public.book_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_books
      WHERE user_books.user_id = auth.uid()
        AND user_books.book_id = book_pages.book_id
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin full access on book_pages" ON public.book_pages;
CREATE POLICY "Admin full access on book_pages" ON public.book_pages
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manages all orders" ON public.orders;
CREATE POLICY "Admin manages all orders" ON public.orders
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin manages all grants" ON public.user_books;
CREATE POLICY "Admin manages all grants" ON public.user_books
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin upload to book-pages" ON storage.objects;
CREATE POLICY "Admin upload to book-pages" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-pages'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admin upload to book-covers" ON storage.objects;
CREATE POLICY "Admin upload to book-covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'book-covers'
    AND public.is_admin()
  );
