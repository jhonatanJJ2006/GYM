package com.hierro

import com.hierro.data.Dates
import com.hierro.data.Kind
import com.hierro.data.TimelineItem
import com.hierro.data.Time
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class PlanRepositoryTest {
    private val plan = Fixtures.plan

    @Test fun rangoCompleto() {
        var d = Dates.RANGE_START
        var count = 0
        while (!d.isAfter(Dates.RANGE_END)) { assertTrue(plan.day(d) != null); d = d.plusDays(1); count++ }
        assertEquals(151, count)
        assertNull(plan.day(LocalDate.of(2026, 9, 30)))
        assertNull(plan.day(LocalDate.of(2027, 3, 1)))
    }

    @Test fun sesionesPorDia() {
        assertEquals("push", plan.sessionFor(LocalDate.of(2026, 10, 5)).id)
        assertEquals("legs", plan.sessionFor(LocalDate.of(2026, 10, 6)).id)
        assertEquals("pull", plan.sessionFor(LocalDate.of(2026, 10, 7)).id)
        assertEquals("tri", plan.sessionFor(LocalDate.of(2026, 10, 8)).id)
        assertEquals("bi", plan.sessionFor(LocalDate.of(2026, 10, 15)).id)
        assertEquals("tri", plan.sessionFor(LocalDate.of(2026, 10, 22)).id)
        assertEquals("legsB", plan.sessionFor(LocalDate.of(2026, 10, 9)).id)
        assertEquals("absA", plan.sessionFor(LocalDate.of(2026, 10, 10)).id)
        assertEquals("absB", plan.sessionFor(LocalDate.of(2026, 10, 11)).id)
    }

    @Test fun sesionDelDiaCoincideConLaWeb() {
        var d = Dates.RANGE_START
        while (!d.isAfter(Dates.RANGE_END)) {
            assertEquals(Dates.toIso(d), plan.day(d)!!.session.id, plan.sessionFor(d).id)
            assertEquals(Dates.cycleWeek(d), plan.day(d)!!.cycleWeek)
            assertEquals(Dates.isInTerm(d), plan.day(d)!!.inTerm)
            d = d.plusDays(1)
        }
    }

    @Test fun bloquesOrdenadosYCompletos() {
        val day = plan.day(LocalDate.of(2026, 10, 6))!!
        assertTrue(day.items.zipWithNext().all { (a, b) -> a.start <= b.start })
        assertEquals(1, day.items.count { it.kind == Kind.Gym })
        assertEquals(day.classes.size, day.items.count { it is TimelineItem.ClassItem })
        assertEquals(day.meals.items.size, day.items.count { it is TimelineItem.MealItem })
        assertEquals(day.workMinutes, day.work.sumOf { it.end - it.start })
        assertTrue(day.workMinutes in 300..360)
    }

    @Test fun finDeSemanaSinClasesNiTrabajo() {
        val sat = plan.day(LocalDate.of(2026, 10, 10))!!
        assertTrue(sat.classes.isEmpty())
        assertTrue(sat.work.isEmpty())
        assertTrue(plan.classesFor(LocalDate.of(2026, 10, 11)).isEmpty())
    }

    @Test fun feriadosYAvisos() {
        assertEquals("Feriado: Navidad", plan.holiday(LocalDate.of(2026, 12, 25)))
        val day = plan.day(LocalDate.of(2026, 10, 9))!!
        assertTrue(day.holiday!!.contains("Guayaquil"))
        assertTrue(day.banners.any { it.contains("Guayaquil") })
    }

    @Test fun clasesConColorYClave() {
        val classes = plan.classesFor(LocalDate.of(2026, 10, 5))
        assertTrue(classes.isNotEmpty())
        classes.forEach { assertTrue(it.color.startsWith("#")); assertTrue(it.key.contains(it.name)) }
        assertEquals(8, plan.courses.short.size)
    }

    @Test fun comidasConFotoLocal() {
        (0..6).forEach { dow ->
            val day = plan.mealsFor(dow)
            assertTrue(day.items.isNotEmpty())
            day.items.forEach { assertTrue(it.photo.assetPath, java.io.File("src/main/assets/${it.photo.assetPath}").exists()) }
        }
    }

    @Test fun formatoDeHoras() {
        assertEquals("07:05", Time.formatClock(425))
        assertEquals("1 h 30 min", Time.formatDuration(90))
        assertEquals("2 h", Time.formatDuration(120))
        assertEquals(Time.parseClock("19:15"), Time.spanInterval("18:00–19:15").end)
        assertEquals(720, Time.classInterval("10:00", "11:59").end)
    }
}
