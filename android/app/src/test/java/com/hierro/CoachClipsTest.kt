package com.hierro

import com.hierro.coach.CameraView
import com.hierro.coach.CoachClips
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

class CoachClipsTest {
    /** Nombres de animaciones dentro de un GLB (chunk JSON). */
    private fun clipsIn(path: String): Set<String> {
        val bytes = File(path).readBytes()
        val buf = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
        assertEquals(0x46546C67, buf.getInt(0))
        val len = buf.getInt(12)
        val json = Json.parseToJsonElement(String(bytes, 20, len)).jsonObject
        return json["animations"]?.jsonArray?.map { it.jsonObject["name"]!!.jsonPrimitive.content }?.toSet() ?: emptySet()
    }

    @Test fun cubreLos45Ejercicios() {
        assertEquals(45, CoachClips.POSE_CLIP.size)
        CoachClips.POSE_CLIP.values.forEach { assertTrue(it, it in CoachClips.CLIPS) }
    }

    @Test fun mismoMapeoQueLaWeb() {
        assertEquals(Fixtures.plan.poseClip, CoachClips.POSE_CLIP)
    }

    @Test fun todosLosEjerciciosDelPlanTienenClip() {
        Fixtures.plan.sessions.values.flatMap { it.exercises }.forEach { e ->
            assertTrue(e.pose, e.pose in CoachClips.POSE_CLIP)
        }
    }

    @Test fun clipsExistenEnElCoach() {
        val coach = clipsIn("src/main/assets/${CoachClips.COACH}")
        assertEquals(26, coach.size)
        CoachClips.CLIPS.keys.forEach { assertTrue(it, it in coach) }
    }

    @Test fun equipoTraeElMismoClip() {
        CoachClips.CLIPS.forEach { (clip, info) ->
            val gear = info.gear ?: return@forEach
            val path = "src/main/assets/${CoachClips.gearPath(gear)}"
            assertTrue(path, File(path).exists())
            // Igual que seek() en la web: si el equipo no trae el clip, queda quieto (colchoneta, mancuernas del paseo).
            val static = setOf("FarmerCarry", "Plank", "Crunch", "Breathe", "GluteBridge", "LegRaise")
            if (clip !in static) assertTrue("$gear sin $clip", clip in clipsIn(path))
        }
    }

    @Test fun presetsDeCamara() {
        assertEquals(CameraView.High, CoachClips.infoFor("bench").view)
        assertEquals(CameraView.Side, CoachClips.infoFor("pushdown").view)
        assertEquals(CameraView.Front, CoachClips.infoFor("curl").view)
        assertEquals("Idle", CoachClips.clipFor("desconocido"))
        val eye = CoachClips.cameraPosition(CameraView.Side, floatArrayOf(0f, 1f, 0f), 1f)
        assertTrue(eye[0] < 0f && eye[1] > 1f && eye[2] > 0f)
    }

    @Test fun bucleDeTresSegundos() {
        assertEquals(3f, CoachClips.clipSeconds())
        assertEquals(0.5f, CoachClips.loopTime(3500), 1e-4f)
        assertEquals(0f, CoachClips.loopTime(0), 0f)
    }
}
