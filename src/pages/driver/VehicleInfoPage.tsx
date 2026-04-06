import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function VehicleInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [truckType, setTruckType] = useState((user as any)?.truck_type ?? '');
  const [licensePlate, setLicensePlate] = useState((user as any)?.license_plate ?? '');

  useEffect(() => {
    if (user) {
      setTruckType((user as any).truck_type ?? '');
      setLicensePlate((user as any).license_plate ?? '');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-gray-600" />
        </motion.button>
        <h1 className="text-base font-bold text-gray-900">차량 정보</h1>
      </header>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">차량 종류</label>
            <div className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 flex items-center justify-between">
              <span>{truckType || '미등록'}</span>
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">번호판</label>
            <div className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 flex items-center justify-between">
              <span>{licensePlate || '미등록'}</span>
              <Lock className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">차량 정보 변경은 관리자에게 문의해 주세요</p>
      </div>
    </div>
  );
}
