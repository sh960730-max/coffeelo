-- 커피로 역할 확장: 점주 + 소속회사 관리자

-- 소속회사 테이블
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- cafes에 owner auth_id 추가
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- drivers에 company_id 추가
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- pickups에 점주 신청 정보 추가
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS container_type TEXT DEFAULT 'BOX';
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS estimated_count INTEGER DEFAULT 1;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS estimated_weight DOUBLE PRECISION;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS preferred_time TEXT;

-- RLS for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_own" ON companies
  FOR ALL USING (auth_id = auth.uid());

-- 소속회사는 소속 기사의 수거 데이터 조회 가능
CREATE POLICY "pickups_company_read" ON pickups
  FOR SELECT USING (
    driver_id IN (
      SELECT d.id FROM drivers d
      JOIN companies c ON d.company_id = c.id
      WHERE c.auth_id = auth.uid()
    )
  );

-- 점주는 자기 매장의 수거 데이터 접근 가능
CREATE POLICY "pickups_cafe_owner" ON pickups
  FOR ALL USING (
    cafe_id IN (SELECT id FROM cafes WHERE auth_id = auth.uid())
  );

-- 점주는 자기 매장 정보 수정 가능
CREATE POLICY "cafes_owner" ON cafes
  FOR ALL USING (auth_id = auth.uid());

-- 소속회사는 소속 기사 조회 가능
CREATE POLICY "drivers_company_read" ON drivers
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth_id = auth.uid())
  );

-- 소속회사는 정산 데이터 조회/수정 가능
CREATE POLICY "settlements_company" ON settlements
  FOR ALL USING (
    driver_id IN (
      SELECT d.id FROM drivers d
      JOIN companies c ON d.company_id = c.id
      WHERE c.auth_id = auth.uid()
    )
  );

-- 소속회사는 계량 데이터 조회 가능
CREATE POLICY "weigh_ins_company_read" ON weigh_ins
  FOR SELECT USING (
    driver_id IN (
      SELECT d.id FROM drivers d
      JOIN companies c ON d.company_id = c.id
      WHERE c.auth_id = auth.uid()
    )
  );

-- 소속회사는 컨테이너 데이터 조회 가능
CREATE POLICY "containers_company_read" ON containers
  FOR SELECT USING (
    pickup_id IN (
      SELECT p.id FROM pickups p
      WHERE p.driver_id IN (
        SELECT d.id FROM drivers d
        JOIN companies c ON d.company_id = c.id
        WHERE c.auth_id = auth.uid()
      )
    )
  );

-- 공지사항: 소속회사가 작성 가능
CREATE POLICY "announcements_company_write" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM companies WHERE auth_id = auth.uid())
  );

-- updated_at 트리거
CREATE TRIGGER tr_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
