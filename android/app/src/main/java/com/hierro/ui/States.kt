package com.hierro.ui

import com.hierro.data.Dates
import com.hierro.data.Progress
import com.hierro.data.Session
import java.time.LocalDate

enum class SpanView(val label: String) { Dia("Día"), Semana("Semana"), Mes("Mes") }

/** Port de useHorizon() (PeriodBar.tsx): fecha y vista con límites del rango. */
data class Horizon(val date: LocalDate, val view: SpanView = SpanView.Dia) {
    val week: List<LocalDate> get() = Dates.weekOf(date)

    fun withDate(next: LocalDate) = copy(date = Dates.clampToRange(next))

    fun step(dir: Int): Horizon = when (view) {
        SpanView.Dia -> withDate(date.plusDays(dir.toLong()))
        SpanView.Semana -> withDate(date.plusDays(7L * dir))
        SpanView.Mes -> {
            val shifted = date.withDayOfMonth(1).plusMonths(dir.toLong())
            withDate(shifted.withDayOfMonth(minOf(date.dayOfMonth, shifted.lengthOfMonth())))
        }
    }

    val atStart: Boolean get() = when (view) {
        SpanView.Dia -> !date.isAfter(Dates.RANGE_START)
        SpanView.Semana -> !Dates.mondayOnOrBefore(date).isAfter(Dates.mondayOnOrBefore(Dates.RANGE_START))
        SpanView.Mes -> date.year == 2026 && date.monthValue == 10
    }

    val atEnd: Boolean get() = when (view) {
        SpanView.Dia -> !date.isBefore(Dates.RANGE_END)
        SpanView.Semana -> !Dates.mondayOnOrBefore(date).isBefore(Dates.mondayOnOrBefore(Dates.RANGE_END))
        SpanView.Mes -> date.year == 2027 && date.monthValue == 2
    }

    val title: String get() = when (view) {
        SpanView.Dia -> Dates.capitalize(Dates.formatLong(date))
        SpanView.Mes -> "${Dates.MONTHS[date.monthValue - 1]} ${date.year}"
        SpanView.Semana -> Dates.formatWeekSpan(week.filter(Dates::isInRange))
    }

    companion object {
        fun initial(today: LocalDate, seed: LocalDate? = null) =
            Horizon(if (Dates.isInRange(today)) today else seed ?: Dates.initialDate(today))
    }
}

/** Lógica del entreno guiado (GuidedWorkout en Extras.tsx). */
data class GuidedState(val index: Int = 0, val set: Int = 1, val rest: Int = 0) {
    fun total(session: Session) = session.exercises.getOrNull(index)?.let { Progress.parseSets(it.reps) } ?: 0

    fun go(session: Session, next: Int) = GuidedState(next.coerceIn(0, session.exercises.lastIndex), 1, 0)

    /** Devuelve el estado nuevo y, si el ejercicio terminó, su id para marcarlo hecho. */
    fun completeSet(session: Session): Pair<GuidedState, String?> {
        val exercise = session.exercises[index]
        if (set < total(session)) return copy(set = set + 1, rest = Progress.parseRest(exercise.reps)) to null
        val next = if (index < session.exercises.lastIndex) go(session, index + 1) else this
        return next to exercise.id
    }

    fun tick() = if (rest > 0) copy(rest = rest - 1) else this

    fun skipRest() = copy(rest = 0)

    companion object {
        fun start(session: Session, isDone: (String) -> Boolean): GuidedState {
            val first = session.exercises.indexOfFirst { !isDone(it.id) }
            return GuidedState(if (first < 0) 0 else first)
        }

        fun formatRest(seconds: Int) = if (seconds > 0) "%d:%02d".format(seconds / 60, seconds % 60) else "Listo"
    }
}
