package com.hierro.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hierro.R

/** Tokens de Hierro Dark (DESIGN.md y src/index.css). */
object H {
    val Ink = Color(0xFF0A0A0A)
    val Ink2 = Color(0xFF111111)
    val Panel = Color(0xFF161616)
    val Panel2 = Color(0xFF202020)
    val Line = Color(0xFF2C2C2C)
    val Cream = Color(0xFFF2F2F2)
    val Muted = Color(0xFF9B9B9B)
    val Grid = Color(0xFF5E5E5E)
    val Accent = Color(0xFFF0B08A)
    val AccentInk = Color(0xFF1A0F08)
    val Wash = Color(0xFF141414)

    val BlockClass = Color(0xFF2A4660)
    val RailClass = Color(0xFFA9D0F2)
    val BlockWork = Color(0xFF4A3B28)
    val RailWork = Color(0xFFE8C98A)
    val BlockGym = Color(0xFF4A3228)
    val RailGym = Color(0xFFF0B08A)
    val BlockMeal = Color(0xFF2A4634)
    val RailMeal = Color(0xFFB7DCB8)
    val Danger = Color(0xFFFCA5A5)
    val Amber = Color(0xFFFCD34D)

    /** Marca de cada sección (--color-mark-*). */
    val Mark = mapOf(
        "cal" to Color(0xFFB7D4EE),
        "clases" to Color(0xFF9EC4EE),
        "semana" to Color(0xFFD4C6EE),
        "entreno" to Color(0xFFF0B08A),
        "comidas" to Color(0xFFB7DCB8),
    )

    val cardShape = RoundedCornerShape(12.dp)
    val rowShape = RoundedCornerShape(8.dp)
    val blockShape = RoundedCornerShape(4.dp)
    val chipShape = RoundedCornerShape(999.dp)

    @OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)
    private fun syne(weight: Int) = Font(R.font.syne, FontWeight(weight), variationSettings = FontVariation.Settings(FontVariation.weight(weight)))

    @OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)
    private fun manrope(weight: Int) = Font(R.font.manrope, FontWeight(weight), variationSettings = FontVariation.Settings(FontVariation.weight(weight)))

    val Syne = FontFamily(syne(600), syne(700), syne(800))
    val Manrope = FontFamily(manrope(400), manrope(500), manrope(600), manrope(700))

    object type {
        val pageTitle = TextStyle(fontFamily = Syne, fontWeight = FontWeight.ExtraBold, fontSize = 36.sp, lineHeight = 38.sp, color = Cream)
        val display2 = TextStyle(fontFamily = Syne, fontWeight = FontWeight.ExtraBold, fontSize = 24.sp, lineHeight = 28.sp, color = Cream)
        val display3 = TextStyle(fontFamily = Syne, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 24.sp, color = Cream)
        val displayNum = TextStyle(fontFamily = Syne, fontWeight = FontWeight.ExtraBold, fontSize = 30.sp, lineHeight = 32.sp, color = Cream, fontFeatureSettings = "tnum")
        val cardTitle = TextStyle(fontFamily = Syne, fontWeight = FontWeight.Bold, fontSize = 16.sp, lineHeight = 21.sp, color = Cream)
        val body = TextStyle(fontFamily = Manrope, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 21.sp, color = Cream)
        val bodyStrong = body.copy(fontWeight = FontWeight.SemiBold)
        val small = TextStyle(fontFamily = Manrope, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 16.sp, color = Muted, fontFeatureSettings = "tnum")
        val caption = TextStyle(fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = 0.6.sp, color = Muted)
        val tiny = TextStyle(fontFamily = Manrope, fontWeight = FontWeight.SemiBold, fontSize = 10.sp, lineHeight = 12.sp, color = Muted, fontFeatureSettings = "tnum")
    }
}

@Composable
fun HierroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = H.Accent,
            onPrimary = H.AccentInk,
            background = H.Ink,
            onBackground = H.Cream,
            surface = H.Panel,
            onSurface = H.Cream,
            surfaceVariant = H.Panel2,
            onSurfaceVariant = H.Muted,
            outline = H.Line,
            secondary = H.RailMeal,
        ),
        content = content,
    )
}
