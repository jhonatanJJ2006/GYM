package com.hierro

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import com.hierro.data.Dates
import com.hierro.navigation.Routes
import com.hierro.ui.HierroApp
import com.hierro.ui.theme.HierroTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.ParameterizedRobolectricTestRunner
import org.robolectric.annotation.Config
import java.time.LocalDate

/**
 * Recorre la app con "hoy" en fechas que antes no se probaban: fin de semana, feriado,
 * extremos del rango y fechas fuera del semestre. Ninguna pantalla debe cerrarse.
 */
@RunWith(ParameterizedRobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w400dp-h860dp-xhdpi")
class FechasE2ETest(private val hoy: String) {
    @get:Rule val compose = createComposeRule()

    private fun abrir(route: String, tag: String) {
        val day = LocalDate.parse(hoy)
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(day = day), startRoute = route) } }
        compose.waitForIdle()
        compose.onNodeWithTag(tag).assertExists()
    }

    @Test fun pestanas() {
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(day = LocalDate.parse(hoy))) } }
        compose.waitForIdle()
        Routes.tabs.forEach { tab ->
            compose.onNodeWithTag("tab-${tab.route}").performClick()
            compose.waitForIdle()
            compose.onNodeWithTag("pantalla-${tab.route}").assertExists()
        }
    }

    @Test fun detallesDelDia() {
        val iso = hoy
        val dow = Dates.dow(LocalDate.parse(hoy))
        abrir(Routes.dia(iso), if (Dates.isInRange(LocalDate.parse(hoy))) "detalle-dia" else "detalle-vacio")
    }

    @Test fun gymGuiadoYEvento() {
        abrir(Routes.gym(hoy), "detalle-sesion")
    }

    @Test fun guiado() { abrir(Routes.guiado(hoy), "pantalla-guiado") }

    @Test fun evento() { abrir(Routes.evento(hoy), "pantalla-evento") }

    @Test fun comidasDelDia() { abrir(Routes.comida(Dates.dow(LocalDate.parse(hoy)), 0), "detalle-comida") }

    @Test fun avisosYPerfil() {
        abrir(Routes.AVISOS, "pantalla-avisos")
    }

    companion object {
        @JvmStatic
        @ParameterizedRobolectricTestRunner.Parameters(name = "{0}")
        fun fechas(): List<Array<Any>> = listOf(
            "2026-10-10", "2026-10-11", "2026-10-09", "2026-11-02", "2026-10-01", "2027-02-28",
            "2027-02-03", "2026-09-15", "2027-03-10", "2026-12-31",
        ).map { arrayOf(it) }
    }
}
