package com.hierro.coach

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsRun
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.AccessibilityNew
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.google.android.filament.gltfio.Animator
import com.hierro.ui.theme.H
import io.github.sceneview.Scene
import io.github.sceneview.math.Position
import io.github.sceneview.node.ModelNode
import io.github.sceneview.rememberCameraNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberModelLoader

private const val TAG = "Coach3D"

/** OpenGL ES 3.0 es el mínimo de Filament. En Robolectric y previews se usa el respaldo 2D. */
fun supports3D(context: Context): Boolean {
    if (Build.FINGERPRINT == "robolectric") return false
    val am = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager ?: return false
    return am.deviceConfigurationInfo.reqGlEsVersion >= 0x30000
}

private fun Animator.indexOf(name: String): Int = (0 until animationCount).firstOrNull { getAnimationName(it) == name } ?: -1

/**
 * Coach 3D con el equipo del ejercicio. Los dos modelos quedan en su origen (sin centrar ni
 * escalar) y en cada cuadro se aplica el mismo tiempo de bucle a los dos animadores, así
 * la barra, las poleas o los pedales van sincronizados con el cuerpo.
 */
@Composable
fun Coach3D(pose: String, modifier: Modifier = Modifier, label: String = "") {
    val context = LocalContext.current
    val available = !LocalInspectionMode.current && remember { supports3D(context) }
    if (!available) {
        CoachFallback(pose, modifier, label)
        return
    }
    val clip = CoachClips.clipFor(pose)
    val info = CoachClips.infoFor(pose)
    val engine = rememberEngine()
    val loader = rememberModelLoader(engine)
    val nodes = remember(clip) {
        runCatching {
            val coach = ModelNode(loader.createModelInstance(CoachClips.COACH), false, null, null)
            val gear = info.gear?.let { file ->
                runCatching { ModelNode(loader.createModelInstance(CoachClips.gearPath(file)), false, null, null) }
                    .onFailure { Log.w(TAG, "Sin equipo $file", it) }.getOrNull()
            }
            listOfNotNull(coach, gear)
        }.onFailure { Log.w(TAG, "No se pudo cargar el coach", it) }.getOrNull()
    }
    if (nodes.isNullOrEmpty()) {
        CoachFallback(pose, modifier, label)
        return
    }
    // Encuadre: caja del coach unida a la del equipo, con la dirección del preset del clip.
    val (center, radius) = remember(clip) {
        var min = floatArrayOf(Float.MAX_VALUE, Float.MAX_VALUE, Float.MAX_VALUE)
        var max = floatArrayOf(-Float.MAX_VALUE, -Float.MAX_VALUE, -Float.MAX_VALUE)
        nodes.forEach { node ->
            val c = node.boundingBox.center
            val h = node.boundingBox.halfExtent
            min = FloatArray(3) { minOf(min[it], c[it] - h[it]) }
            max = FloatArray(3) { maxOf(max[it], c[it] + h[it]) }
        }
        min[1] = minOf(min[1], 0f)
        val ctr = FloatArray(3) { (min[it] + max[it]) / 2 }
        val r = kotlin.math.sqrt((0..2).sumOf { ((max[it] - min[it]) * (max[it] - min[it])).toDouble() }).toFloat() / 2 + 0.12f
        ctr to r
    }
    val eye = CoachClips.cameraPosition(info.view, center, radius)
    val camera = rememberCameraNode(engine) {
        position = Position(eye[0], eye[1], eye[2])
        lookAt(Position(center[0], center[1], center[2]))
    }
    val indices = remember(nodes) { nodes.map { it.animator.indexOf(clip) } }
    val startNanos = remember(clip) { System.nanoTime() }
    Scene(
        modifier = modifier.fillMaxSize(),
        engine = engine,
        modelLoader = loader,
        isOpaque = false,
        cameraNode = camera,
        cameraManipulator = null,
        childNodes = nodes,
        onFrame = { frameNanos ->
            val t = CoachClips.loopTime((frameNanos - startNanos) / 1_000_000)
            nodes.forEachIndexed { i, node ->
                val index = indices[i]
                if (index >= 0) {
                    node.animator.applyAnimation(index, t)
                    node.animator.updateBoneMatrices()
                }
            }
        },
    )
}

/** Icono 2D según el clip: se usa sin OpenGL ES 3, si el GLB falla y en las miniaturas. */
fun glyphFor(pose: String): ImageVector = when (CoachClips.clipFor(pose)) {
    "Bike" -> Icons.Filled.DirectionsBike
    "TreadmillJog" -> Icons.AutoMirrored.Filled.DirectionsRun
    "TreadmillWalk", "Lunge", "FarmerCarry" -> Icons.AutoMirrored.Filled.DirectionsWalk
    "Plank", "Crunch", "Breathe", "GluteBridge", "LegRaise" -> Icons.Filled.SelfImprovement
    "LateralRaise", "ShoulderPress" -> Icons.Filled.AccessibilityNew
    else -> Icons.Filled.FitnessCenter
}

@Composable
fun CoachFallback(pose: String, modifier: Modifier = Modifier, label: String = "", size: Dp = 120.dp) {
    Box(modifier.fillMaxSize().background(H.Ink), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(Modifier.size(size).clip(CircleShape).background(H.BlockGym), contentAlignment = Alignment.Center) {
                Icon(glyphFor(pose), contentDescription = label.ifEmpty { null }, tint = H.Accent, modifier = Modifier.size(size * 0.55f))
            }
            if (label.isNotEmpty() && size >= 80.dp) Text(label, style = H.type.caption, color = H.Muted)
        }
    }
}

/** Miniatura de lista: icono sobre fondo tinta. */
@Composable
fun CoachThumb(pose: String, modifier: Modifier = Modifier, size: Dp = 40.dp) {
    Box(modifier.size(size).clip(H.rowShape).background(H.Ink), contentAlignment = Alignment.Center) {
        Icon(glyphFor(pose), contentDescription = null, tint = H.Accent, modifier = Modifier.size(size * 0.6f))
    }
}
