package com.hierro.coach

/**
 * Port de src/lib/coachClips.ts. Clips del coach (assets/models/coach.glb) y el equipo
 * (assets/models/gear/<archivo>.glb, con un clip del mismo nombre). Coach y equipo comparten
 * el origen (0, 0, 0) y se reproducen con el mismo tiempo. Cada clip dura 90 cuadros a 30 fps.
 */
enum class CameraView { Front, Side, High }

data class ClipInfo(val gear: String?, val view: CameraView)

object CoachClips {
    const val CLIP_FPS = 30
    const val CLIP_FRAMES = 90
    const val COACH = "models/coach.glb"

    fun gearPath(file: String) = "models/gear/$file.glb"

    fun clipSeconds(): Float = CLIP_FRAMES.toFloat() / CLIP_FPS

    val CLIPS: Map<String, ClipInfo> = mapOf(
        "Idle" to ClipInfo(null, CameraView.Front),
        "BenchPress" to ClipInfo("bench_press", CameraView.High),
        "InclinePress" to ClipInfo("incline_press", CameraView.Front),
        "CurlDumbbell" to ClipInfo("dumbbells", CameraView.Front),
        "HammerCurl" to ClipInfo("dumbbells", CameraView.Front),
        "SquatBarbell" to ClipInfo("squat", CameraView.Front),
        "RomanianDeadlift" to ClipInfo("barbell_floor", CameraView.Front),
        "BentOverRow" to ClipInfo("barbell_floor", CameraView.Front),
        "ShoulderPress" to ClipInfo("dumbbells", CameraView.Front),
        "LateralRaise" to ClipInfo("dumbbells", CameraView.Front),
        "Lunge" to ClipInfo("dumbbells", CameraView.Front),
        "CalfRaise" to ClipInfo("dumbbells", CameraView.Front),
        "FarmerCarry" to ClipInfo("dumbbells", CameraView.Front),
        "LegPress" to ClipInfo("leg_press", CameraView.Front),
        "LegPressHigh" to ClipInfo("leg_press", CameraView.Front),
        "LatPulldown" to ClipInfo("pulldown", CameraView.Front),
        "CablePushdown" to ClipInfo("cable_pushdown", CameraView.Side),
        "CableCrossover" to ClipInfo("cable_crossover", CameraView.Front),
        "TreadmillJog" to ClipInfo("treadmill", CameraView.Side),
        "TreadmillWalk" to ClipInfo("treadmill", CameraView.Side),
        "Bike" to ClipInfo("bike", CameraView.Side),
        "Plank" to ClipInfo("mat", CameraView.High),
        "Crunch" to ClipInfo("mat", CameraView.High),
        "Breathe" to ClipInfo("mat", CameraView.High),
        "GluteBridge" to ClipInfo("mat", CameraView.High),
        "LegRaise" to ClipInfo("mat", CameraView.High),
    )

    /** Cada ejercicio (pose) usa un clip. Los aproximados reusan el movimiento más cercano. */
    val POSE_CLIP: Map<String, String> = mapOf(
        "bike" to "Bike",
        "squat" to "SquatBarbell",
        "bench" to "BenchPress",
        "incline" to "InclinePress",
        "fly" to "CableCrossover",
        "dip" to "CablePushdown",
        "pushdown" to "CablePushdown",
        "lateral" to "LateralRaise",
        "pulldown" to "LatPulldown",
        "row" to "BentOverRow",
        "cable-row" to "BentOverRow",
        "face" to "CableCrossover",
        "curl" to "CurlDumbbell",
        "hammer" to "HammerCurl",
        "ohp" to "ShoulderPress",
        "rear" to "LateralRaise",
        "overhead" to "ShoulderPress",
        "kickback" to "BentOverRow",
        "incline-curl" to "CurlDumbbell",
        "rdl" to "RomanianDeadlift",
        "lunge" to "Lunge",
        "leg-curl" to "GluteBridge",
        "calf" to "CalfRaise",
        "press" to "LegPress",
        "bulgarian" to "Lunge",
        "thrust" to "GluteBridge",
        "press-high" to "LegPressHigh",
        "calf-seat" to "CalfRaise",
        "deadbug" to "LegRaise",
        "plank" to "Plank",
        "crunch" to "Crunch",
        "pallof" to "CablePushdown",
        "leg-raise" to "LegRaise",
        "side-plank" to "Plank",
        "farmer" to "FarmerCarry",
        "plank-tap" to "Plank",
        "twist" to "Crunch",
        "climber" to "Plank",
        "side-hip" to "Plank",
        "abwheel" to "Plank",
        "breathe" to "Breathe",
        "walk" to "TreadmillWalk",
        "bridge" to "GluteBridge",
        "band" to "LateralRaise",
        "circles" to "LateralRaise",
    )

    fun clipFor(pose: String): String = POSE_CLIP[pose] ?: "Idle"

    fun infoFor(pose: String): ClipInfo = CLIPS.getValue(clipFor(pose))

    /** Dirección de cámara de frameCamera() (coachStage.ts), sin normalizar. */
    fun cameraDirection(view: CameraView): FloatArray = when (view) {
        CameraView.Side -> floatArrayOf(-1f, 0.32f, 0.55f)
        CameraView.High -> floatArrayOf(-0.55f, 0.62f, 1f)
        CameraView.Front -> floatArrayOf(-0.5f, 0.28f, 1f)
    }

    /** Posición de cámara para encuadrar una esfera (centro, radio) con el fov vertical dado. */
    fun cameraPosition(view: CameraView, center: FloatArray, radius: Float, fovDeg: Float = 32f, aspect: Float = 4f / 3f): FloatArray {
        val d = cameraDirection(view)
        val len = kotlin.math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2])
        val fov = Math.toRadians(fovDeg.toDouble())
        val fit = minOf(1f, aspect)
        val dist = (radius * 0.92f / kotlin.math.sin(fov * fit / 2)).toFloat()
        return floatArrayOf(center[0] + d[0] / len * dist, center[1] + d[1] / len * dist, center[2] + d[2] / len * dist)
    }

    /** Tiempo del bucle a partir de milisegundos transcurridos, igual que paintView(). */
    fun loopTime(elapsedMs: Long): Float {
        val s = clipSeconds()
        return (((elapsedMs / 1000f) % s) + s) % s
    }
}
