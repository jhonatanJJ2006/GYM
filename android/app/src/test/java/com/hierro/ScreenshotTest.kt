package com.hierro

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import com.hierro.ui.HierroApp
import com.hierro.ui.theme.HierroTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.ParameterizedRobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Captura cada pantalla con Roborazzi en teléfono y las cinco pestañas en tableta.
 * Graba con ./gradlew recordRoborazziDebug; las imágenes quedan en build/outputs/roborazzi
 * (o en -Phierro.shots=<dir>).
 */
@RunWith(ParameterizedRobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w400dp-h1400dp-xhdpi")
class ScreenshotTest(private val pattern: String) {
    @get:Rule val compose = createComposeRule()

    @Test fun captura() {
        val index = Screens.samples.indexOfFirst { it.first == pattern }
        val route = Screens.samples[index].second
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(), startRoute = route) } }
        compose.waitForIdle()
        compose.mainClock.advanceTimeBy(800)
        val dir = System.getProperty("hierro.shots") ?: "build/outputs/roborazzi"
        val name = "%02d-%s".format(index + 1, route.substringBefore('/').let { base -> if (route.contains('/')) "$base-detalle" else base })
        compose.onRoot().captureRoboImage("$dir/$name.png")
    }

    companion object {
        @JvmStatic
        @ParameterizedRobolectricTestRunner.Parameters(name = "{0}")
        fun rutas(): List<Array<Any>> = com.hierro.navigation.Routes.all.map { arrayOf(it) }
    }
}

@RunWith(ParameterizedRobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w1280dp-h900dp-mdpi")
class TabletScreenshotTest(private val route: String) {
    @get:Rule val compose = createComposeRule()

    @Test fun captura() {
        compose.setContent { HierroTheme { HierroApp(Fixtures.vm(), startRoute = route) } }
        compose.waitForIdle()
        compose.mainClock.advanceTimeBy(800)
        val dir = System.getProperty("hierro.shots") ?: "build/outputs/roborazzi"
        compose.onRoot().captureRoboImage("$dir/tableta-$route.png")
    }

    companion object {
        @JvmStatic
        @ParameterizedRobolectricTestRunner.Parameters(name = "{0}")
        fun rutas(): List<Array<Any>> = com.hierro.navigation.Routes.tabs.map { arrayOf(it.route) }
    }
}
