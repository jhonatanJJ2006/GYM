package com.hierro

import androidx.test.core.app.ApplicationProvider
import com.hierro.data.Codec
import com.hierro.data.CustomEvent
import com.hierro.data.DEFAULT_PROFILE
import com.hierro.data.DataStoreUserRepository
import com.hierro.data.InMemoryUserRepository
import com.hierro.data.Profile
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RepositoryTest {
    @Test fun leeElMismoJsonQueLaWeb() {
        // Valores tal como los guarda localStorage en la web.
        assertEquals(Profile("Ana", 1.6, 55.0, "Fuerza"), Codec.profile("""{"name":"Ana","heightM":1.6,"weightKg":55,"goal":"Fuerza"}"""))
        assertEquals(mapOf("2026-10-12" to listOf(0, 2)), Codec.meals("""{"2026-10-12":[0,2]}"""))
        assertEquals(mapOf("2026-10-12:press" to true), Codec.training("""{"2026-10-12:press":true}"""))
        assertEquals("Leer", Codec.events("""[{"id":"1","iso":"2026-10-12","start":"10:00","end":"11:00","title":"Leer","kind":"clase"}]""").single().title)
        assertEquals(listOf(true, false), Codec.shopping("[true,false]", 2))
    }

    @Test fun valoresInvalidosVuelvenAlInicio() {
        assertEquals(DEFAULT_PROFILE, Codec.profile("no-json"))
        assertTrue(Codec.meals(null).isEmpty())
        assertEquals(List(3) { false }, Codec.shopping("[true]", 3))
    }

    @Test fun marcarYDesmarcarComida() {
        val once = Codec.toggleMeal(emptyMap(), "d", 2)
        assertEquals(listOf(2), once["d"])
        val twice = Codec.toggleMeal(Codec.toggleMeal(once, "d", 0), "d", 2)
        assertEquals(listOf(0), twice["d"])
    }

    @Test fun memoria() = runTest {
        val repo = InMemoryUserRepository()
        repo.addEvent(CustomEvent("1", "2026-10-12", "10:00", "11:00", "A", "gym"))
        repo.setTraining("2026-10-12", "x", true)
        repo.toggleMeal("2026-10-12", 1)
        assertEquals(1, repo.events.value.size)
        assertTrue(repo.training.value["2026-10-12:x"] == true)
        repo.removeEvent("1")
        assertTrue(repo.events.value.isEmpty())
    }

    @Test fun dataStorePersiste() = runTest {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val repo = DataStoreUserRepository(context, 17)
        repo.setProfile(Profile("Jhona", 1.72, 70.0, "Mantener"))
        repo.toggleMeal("2026-10-12", 3)
        repo.addEvent(CustomEvent("e", "2026-10-12", "08:00", "09:00", "Reunión", "trabajo"))
        repo.setTraining("2026-10-12", "press", true)
        repo.setShopping(List(17) { it == 0 })
        repo.setReminders(true)
        val again = DataStoreUserRepository(context, 17)
        assertEquals("Jhona", again.profile.first().name)
        assertEquals(listOf(3), again.meals.first()["2026-10-12"])
        assertEquals("Reunión", again.events.first().single().title)
        assertTrue(again.training.first()["2026-10-12:press"] == true)
        assertTrue(again.shopping.first()[0])
        assertFalse(again.shopping.first()[1])
        assertTrue(again.reminders.first())
        again.removeEvent("e")
        assertTrue(again.events.first().isEmpty())
    }
}
