import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DriverHeader from '../components/driver/DriverHeader'
import ActivePickupCard from '../components/driver/ActivePickupCard'
import PickupCallList from '../components/driver/PickupCallList'
import DriverWeighStation from '../components/driver/DriverWeighStation'
import DriverStats from '../components/driver/DriverStats'
import DriverBottomNav from '../components/driver/DriverBottomNav'
import PickupConfirm from './PickupConfirm'
import type { PickupStop, PickupCall } from './driver/HomePage'

export default function DriverHome() {
  const [showPickupConfirm, setShowPickupConfirm] = useState(false)
  const [activePickups] = useState<PickupStop[]>([])
  const [calls] = useState<PickupCall[]>([])

  const handleAcceptCall = (_callId: string) => {}
  const handleDeclineCall = (_callId: string) => {}

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        {showPickupConfirm ? (
          <motion.div
            key="pickup-confirm"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <PickupConfirm />
          </motion.div>
        ) : (
          <motion.div
            key="driver-home"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <DriverHeader />
            <main className="overflow-y-auto">
              <ActivePickupCard
                pickups={activePickups}
                onPickupConfirm={() => setShowPickupConfirm(true)}
              />
              <PickupCallList
                calls={calls}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
              />
              <DriverWeighStation />
              <DriverStats />
            </main>
            <DriverBottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
