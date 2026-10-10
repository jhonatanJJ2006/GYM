package com.hierro.data

import java.time.LocalDateTime

data class Upcoming(val key: String, val start: Int, val label: String, val kind: Kind)

object Agenda {
    fun eventsFor(events: List<CustomEvent>, iso: String) = events.filter { it.iso == iso }.sortedBy { it.start }

    /** Port de upcomingToday(): bloques y eventos propios de hoy que aún no empiezan. */
    fun upcomingToday(plan: PlanRepository, now: LocalDateTime, events: List<CustomEvent>): List<Upcoming> {
        val day = now.toLocalDate()
        val minute = now.hour * 60 + now.minute
        val list = mutableListOf<Upcoming>()
        plan.day(day)?.items?.forEach { item ->
            list += Upcoming("${item.kind.id}-${item.start}", item.start, label(item), item.kind)
        }
        eventsFor(events, Dates.toIso(day)).forEach { list += Upcoming(it.id, Time.parseClock(it.start), it.title, Kind.of(it.kind)) }
        return list.filter { it.start >= minute }.sortedBy { it.start }
    }

    fun label(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> item.block.name
        is TimelineItem.MealItem -> item.meal.role
        is TimelineItem.GymItem -> "Gym: ${item.session.title}"
        is TimelineItem.WorkItem -> "Trabajo"
    }

    /** Etiqueta corta de la grilla (itemLabel en WeekGrid.tsx). */
    fun gridLabel(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> item.block.short
        is TimelineItem.WorkItem -> "Trabajo"
        is TimelineItem.GymItem -> item.session.title.split(Regex("[·+]")).first().trim().ifEmpty { item.session.title }
        is TimelineItem.MealItem -> item.meal.role
    }

    fun meta(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> item.block.start
        is TimelineItem.MealItem -> item.meal.`when`
        else -> Time.formatSpan(Interval(item.start, item.end))
    }

    /** agendaTimes() y agendaLabel() de la agenda del día. */
    fun agendaWhen(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> "${item.block.start} – ${item.block.end}"
        is TimelineItem.MealItem -> item.meal.end?.let { "${item.meal.time} – $it" } ?: item.meal.time
        else -> "${Time.formatClock(item.start)} – ${Time.formatClock(item.end)}"
    }

    fun agendaStart(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> item.block.start
        is TimelineItem.MealItem -> item.meal.time
        else -> Time.formatClock(item.start)
    }

    fun agendaLabel(item: TimelineItem): String = when (item) {
        is TimelineItem.ClassItem -> item.block.name
        is TimelineItem.WorkItem -> "Trabajo"
        is TimelineItem.GymItem -> if (item.conflicts.isNotEmpty()) "${item.session.title} · ${item.conflicts.joinToString(" · ")}" else item.session.title
        is TimelineItem.MealItem -> item.meal.role
    }

    /** Validación del formulario Nuevo evento. Devuelve el error o null. */
    fun validateEvent(title: String, start: String, end: String): String? = when {
        title.isBlank() -> "Ponle un nombre al evento."
        end <= start -> "La hora de fin debe ser después del inicio."
        else -> null
    }
}
