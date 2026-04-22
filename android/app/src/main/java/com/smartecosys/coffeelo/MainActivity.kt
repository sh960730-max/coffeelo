package com.smartecosys.coffeelo

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannels()
        // 앱 시작 시 딥링크 처리
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data = intent?.data ?: return
        val path = data.path ?: return
        // Capacitor Bridge를 통해 React 쪽으로 URL 전달
        bridge?.webView?.post {
            bridge.webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('capacitor-deep-link', { detail: '${path}${data.query?.let { "?$it" } ?: ""}' }))",
                null
            )
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = getSystemService(NotificationManager::class.java) ?: return

        // 새 수거 콜 (최고 우선순위 - 헤드업 알림)
        NotificationChannel(
            "new_pickup_call",
            "새 수거 콜",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "점주의 새 수거 요청 알림"
            enableVibration(true)
            enableLights(true)
            manager.createNotificationChannel(this)
        }

        // 수거 배정
        NotificationChannel(
            "pickup_assign",
            "수거 배정",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "수거 기사 배정 완료 알림"
            enableVibration(true)
            manager.createNotificationChannel(this)
        }

        // 수거 완료
        NotificationChannel(
            "pickup_complete",
            "수거 완료",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "수거 완료 알림"
            manager.createNotificationChannel(this)
        }

        // 공지사항
        NotificationChannel(
            "notice",
            "공지사항",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "공지사항 및 일반 알림"
            manager.createNotificationChannel(this)
        }
    }
}
