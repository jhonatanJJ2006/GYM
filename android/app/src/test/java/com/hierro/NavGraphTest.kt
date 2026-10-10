package com.hierro

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import com.hierro.navigation.Routes
import com.hierro.ui.HierroApp
import com.hierro.ui.theme.HierroTheme
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.ParameterizedRobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(ParameterizedRobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w400dp-h860dp-xhdpi")
class NavGraphTest(private val pattern: String) {
    @get:Rule val compose = createComposeRule()

    @Test fun abreLaRuta() {
        val (_, route, tag) = Screens.samples.first { it.first == pattern }
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(), startRoute = route) } }
        compose.waitForIdle()
        compose.onNodeWithTag(tag).assertExists()
    }

    companion object {
        @JvmStatic
        @ParameterizedRobolectricTestRunner.Parameters(name = "{0}")
        fun rutas(): List<Array<Any>> = Routes.all.map { arrayOf(it) }
    }
}

@RunWith(org.robolectric.RobolectricTestRunner::class)
@Config(sdk = [34], qualifiers = "w400dp-h860dp-xhdpi")
class TabsTest {
    @get:Rule val compose = createComposeRule()

    @Test fun cadaRutaTieneSuCaso() {
        assertEquals(Routes.all.toSet(), Screens.samples.map { it.first }.toSet())
        assertEquals(16, Routes.all.size)
    }

    @Test fun barraInferiorCambiaDePestana() {
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm()) } }
        Routes.tabs.reversed().forEach { tab ->
            compose.onNodeWithTag("tab-${tab.route}").performClick()
            compose.waitForIdle()
            compose.onNodeWithTag("pantalla-${tab.route}").assertExists()
        }
        compose.onNodeWithTag("campana").performClick()
        compose.waitForIdle()
        compose.onNodeWithTag("pantalla-avisos").assertExists()
    }
}
