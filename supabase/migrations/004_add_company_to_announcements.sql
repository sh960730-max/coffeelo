-- announcements 테이블에 company 컬럼 추가
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS company TEXT NOT NULL DEFAULT '';

-- RLS 정책 업데이트: company 필터 허용
DROP POLICY IF EXISTS "announcements_read" ON announcements;

CREATE POLICY "announcements_read" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (auth.uid() IS NOT NULL);
