-- 커피로(Coffee LO) 초기 스키마

-- Enums
CREATE TYPE store_type AS ENUM ('STARBUCKS', 'FRANCHISE', 'INDIVIDUAL');
CREATE TYPE pickup_status AS ENUM ('REQUESTED', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'LOADED', 'COMPLETED', 'CANCELLED');
CREATE TYPE container_type AS ENUM ('BOX', 'BAG');
CREATE TYPE weigh_in_status AS ENUM ('IN_PROGRESS', 'COMPLETED');
CREATE TYPE settlement_status AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'DISPUTED');

-- 기사 테이블
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  truck_type TEXT NOT NULL DEFAULT '1톤',
  license_plate TEXT,
  profile_photo TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 카페 테이블
CREATE TABLE cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  store_type store_type NOT NULL DEFAULT 'INDIVIDUAL',
  address TEXT NOT NULL,
  phone TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 계량 테이블
CREATE TABLE weigh_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  loaded_weight DOUBLE PRECISION,
  empty_weight DOUBLE PRECISION,
  net_weight DOUBLE PRECISION,
  loaded_photo_url TEXT,
  empty_photo_url TEXT,
  status weigh_in_status NOT NULL DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 수거 테이블
CREATE TABLE pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  cafe_id UUID NOT NULL REFERENCES cafes(id),
  status pickup_status NOT NULL DEFAULT 'REQUESTED',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  overall_photo_url TEXT,
  total_weight DOUBLE PRECISION,
  settlement_amount INTEGER,
  note TEXT,
  weigh_in_id UUID REFERENCES weigh_ins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 컨테이너 (박스/봉지) 테이블
CREATE TABLE containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id UUID NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
  type container_type NOT NULL DEFAULT 'BOX',
  weight DOUBLE PRECISION NOT NULL DEFAULT 0,
  photo_url TEXT,
  sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 정산 테이블
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_weight DOUBLE PRECISION NOT NULL DEFAULT 0,
  rate_per_kg INTEGER NOT NULL DEFAULT 80,
  gross_amount INTEGER NOT NULL DEFAULT 0,
  status settlement_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 공지사항 테이블
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_pickups_driver_status ON pickups(driver_id, status);
CREATE INDEX idx_pickups_driver_date ON pickups(driver_id, completed_at);
CREATE INDEX idx_containers_pickup ON containers(pickup_id);
CREATE INDEX idx_weigh_ins_driver_date ON weigh_ins(driver_id, date);
CREATE INDEX idx_settlements_driver_period ON settlements(driver_id, period_start);

-- RLS 활성화
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 기사는 자기 데이터만 접근
CREATE POLICY "drivers_own" ON drivers
  FOR ALL USING (auth_id = auth.uid());

CREATE POLICY "pickups_own" ON pickups
  FOR ALL USING (driver_id IN (SELECT id FROM drivers WHERE auth_id = auth.uid()));

CREATE POLICY "containers_own" ON containers
  FOR ALL USING (pickup_id IN (SELECT id FROM pickups WHERE driver_id IN (SELECT id FROM drivers WHERE auth_id = auth.uid())));

CREATE POLICY "weigh_ins_own" ON weigh_ins
  FOR ALL USING (driver_id IN (SELECT id FROM drivers WHERE auth_id = auth.uid()));

CREATE POLICY "settlements_own" ON settlements
  FOR ALL USING (driver_id IN (SELECT id FROM drivers WHERE auth_id = auth.uid()));

-- 카페, 공지사항은 모든 인증 사용자 읽기 가능
CREATE POLICY "cafes_read" ON cafes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "announcements_read" ON announcements
  FOR SELECT USING (is_active = true);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_weigh_ins_updated_at BEFORE UPDATE ON weigh_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_settlements_updated_at BEFORE UPDATE ON settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
