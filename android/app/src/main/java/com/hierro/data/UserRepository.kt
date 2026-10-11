package com.hierro.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

/** Mismas claves que localStorage en la web (src/lib/store.ts y MealsPage). */
object Keys {
    const val PROFILE = "hierro.perfil"
    const val MEALS = "hierro.comidas.hechas"
    const val EVENTS = "hierro.eventos"
    const val TRAINING = "hierro.entreno.checks"
    const val SHOPPING = "hierro-compra"
    const val REMINDERS = "hierro.avisos"
}

@Serializable
data class Profile(val name: String, val heightM: Double, val weightKg: Double, val goal: String) {
    val bmi: Double get() = weightKg / (heightM * heightM)
    val initials: String get() = name.split(Regex("\\s+")).filter { it.isNotBlank() }.take(2).joinToString("") { it.first().uppercase() }
}

val DEFAULT_PROFILE = Profile("Jhonatan", 1.72, 68.0, "Ganar masa")
val GOALS = listOf("Ganar masa", "Mantener", "Perder grasa", "Fuerza")

@Serializable
data class CustomEvent(val id: String, val iso: String, val start: String, val end: String, val title: String, val kind: String)

/** Datos del usuario. La implementación real usa DataStore con JSON igual al de la web. */
interface UserRepository {
    val profile: Flow<Profile>
    val meals: Flow<MealLog>
    val events: Flow<List<CustomEvent>>
    val training: Flow<TrainingLog>
    val shopping: Flow<List<Boolean>>
    val reminders: Flow<Boolean>

    suspend fun setProfile(profile: Profile)
    suspend fun toggleMeal(iso: String, index: Int)
    suspend fun addEvent(event: CustomEvent)
    suspend fun removeEvent(id: String)
    suspend fun setTraining(iso: String, exerciseId: String, done: Boolean)
    suspend fun setShopping(checks: List<Boolean>)
    suspend fun setReminders(on: Boolean)
}

object Codec {
    val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }
    private val mealSer = MapSerializer(String.serializer(), ListSerializer(Int.serializer()))
    private val trainSer = MapSerializer(String.serializer(), Boolean.serializer())
    private val eventsSer = ListSerializer(CustomEvent.serializer())
    private val boolList = ListSerializer(Boolean.serializer())

    fun profile(raw: String?): Profile = raw?.let { runCatching { json.decodeFromString(Profile.serializer(), it) }.getOrNull() } ?: DEFAULT_PROFILE
    fun meals(raw: String?): MealLog = raw?.let { runCatching { json.decodeFromString(mealSer, it) }.getOrNull() } ?: emptyMap()
    fun training(raw: String?): TrainingLog = raw?.let { runCatching { json.decodeFromString(trainSer, it) }.getOrNull() } ?: emptyMap()
    /** Descarta eventos con horas o fecha ilegibles: antes uno así cerraba la app al abrir el calendario. */
    fun events(raw: String?): List<CustomEvent> = (raw?.let { runCatching { json.decodeFromString(eventsSer, it) }.getOrNull() } ?: emptyList())
        .filter { e -> Time.parseClockOrNull(e.start) != null && Time.parseClockOrNull(e.end) != null && runCatching { Dates.parseIso(e.iso) }.isSuccess }

    /** Como readChecks() de la web: si el largo no coincide, todo en falso. */
    fun shopping(raw: String?, size: Int): List<Boolean> {
        val parsed = raw?.let { runCatching { json.decodeFromString(boolList, it) }.getOrNull() }
        return if (parsed == null || parsed.size != size) List(size) { false } else parsed
    }

    fun encode(profile: Profile) = json.encodeToString(Profile.serializer(), profile)
    fun encodeMeals(log: MealLog) = json.encodeToString(mealSer, log)
    fun encodeTraining(log: TrainingLog) = json.encodeToString(trainSer, log)
    fun encodeEvents(list: List<CustomEvent>) = json.encodeToString(eventsSer, list)
    fun encodeShopping(list: List<Boolean>) = json.encodeToString(boolList, list)

    fun toggleMeal(log: MealLog, iso: String, index: Int): MealLog {
        val set = (log[iso] ?: emptyList()).toMutableSet()
        if (!set.add(index)) set.remove(index)
        return log + (iso to set.sorted())
    }
}

private val Context.store: DataStore<Preferences> by preferencesDataStore(name = "hierro")

class DataStoreUserRepository(context: Context, private val shoppingSize: Int) : UserRepository {
    private val ds = context.applicationContext.store
    private fun key(name: String) = stringPreferencesKey(name)
    private fun read(name: String): Flow<String?> = ds.data.map { it[key(name)] }
    private suspend fun write(name: String, value: String) { ds.edit { it[key(name)] = value } }
    private suspend fun change(name: String, block: (String?) -> String) { ds.edit { it[key(name)] = block(it[key(name)]) } }

    override val profile = read(Keys.PROFILE).map(Codec::profile)
    override val meals = read(Keys.MEALS).map(Codec::meals)
    override val events = read(Keys.EVENTS).map(Codec::events)
    override val training = read(Keys.TRAINING).map(Codec::training)
    override val shopping = read(Keys.SHOPPING).map { Codec.shopping(it, shoppingSize) }
    override val reminders = read(Keys.REMINDERS).map { it == "true" }

    override suspend fun setProfile(profile: Profile) = write(Keys.PROFILE, Codec.encode(profile))
    override suspend fun toggleMeal(iso: String, index: Int) = change(Keys.MEALS) { Codec.encodeMeals(Codec.toggleMeal(Codec.meals(it), iso, index)) }
    override suspend fun addEvent(event: CustomEvent) = change(Keys.EVENTS) { Codec.encodeEvents(Codec.events(it) + event) }
    override suspend fun removeEvent(id: String) = change(Keys.EVENTS) { Codec.encodeEvents(Codec.events(it).filterNot { e -> e.id == id }) }
    override suspend fun setTraining(iso: String, exerciseId: String, done: Boolean) =
        change(Keys.TRAINING) { Codec.encodeTraining(Codec.training(it) + ("$iso:$exerciseId" to done)) }
    override suspend fun setShopping(checks: List<Boolean>) = write(Keys.SHOPPING, Codec.encodeShopping(checks))
    override suspend fun setReminders(on: Boolean) = write(Keys.REMINDERS, on.toString())
}

/** Implementación en memoria para pruebas y capturas. */
class InMemoryUserRepository(
    profile: Profile = DEFAULT_PROFILE,
    meals: MealLog = emptyMap(),
    events: List<CustomEvent> = emptyList(),
    training: TrainingLog = emptyMap(),
    private val shoppingSize: Int = 17,
) : UserRepository {
    override val profile = MutableStateFlow(profile)
    override val meals = MutableStateFlow(meals)
    override val events = MutableStateFlow(events)
    override val training = MutableStateFlow(training)
    override val shopping = MutableStateFlow(List(shoppingSize) { false })
    override val reminders = MutableStateFlow(false)

    override suspend fun setProfile(profile: Profile) { this.profile.value = profile }
    override suspend fun toggleMeal(iso: String, index: Int) = meals.update { Codec.toggleMeal(it, iso, index) }
    override suspend fun addEvent(event: CustomEvent) = events.update { it + event }
    override suspend fun removeEvent(id: String) = events.update { list -> list.filterNot { it.id == id } }
    override suspend fun setTraining(iso: String, exerciseId: String, done: Boolean) = training.update { it + ("$iso:$exerciseId" to done) }
    override suspend fun setShopping(checks: List<Boolean>) { shopping.value = checks }
    override suspend fun setReminders(on: Boolean) { reminders.value = on }
}
