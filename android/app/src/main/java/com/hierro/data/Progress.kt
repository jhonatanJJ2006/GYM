package com.hierro.data

import java.time.LocalDate

typealias MealLog = Map<String, List<Int>>
typealias TrainingLog = Map<String, Boolean>

data class Intake(val kcal: Int, val protein: Int, val targetKcal: Int, val targetProtein: Int, val eaten: Int, val planned: Int)

data class WeekStats(
    val days: Int,
    val load: Int,
    val meals: Int,
    val compliance: Int,
    val sessionsDone: Int,
    val mealsEaten: Int,
    val mealsPlanned: Int,
)

/** Port de src/lib/progress.ts. */
object Progress {
    fun intakeFor(plan: PlanRepository, date: LocalDate, log: MealLog): Intake {
        val menu = plan.mealsFor(Dates.dow(date))
        val eaten = (log[Dates.toIso(date)] ?: emptyList()).toSet()
        var kcal = 0; var protein = 0; var tk = 0; var tp = 0
        menu.items.forEachIndexed { index, meal ->
            tk += meal.kcal; tp += meal.protein
            if (index in eaten) { kcal += meal.kcal; protein += meal.protein }
        }
        return Intake(kcal, protein, tk, tp, eaten.size, menu.items.size)
    }

    fun elapsedWeekDays(date: LocalDate, today: LocalDate): List<LocalDate> =
        Dates.weekOf(date).filter { Dates.isInRange(it) && !it.isAfter(today) }

    fun weekStats(plan: PlanRepository, date: LocalDate, today: LocalDate, meals: MealLog, training: TrainingLog): WeekStats {
        val days = elapsedWeekDays(date, today)
        var mp = 0; var me = 0; var ep = 0; var ed = 0; var sd = 0
        for (day in days) {
            val intake = intakeFor(plan, day, meals)
            mp += intake.planned; me += intake.eaten
            val session = plan.sessionFor(day)
            val iso = Dates.toIso(day)
            val done = session.exercises.count { training["$iso:${it.id}"] == true }
            ep += session.exercises.size; ed += done
            if (done == session.exercises.size && done > 0) sd += 1
        }
        fun pct(a: Int, b: Int) = if (b == 0) 0 else Math.round(a * 100.0 / b).toInt()
        return WeekStats(days.size, pct(ed, ep), pct(me, mp), pct(ed + me, ep + mp), sd, me, mp)
    }

    fun parseSets(reps: String): Int = Regex("(\\d+)\\s*series?", RegexOption.IGNORE_CASE).find(reps)?.groupValues?.get(1)?.toInt() ?: 3

    fun parseRest(reps: String): Int {
        val m = Regex("descanso\\s*(\\d+)\\s*(s|min)", RegexOption.IGNORE_CASE).find(reps) ?: return 60
        val n = m.groupValues[1].toInt()
        return if (m.groupValues[2].lowercase() == "min") n * 60 else n
    }
}
