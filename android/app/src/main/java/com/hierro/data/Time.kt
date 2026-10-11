package com.hierro.data

/** Port de src/lib/time.ts. */
object Time {
    fun parseClock(value: String): Int {
        val (h, m) = value.split(":").map { it.trim().toInt() }
        return h * 60 + m
    }

    /** Hora "H:MM" o "HH:MM" entre 00:00 y 23:59; null si el texto no es una hora. */
    fun parseClockOrNull(value: String): Int? {
        val m = Regex("^\\s*(\\d{1,2})\\s*:\\s*(\\d{2})\\s*$").find(value) ?: return null
        val h = m.groupValues[1].toInt()
        val min = m.groupValues[2].toInt()
        return if (h in 0..23 && min in 0..59) h * 60 + min else null
    }

    /** El horario de clase lista el último minuto ocupado (11:59). */
    fun classInterval(start: String, end: String) = Interval(parseClock(start), parseClock(end) + 1)

    /** El gym usa hora de cierre: ese minuto ya está libre. */
    fun spanInterval(span: String): Interval {
        val (a, b) = span.split("–")
        return Interval(parseClock(a), parseClock(b))
    }

    fun formatClock(minutes: Int): String = "%02d:%02d".format(minutes / 60, minutes % 60)

    fun formatDuration(minutes: Int): String {
        val h = minutes / 60
        val m = minutes % 60
        if (h == 0) return "$m min"
        if (m == 0) return if (h == 1) "1 h" else "$h h"
        return "$h h $m min"
    }

    fun formatSpan(interval: Interval): String = "${formatClock(interval.start)}–${formatClock(interval.end)}"
}
