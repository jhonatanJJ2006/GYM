package com.hierro.data

import android.content.Context
import kotlinx.serialization.json.Json
import java.time.LocalDate

/** Plan fijo (clases, entreno, comidas): mismo contenido que src/data de la web. */
interface PlanRepository {
    val nutrition: Nutrition
    val holidays: Map<String, String>
    val courses: Courses
    val sessions: Map<String, Session>
    val poseClip: Map<String, String>

    fun session(id: String): Session
    fun sessionFor(date: LocalDate): Session
    fun mealsFor(dow: Int): MealDay
    fun classesFor(date: LocalDate): List<ClassBlock>
    /** Día completo; null fuera del rango 1 oct 2026 – 28 feb 2027. */
    fun day(date: LocalDate): DayPlan?
    fun holiday(date: LocalDate): String? = holidays[Dates.toIso(date)]
}

class JsonPlanRepository(raw: String) : PlanRepository {
    private val data: HierroJson = json.decodeFromString(raw)
    private val days = data.days.associateBy { it.iso }

    override val nutrition get() = data.nutrition
    override val holidays get() = data.holidays
    override val courses get() = data.courses
    override val sessions get() = data.sessions
    override val poseClip get() = data.poseClip

    override fun session(id: String): Session = data.sessions.getValue(id)

    /** Port de sessionFor(): jueves alterna hombro + tríceps / bíceps según la semana del ciclo. */
    override fun sessionFor(date: LocalDate): Session {
        val week = Dates.cycleWeek(date)
        return session(
            when (Dates.dow(date)) {
                1 -> "push"
                2 -> "legs"
                3 -> "pull"
                4 -> if (week == 1 || week == 3) "tri" else "bi"
                5 -> "legsB"
                6 -> "absA"
                else -> "absB"
            },
        )
    }

    override fun mealsFor(dow: Int): MealDay = data.meals.getValue(dow.toString())

    override fun classesFor(date: LocalDate): List<ClassBlock> {
        days[Dates.toIso(date)]?.let { return it.classes }
        val dow = Dates.dow(date)
        if (!Dates.isInTerm(date) || dow == 0 || dow == 6) return emptyList()
        return data.courses.classes[dow.toString()] ?: emptyList()
    }

    private val cache = HashMap<String, DayPlan>()

    override fun day(date: LocalDate): DayPlan? {
        val iso = Dates.toIso(date)
        cache[iso]?.let { return it }
        val raw = days[iso] ?: return null
        val session = session(raw.sessionId)
        val meals = mealsFor(Dates.dow(date))
        val gym = Time.spanInterval(session.time)
        val items = raw.items.map { ref ->
            when (ref.kind) {
                "clase" -> TimelineItem.ClassItem(ref.start, raw.classes.first { it.key == ref.classKey })
                "trabajo" -> TimelineItem.WorkItem(ref.start, ref.end ?: ref.start)
                "gym" -> TimelineItem.GymItem(gym.start, gym.end, session, raw.gymConflicts)
                else -> TimelineItem.MealItem(ref.start, meals.items[ref.mealIndex ?: 0], ref.mealIndex ?: 0)
            }
        }
        return DayPlan(
            date, iso, raw.cycleWeek, raw.inTerm, session, raw.classes, raw.work, raw.workMinutes, meals,
            raw.holiday, raw.gymConflicts, raw.banners, items,
        ).also { cache[iso] = it }
    }

    companion object {
        val json = Json { ignoreUnknownKeys = true }
        const val ASSET = "data/hierro.json"

        @Volatile private var instance: JsonPlanRepository? = null

        fun get(context: Context): JsonPlanRepository = instance ?: synchronized(this) {
            instance ?: JsonPlanRepository(context.assets.open(ASSET).bufferedReader().use { it.readText() }).also { instance = it }
        }
    }
}

fun shoulderFocus(week: Int) = if (week == 1 || week == 3) "tríceps" else "bíceps"

/** Grupos de cada sesión (TrainingPage.tsx). */
data class Group(val label: String, val from: Int, val to: Int)

val GROUPS: Map<String, List<Group>> = mapOf(
    "push" to listOf(Group("Pecho", 0, 5), Group("Tríceps", 5, 10)),
    "legs" to listOf(Group("Cuádriceps", 0, 5), Group("Gemelos", 5, 10)),
    "pull" to listOf(Group("Espalda", 0, 5), Group("Bíceps", 5, 10)),
    "tri" to listOf(Group("Hombro", 0, 5), Group("Tríceps", 5, 10)),
    "bi" to listOf(Group("Hombro", 0, 5), Group("Bíceps", 5, 10)),
    "legsB" to listOf(Group("Isquiotibiales", 0, 4), Group("Gemelos", 4, 7), Group("Glúteo", 7, 10)),
    "absA" to listOf(Group("Abdomen", 0, 5)),
    "absB" to listOf(Group("Oblicuos", 0, 5)),
)
