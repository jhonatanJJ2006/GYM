package com.hierro.data

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.time.temporal.IsoFields

/** Port de src/lib/dates.ts. Domingo = 0, como Date.getDay(). */
object Dates {
    val MONTHS = listOf("enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre")
    val DOW_LONG = listOf("domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado")
    val WEEK_LETTERS = listOf("L", "M", "X", "J", "V", "S", "D")

    val TERM_START: LocalDate = LocalDate.of(2026, 10, 5)
    val TERM_END: LocalDate = LocalDate.of(2027, 2, 2)
    val RANGE_START: LocalDate = LocalDate.of(2026, 10, 1)
    val RANGE_END: LocalDate = LocalDate.of(2027, 2, 28)
    val ANCHOR_MON: LocalDate = LocalDate.of(2026, 10, 5)

    fun dow(date: LocalDate): Int = date.dayOfWeek.value % 7

    fun toIso(date: LocalDate): String = date.toString()

    fun parseIso(iso: String): LocalDate = LocalDate.parse(iso)

    fun isInTerm(date: LocalDate) = !date.isBefore(TERM_START) && !date.isAfter(TERM_END)

    fun isInRange(date: LocalDate) = !date.isBefore(RANGE_START) && !date.isAfter(RANGE_END)

    fun clampToRange(date: LocalDate): LocalDate = when {
        date.isBefore(RANGE_START) -> RANGE_START
        date.isAfter(RANGE_END) -> RANGE_END
        else -> date
    }

    fun cycleWeek(date: LocalDate): Int {
        val diff = ChronoUnit.DAYS.between(ANCHOR_MON, date)
        val weekIndex = Math.floorDiv(diff, 7L)
        return (((weekIndex % 4) + 4) % 4).toInt() + 1
    }

    fun capitalize(text: String) = text.replaceFirstChar { it.uppercase() }

    fun formatLong(date: LocalDate) = "${DOW_LONG[dow(date)]} ${date.dayOfMonth} de ${MONTHS[date.monthValue - 1]} de ${date.year}"

    fun monthShort(date: LocalDate) = MONTHS[date.monthValue - 1].take(3)

    fun formatWeekSpan(days: List<LocalDate>): String {
        val first = days.firstOrNull() ?: return ""
        val last = days.last()
        if (first.month == last.month) return "${first.dayOfMonth}–${last.dayOfMonth} ${monthShort(first)}"
        return "${first.dayOfMonth} ${monthShort(first)} – ${last.dayOfMonth} ${monthShort(last)}"
    }

    fun mondayOnOrBefore(date: LocalDate): LocalDate = date.with(DayOfWeek.MONDAY).let { if (it.isAfter(date)) it.minusWeeks(1) else it }

    fun weekOf(date: LocalDate): List<LocalDate> = (0L until 7L).map { mondayOnOrBefore(date).plusDays(it) }

    /** Celdas de un mes empezando en lunes; null para huecos. */
    fun monthCells(year: Int, month: Int): List<LocalDate?> {
        val first = LocalDate.of(year, month, 1)
        val lead = (first.dayOfWeek.value + 6) % 7
        val cells = MutableList<LocalDate?>(lead) { null }
        for (d in 1..first.lengthOfMonth()) cells += LocalDate.of(year, month, d)
        while (cells.size % 7 != 0) cells += null
        return cells
    }

    fun canGoPrevMonth(year: Int, month: Int) = !(year == 2026 && month == 10)

    fun canGoNextMonth(year: Int, month: Int) = !(year == 2027 && month == 2)

    fun weeksCoveringRange(): List<List<LocalDate>> {
        var monday = mondayOnOrBefore(RANGE_START)
        val weeks = mutableListOf<List<LocalDate>>()
        while (!monday.isAfter(RANGE_END)) {
            weeks += (0L until 7L).map { monday.plusDays(it) }
            monday = monday.plusDays(7)
        }
        return weeks
    }

    fun initialDate(today: LocalDate): LocalDate = if (isInRange(today)) today else TERM_START

    /** Semana ISO 8601. */
    fun isoWeek(date: LocalDate): Int = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
}
