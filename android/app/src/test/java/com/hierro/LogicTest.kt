package com.hierro

import com.hierro.data.Agenda
import com.hierro.data.CustomEvent
import com.hierro.data.Dates
import com.hierro.data.Kind
import com.hierro.data.Progress
import com.hierro.ui.GuidedState
import com.hierro.ui.Horizon
import com.hierro.ui.SpanView
import com.hierro.ui.components.placeLanes
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime

class LogicTest {
    private val plan = Fixtures.plan

    @Test fun fechas() {
        assertEquals(1, Dates.cycleWeek(LocalDate.of(2026, 10, 5)))
        assertEquals(2, Dates.cycleWeek(LocalDate.of(2026, 10, 12)))
        assertEquals(4, Dates.cycleWeek(LocalDate.of(2026, 10, 4)))
        assertEquals(41, Dates.isoWeek(LocalDate.of(2026, 10, 5)))
        assertEquals("lunes 5 de octubre de 2026", Dates.formatLong(LocalDate.of(2026, 10, 5)))
        assertEquals("5–11 oct", Dates.formatWeekSpan(Dates.weekOf(LocalDate.of(2026, 10, 7))))
        assertEquals(LocalDate.of(2026, 10, 5), Dates.mondayOnOrBefore(LocalDate.of(2026, 10, 11)))
        assertEquals(0, Dates.monthCells(2026, 10).size % 7)
        assertEquals(Dates.TERM_START, Dates.initialDate(LocalDate.of(2026, 6, 1)))
    }

    @Test fun seriesYDescanso() {
        assertEquals(4, Progress.parseSets("4 series · 8–10 repeticiones · descanso 90 s"))
        assertEquals(90, Progress.parseRest("4 series · 8–10 repeticiones · descanso 90 s"))
        assertEquals(120, Progress.parseRest("3 series · descanso 2 min"))
        assertEquals(3, Progress.parseSets("sin dato"))
        assertEquals(60, Progress.parseRest("sin dato"))
    }

    @Test fun consumoYAvance() {
        val day = LocalDate.of(2026, 10, 12)
        val intake = Progress.intakeFor(plan, day, mapOf("2026-10-12" to listOf(0, 1)))
        val meals = plan.mealsFor(1).items
        assertEquals(meals[0].kcal + meals[1].kcal, intake.kcal)
        assertEquals(meals.sumOf { it.kcal }, intake.targetKcal)
        assertEquals(2, intake.eaten)
        val session = plan.sessionFor(day)
        val training = session.exercises.associate { "2026-10-12:${it.id}" to true }
        val stats = Progress.weekStats(plan, day, day, emptyMap(), training)
        assertEquals(1, stats.days)
        assertEquals(100, stats.load)
        assertEquals(1, stats.sessionsDone)
        assertEquals(0, stats.meals)
    }

    @Test fun loQueQuedaHoy() {
        val events = listOf(CustomEvent("a", "2026-10-12", "23:00", "23:30", "Leer", "clase"))
        val list = Agenda.upcomingToday(plan, LocalDateTime.of(2026, 10, 12, 12, 0), events)
        assertTrue(list.all { it.start >= 720 })
        assertTrue(list.zipWithNext().all { (a, b) -> a.start <= b.start })
        assertEquals("Leer", list.last().label)
        assertEquals(Kind.Clase, list.last().kind)
        assertTrue(Agenda.upcomingToday(plan, LocalDateTime.of(2026, 3, 12, 12, 0), emptyList()).isEmpty())
    }

    @Test fun validacionDeEvento() {
        assertEquals("Ponle un nombre al evento.", Agenda.validateEvent(" ", "10:00", "11:00"))
        assertEquals("La hora de fin debe ser después del inicio.", Agenda.validateEvent("x", "10:00", "09:00"))
        assertNull(Agenda.validateEvent("x", "10:00", "11:00"))
    }

    @Test fun horizonteConLimites() {
        val start = Horizon(Dates.RANGE_START)
        assertTrue(start.atStart)
        assertEquals(Dates.RANGE_START, start.step(-1).date)
        val end = Horizon(Dates.RANGE_END, SpanView.Mes)
        assertTrue(end.atEnd)
        assertEquals(LocalDate.of(2026, 11, 30), Horizon(LocalDate.of(2026, 10, 31), SpanView.Mes).step(1).date)
        assertEquals(LocalDate.of(2026, 10, 19), Horizon(LocalDate.of(2026, 10, 12), SpanView.Semana).step(1).date)
        assertEquals("Lunes 12 de octubre de 2026", Horizon(LocalDate.of(2026, 10, 12)).title)
        assertEquals("octubre 2026", Horizon(LocalDate.of(2026, 10, 12), SpanView.Mes).title)
        assertFalse(Horizon(LocalDate.of(2026, 11, 12), SpanView.Semana).atStart)
    }

    @Test fun entrenoGuiado() {
        val session = plan.session("push")
        var state = GuidedState.start(session) { it == session.exercises[0].id }
        assertEquals(1, state.index)
        val total = state.total(session)
        repeat(total - 1) {
            val (next, done) = state.completeSet(session)
            assertNull(done)
            assertEquals(Progress.parseRest(session.exercises[1].reps), next.rest)
            state = next.skipRest()
        }
        val (after, done) = state.completeSet(session)
        assertEquals(session.exercises[1].id, done)
        assertEquals(2, after.index)
        assertEquals(1, after.set)
        assertEquals(GuidedState(0, 1, 4), GuidedState(0, 1, 5).tick())
        assertEquals("1:30", GuidedState.formatRest(90))
        assertEquals("Listo", GuidedState.formatRest(0))
        assertEquals(session.exercises.lastIndex, state.go(session, 99).index)
    }

    @Test fun carrilesDeLaGrilla() {
        val day = plan.day(LocalDate.of(2026, 10, 12))!!
        val (placed, lanes) = placeLanes(day.items)
        assertEquals(day.items.size, placed.size)
        assertTrue(lanes >= 1)
    }
}
