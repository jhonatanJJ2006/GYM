package com.hierro.notify

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.hierro.MainActivity
import com.hierro.R
import com.hierro.data.Agenda
import com.hierro.data.DataStoreUserRepository
import com.hierro.data.JsonPlanRepository
import com.hierro.data.Time
import com.hierro.data.Upcoming
import kotlinx.coroutines.flow.first
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

/** Recordatorios locales con WorkManager: 10 minutos antes de cada bloque de hoy. */
object Reminders {
    const val CHANNEL = "hierro-avisos"
    const val LEAD_MINUTES = 10
    private const val DAILY = "hierro-planificador"
    const val TAG = "hierro-aviso"

    fun enable(context: Context) {
        val wm = WorkManager.getInstance(context)
        wm.enqueueUniquePeriodicWork(DAILY, ExistingPeriodicWorkPolicy.UPDATE, PeriodicWorkRequestBuilder<PlannerWorker>(12, TimeUnit.HOURS).build())
        wm.enqueue(OneTimeWorkRequestBuilder<PlannerWorker>().build())
    }

    fun disable(context: Context) {
        val wm = WorkManager.getInstance(context)
        wm.cancelUniqueWork(DAILY)
        wm.cancelAllWorkByTag(TAG)
    }

    /** Minutos de espera hasta el aviso; null si ya pasó. */
    fun delayMinutes(item: Upcoming, now: LocalDateTime): Int? {
        val minute = now.hour * 60 + now.minute
        val wait = item.start - LEAD_MINUTES - minute
        return if (wait >= 0) wait else null
    }

    fun ensureChannel(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, "Bloques del día", NotificationManager.IMPORTANCE_DEFAULT).apply { description = "Aviso antes de clases, gym, trabajo y comidas" })
    }
}

class PlannerWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val plan = JsonPlanRepository.get(applicationContext)
        val user = DataStoreUserRepository(applicationContext, plan.nutrition.shopping.size)
        if (!user.reminders.first()) return Result.success()
        val now = LocalDateTime.now()
        val wm = WorkManager.getInstance(applicationContext)
        Agenda.upcomingToday(plan, now, user.events.first()).forEach { item ->
            val wait = Reminders.delayMinutes(item, now) ?: return@forEach
            val request = OneTimeWorkRequestBuilder<NotifyWorker>()
                .setInitialDelay(wait.toLong(), TimeUnit.MINUTES)
                .addTag(Reminders.TAG)
                .setInputData(workDataOf("title" to item.label, "text" to "${item.kind.card} a las ${Time.formatClock(item.start)}", "id" to item.key.hashCode()))
                .build()
            wm.enqueueUniqueWork("aviso-${now.toLocalDate()}-${item.key}", ExistingWorkPolicy.REPLACE, request)
        }
        return Result.success()
    }
}

class NotifyWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val ctx = applicationContext
        if (ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED && android.os.Build.VERSION.SDK_INT >= 33) return Result.success()
        Reminders.ensureChannel(ctx)
        val open = PendingIntent.getActivity(ctx, 0, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(ctx, Reminders.CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_hierro)
            .setContentTitle(inputData.getString("title") ?: "Hierro")
            .setContentText(inputData.getString("text") ?: "")
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        runCatching { NotificationManagerCompat.from(ctx).notify(inputData.getInt("id", 1), notification) }
        return Result.success()
    }
}
