-- 회원가입 시 자기 데이터 INSERT 허용

-- 기사: 인증된 사용자가 자기 auth_id로 INSERT 가능
CREATE POLICY "drivers_insert_own" ON drivers
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- 카페: 인증된 사용자가 자기 auth_id로 INSERT 가능
CREATE POLICY "cafes_insert_own" ON cafes
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- 회사: 인증된 사용자가 자기 auth_id로 INSERT 가능
CREATE POLICY "companies_insert_own" ON companies
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Supabase Auth 이메일 확인 비활성화 (테스트용)
-- Supabase Dashboard → Authentication → Providers → Email → Confirm email OFF
