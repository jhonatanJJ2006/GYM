package com.hierro.data

import kotlinx.serialization.Serializable

/** Datos exportados desde la web (scripts/export-android-data.ts). */
@Serializable
data class Photo(
    val file: String,
    val alt: String,
    val author: String,
    val license: String,
    val licenseUrl: String,
    val source: String,
) {
    /** Mismo texto que photoCredit() en la web. */
    val credit: String get() = "$author · $license"
    val assetPath: String get() = "photos/$file"
}

@Serializable
data class ClassBlock(
    val start: String,
    val end: String,
    val name: String,
    val type: String,
    val mode: String,
    val building: String = "",
    val room: String = "",
    val nrc: String = "",
    val professor: String = "",
    val key: String,
    val modeLabel: String,
    val place: String,
    val short: String,
    val color: String,
)

@Serializable
data class Exercise(
    val id: String,
    val name: String,
    val detail: String,
    val reps: String,
    val weight: String,
    val weightSuggested: Boolean,
    val pose: String,
    val how: String,
    val photo: Photo? = null,
    val blurb: String = "",
)

@Serializable
data class Session(
    val id: String,
    val color: String,
    val title: String,
    val short: String,
    val time: String,
    val minutesLabel: String,
    val note: String,
    val exercises: List<Exercise>,
)

@Serializable
data class Meal(
    val time: String,
    val end: String? = null,
    val role: String,
    val kcal: Int,
    val protein: Int,
    val ingredients: List<String>,
    val steps: List<String>,
    val `when`: String,
    val photo: Photo,
)

@Serializable
data class MealDay(val total: String, val items: List<Meal>)

@Serializable
data class Interval(val start: Int, val end: Int)

@Serializable
data class TimelineRef(
    val kind: String,
    val start: Int,
    val end: Int? = null,
    val classKey: String? = null,
    val mealIndex: Int? = null,
)

@Serializable
data class DayJson(
    val iso: String,
    val cycleWeek: Int,
    val inTerm: Boolean,
    val sessionId: String,
    val classes: List<ClassBlock>,
    val work: List<Interval>,
    val workMinutes: Int,
    val holiday: String? = null,
    val gymConflicts: List<String>,
    val banners: List<String>,
    val items: List<TimelineRef>,
)

@Serializable
data class NutritionProfile(
    val name: String,
    val weightKg: Int,
    val heightM: String,
    val heightCm: Int,
    val bmi: Int,
    val kcal: Int,
    val protein: Int,
    val proteinPerKg: String,
)

@Serializable
data class KcalPoint(val lead: String, val text: String)

@Serializable
data class ShoppingItem(val item: String, val amount: String)

@Serializable
data class Nutrition(
    val profile: NutritionProfile,
    val kcalIntro: String,
    val points: List<KcalPoint>,
    val disclaimer: String,
    val shoppingNote: String,
    val shopping: List<ShoppingItem>,
)

@Serializable
data class Courses(
    val colors: Map<String, String>,
    val short: Map<String, String>,
    val classes: Map<String, List<ClassBlock>>,
)

@Serializable
data class HierroJson(
    val courses: Courses,
    val holidays: Map<String, String>,
    val nutrition: Nutrition,
    val sessions: Map<String, Session>,
    val meals: Map<String, MealDay>,
    val poseClip: Map<String, String>,
    val days: List<DayJson>,
)

enum class Kind(val id: String, val label: String, val card: String, val title: String) {
    Clase("clase", "Clases", "Materia", "Clase"),
    Trabajo("trabajo", "Trabajo", "Laboral", "Trabajo"),
    Gym("gym", "Gym", "Entrenamiento", "Gym"),
    Comida("comida", "Comidas", "Comida", "Comida");

    companion object {
        fun of(id: String): Kind = entries.first { it.id == id }
    }
}

/** Bloque del día ya resuelto (equivale a TimelineItem de schedule.ts). */
sealed interface TimelineItem {
    val kind: Kind
    val start: Int
    val end: Int

    data class ClassItem(override val start: Int, val block: ClassBlock) : TimelineItem {
        override val kind = Kind.Clase
        override val end: Int get() = Time.classInterval(block.start, block.end).end
    }

    data class WorkItem(override val start: Int, override val end: Int) : TimelineItem {
        override val kind = Kind.Trabajo
    }

    data class GymItem(override val start: Int, override val end: Int, val session: Session, val conflicts: List<String>) : TimelineItem {
        override val kind = Kind.Gym
    }

    data class MealItem(override val start: Int, val meal: Meal, val index: Int) : TimelineItem {
        override val kind = Kind.Comida
        override val end: Int get() = meal.end?.let { Time.parseClock(it) } ?: (start + 25)
    }
}

data class DayPlan(
    val date: java.time.LocalDate,
    val iso: String,
    val cycleWeek: Int,
    val inTerm: Boolean,
    val session: Session,
    val classes: List<ClassBlock>,
    val work: List<Interval>,
    val workMinutes: Int,
    val meals: MealDay,
    val holiday: String?,
    val gymConflicts: List<String>,
    val banners: List<String>,
    val items: List<TimelineItem>,
)
