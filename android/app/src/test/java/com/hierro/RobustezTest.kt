package com.hierro

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performTextReplacement
import androidx.compose.ui.test.hasSetTextAction
import com.hierro.data.Agenda
import com.hierro.data.Codec
import com.hierro.data.CustomEvent
import com.hierro.data.InMemoryUserRepository
import com.hierro.data.Kind
import com.hierro.data.Time
import com.hierro.navigation.Routes
import com.hierro.ui.HierroApp
import com.hierro.ui.theme.HierroTheme
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.time.LocalDate
import java.time.LocalDateTime

/** Casos que cerraban la app: horas mal escritas en eventos propios y datos guardados viejos. */
class HorasYEventosTest {
    @org.junit.Before fun setUp() = kotlinx.coroutines.Dispatchers.setMain(kotlinx.coroutines.test.UnconfinedTestDispatcher())
    @org.junit.After fun tearDown() = kotlinx.coroutines.Dispatchers.resetMain()

    @Test fun horaValida() {
        assertEquals(18 * 60 + 30, Time.parseClockOrNull("18:30"))
        assertEquals(9 * 60, Time.parseClockOrNull("9:00"))
        assertEquals(9 * 60 + 5, Time.parseClockOrNull(" 09 : 05 "))
    }

    @Test fun horaInvalida() {
        listOf("", "18", "7pm", "18:3", "24:00", "12:60", "ab:cd", "18:30:00", "-1:00").forEach {
            assertNull(it, Time.parseClockOrNull(it))
        }
    }

    @Test fun validarEvento() {
        assertNull(Agenda.validateEvent("Reunión", "18:00", "19:00"))
        assertNotNull(Agenda.validateEvent("Reunión", "7pm", "8pm"))
        assertNotNull(Agenda.validateEvent("Reunión", "19:00", "18:00"))
        assertNotNull(Agenda.validateEvent("Reunión", "18:00", "18:00"))
        assertNotNull(Agenda.validateEvent(" ", "18:00", "19:00"))
        // Antes se comparaba como texto y "9:00" < "10:00" daba error.
        assertNull(Agenda.validateEvent("Reunión", "9:00", "10:00"))
    }

    @Test fun eventosGuardadosIlegiblesSeDescartan() {
        val raw = """[
            {"id":"a","iso":"2026-10-12","start":"18:00","end":"19:00","title":"Ok","kind":"gym"},
            {"id":"b","iso":"2026-10-12","start":"7pm","end":"8pm","title":"Mal","kind":"gym"},
            {"id":"c","iso":"12/10/2026","start":"18:00","end":"19:00","title":"Mala fecha","kind":"gym"}
        ]"""
        assertEquals(listOf("a"), Codec.events(raw).map { it.id })
    }

    @Test fun categoriaDesconocida() {
        assertEquals(Kind.Gym, Kind.of("otra"))
        assertEquals(Kind.Comida, Kind.of("comida"))
    }

    @Test fun proximosIgnoraHorasMalas() {
        val events = listOf(CustomEvent("x", "2026-10-12", "nope", "19:00", "Mal", "gym"))
        Agenda.upcomingToday(Fixtures.plan, LocalDateTime.of(2026, 10, 12, 6, 0), events)
    }

    @Test fun viewModelRechazaHorasMalas() {
        val vm = Fixtures.vm()
        assertNotNull(vm.addEvent("Mal", "2026-10-12", "7pm", "8pm", "gym"))
        assertNull(vm.addEvent("Bien", "2026-10-12", "18:00", "19:00", "gym"))
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w400dp-h860dp-xhdpi")
class RobustezE2ETest {
    @get:Rule val compose = createComposeRule()

    @Test fun calendarioConEventoCorruptoNoSeCierra() {
        val user = InMemoryUserRepository(
            events = listOf(CustomEvent("x", "2026-10-12", "7pm", "8pm", "Viejo", "desconocido")),
            shoppingSize = Fixtures.plan.nutrition.shopping.size,
        )
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(user)) } }
        compose.waitForIdle()
        compose.onNodeWithTag("pantalla-calendario").assertExists()
        compose.onNodeWithTag("campana").performClick()
        compose.waitForIdle()
        compose.onNodeWithTag("pantalla-avisos").assertExists()
    }

    @Test fun nuevoEventoConHoraMalaMuestraError() {
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(), startRoute = Routes.evento("2026-10-12")) } }
        compose.waitForIdle()
        val fields = compose.onAllNodes(hasSetTextAction())
        fields[0].performTextReplacement("Reunión")
        fields[1].performTextReplacement("7pm")
        compose.onNodeWithText("Guardar evento").performScrollTo().performClick()
        compose.waitForIdle()
        compose.onNodeWithText("Escribe las horas como HH:MM, por ejemplo 18:30.").assertExists()
        compose.onNodeWithTag("pantalla-evento").assertExists()
    }

    @Test fun entrenoGuiadoCompletoHastaElFinal() {
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(), startRoute = Routes.guiado("2026-10-10")) } }
        compose.waitForIdle()
        val session = Fixtures.plan.sessionFor(LocalDate.of(2026, 10, 10))
        repeat(session.exercises.size + 2) {
            compose.onNodeWithText("Siguiente").performScrollTo().performClick()
            compose.waitForIdle()
        }
        repeat(3) {
            compose.onNodeWithText("Anterior").performScrollTo().performClick()
            compose.waitForIdle()
        }
        compose.onNodeWithTag("pantalla-guiado").assertExists()
        assertTrue(compose.onAllNodesWithText("Ejercicio", substring = true).fetchSemanticsNodes().isNotEmpty())
    }
}
