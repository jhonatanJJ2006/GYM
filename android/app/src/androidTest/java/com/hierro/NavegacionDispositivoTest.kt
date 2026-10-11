package com.hierro

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performScrollTo
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.hierro.navigation.Routes
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Prueba en dispositivo o emulador real (con OpenGL): recorre las pestañas y entra y sale
 * varias veces de las pantallas con coach 3D, que es donde la app se cerraba.
 * Ejecutar con: ./gradlew connectedDebugAndroidTest
 */
@RunWith(AndroidJUnit4::class)
class NavegacionDispositivoTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Test fun recorrePestanas() {
        Routes.tabs.forEach { tab ->
            compose.onNodeWithTag("tab-${tab.route}").performClick()
            compose.waitForIdle()
            compose.onNodeWithTag("pantalla-${tab.route}").assertExists()
        }
    }

    @Test fun entraYSaleDelCoach3D() {
        repeat(3) {
            compose.onNodeWithTag("tab-${Routes.ENTRENO}").performClick()
            compose.waitForIdle()
            compose.onNodeWithTag("pantalla-entreno").assertExists()
            compose.onNodeWithText("Iniciar entreno guiado").performScrollTo().performClick()
            compose.waitForIdle()
            compose.onNodeWithTag("pantalla-guiado").assertExists()
            Thread.sleep(1500)
            compose.onNodeWithContentDescription("Cerrar").performClick()
            compose.waitForIdle()
        }
        compose.onNodeWithTag("pantalla-entreno").assertExists()
    }
}
