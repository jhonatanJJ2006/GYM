package com.hierro.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hierro.data.CustomEvent
import com.hierro.data.DEFAULT_PROFILE
import com.hierro.data.Dates
import com.hierro.data.MealLog
import com.hierro.data.PlanRepository
import com.hierro.data.Profile
import com.hierro.data.Progress
import com.hierro.data.TrainingLog
import com.hierro.data.UserRepository
import com.hierro.data.WeekStats
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate

/** Estado del usuario compartido entre pantallas (equivale a useStored en la web). */
class AppViewModel(
    val plan: PlanRepository,
    private val user: UserRepository,
    private val today: () -> LocalDate = { LocalDate.now() },
) : ViewModel() {
    private fun <T> share(flow: kotlinx.coroutines.flow.Flow<T>, initial: T): StateFlow<T> =
        flow.stateIn(viewModelScope, SharingStarted.Eagerly, initial)

    val profile: StateFlow<Profile> = share(user.profile, DEFAULT_PROFILE)
    val meals: StateFlow<MealLog> = share(user.meals, emptyMap())
    val events: StateFlow<List<CustomEvent>> = share(user.events, emptyList())
    val training: StateFlow<TrainingLog> = share(user.training, emptyMap())
    val shopping: StateFlow<List<Boolean>> = share(user.shopping, List(plan.nutrition.shopping.size) { false })
    val reminders: StateFlow<Boolean> = share(user.reminders, false)

    val weekStats: StateFlow<WeekStats> = share(
        combine(user.meals, user.training) { m, t -> Progress.weekStats(plan, today(), today(), m, t) },
        Progress.weekStats(plan, today(), today(), emptyMap(), emptyMap()),
    )

    fun today(): LocalDate = today.invoke()

    fun isDone(iso: String, exerciseId: String) = training.value["$iso:$exerciseId"] == true

    fun saveProfile(profile: Profile): Boolean {
        if (profile.name.isBlank() || profile.heightM <= 0 || profile.weightKg <= 0) return false
        viewModelScope.launch { user.setProfile(profile.copy(name = profile.name.trim())) }
        return true
    }

    fun toggleMeal(iso: String, index: Int) { viewModelScope.launch { user.toggleMeal(iso, index) } }

    fun setDone(iso: String, exerciseId: String, done: Boolean) { viewModelScope.launch { user.setTraining(iso, exerciseId, done) } }

    fun toggleShopping(index: Int) {
        val next = shopping.value.mapIndexed { i, v -> if (i == index) !v else v }
        viewModelScope.launch { user.setShopping(next) }
    }

    fun clearShopping() { viewModelScope.launch { user.setShopping(List(plan.nutrition.shopping.size) { false }) } }

    fun addEvent(title: String, iso: String, start: String, end: String, kind: String): String? {
        com.hierro.data.Agenda.validateEvent(title, start, end)?.let { return it }
        val date = runCatching { Dates.parseIso(iso) }.getOrNull() ?: return "Fecha inválida."
        if (!Dates.isInRange(date)) return "La fecha debe estar entre el 1 de octubre y el 28 de febrero."
        val id = "${System.currentTimeMillis()}-${(10000..99999).random()}"
        viewModelScope.launch { user.addEvent(CustomEvent(id, iso, start, end, title.trim(), kind)) }
        return null
    }

    fun removeEvent(id: String) { viewModelScope.launch { user.removeEvent(id) } }

    fun setReminders(on: Boolean) { viewModelScope.launch { user.setReminders(on) } }
}
