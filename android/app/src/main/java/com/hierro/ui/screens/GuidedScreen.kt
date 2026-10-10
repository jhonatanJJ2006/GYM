package com.hierro.ui.screens

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import com.hierro.coach.Coach3D
import com.hierro.data.Dates
import com.hierro.ui.AppViewModel
import com.hierro.ui.GuidedState
import com.hierro.ui.components.AccentButton
import com.hierro.ui.components.LineButton
import com.hierro.ui.components.ProgressBar
import com.hierro.ui.components.SectionLabel
import com.hierro.ui.theme.H
import kotlinx.coroutines.delay

/** Aviso al terminar el descanso: vibración corta y un tono. */
fun restDone(context: Context) {
    runCatching {
        val vibrator = if (Build.VERSION.SDK_INT >= 31) (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
        else @Suppress("DEPRECATION") (context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator)
        vibrator.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 180, 120, 180), -1))
    }
    runCatching { ToneGenerator(AudioManager.STREAM_NOTIFICATION, 80).startTone(ToneGenerator.TONE_PROP_BEEP2, 300) }
}

@Composable
fun GuidedScreen(vm: AppViewModel, iso: String) {
    val date = runCatching { Dates.parseIso(iso) }.getOrNull() ?: return Missing("Fecha inválida.")
    val context = LocalContext.current
    val view = LocalView.current
    val session = vm.plan.sessionFor(date)
    val checks by vm.training.collectAsState()
    var state by remember { mutableStateOf(GuidedState.start(session) { vm.isDone(iso, it) }) }
    DisposableEffect(Unit) {
        view.keepScreenOn = true
        onDispose { view.keepScreenOn = false }
    }
    LaunchedEffect(state.rest) {
        if (state.rest > 0) {
            delay(1000)
            state = state.tick()
            if (state.rest == 0) restDone(context)
        }
    }
    val exercise = session.exercises[state.index]
    val total = state.total(session)
    val done = checks["$iso:${exercise.id}"] == true
    val doneCount = session.exercises.count { checks["$iso:${it.id}"] == true }
    Detail("pantalla-guiado") {
        Text("Entreno guiado · ${session.title}", style = H.type.cardTitle)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Ejercicio ${state.index + 1} de ${session.exercises.size}", style = H.type.small)
            Text("Hechos $doneCount de ${session.exercises.size}", style = H.type.small)
        }
        ProgressBar(doneCount, session.exercises.size, label = "Progreso del entreno")
        Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel)) { Coach3D(exercise.pose, label = exercise.name) }
        Text(exercise.name, style = H.type.display2)
        Text(exercise.reps, style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f)))
        Text(exercise.weight, style = H.type.body.copy(color = H.Muted))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(12.dp)) {
                SectionLabel("Serie")
                Text("${if (done) total else state.set} / $total", style = H.type.displayNum)
            }
            val resting = state.rest > 0
            Column(Modifier.weight(1f).clip(H.cardShape).border(1.dp, if (resting) H.Accent.copy(alpha = 0.5f) else H.Line, H.cardShape).background(if (resting) H.Panel2 else H.Panel).padding(12.dp)) {
                SectionLabel("Descanso")
                Text(GuidedState.formatRest(state.rest), style = H.type.displayNum.copy(color = if (resting) H.Accent else H.Cream))
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (done) LineButton("Desmarcar", { vm.setDone(iso, exercise.id, false) }, Modifier.weight(1f))
            else AccentButton(if (state.set < total) "Serie hecha" else "Terminar ejercicio", {
                val (next, finished) = state.completeSet(session)
                finished?.let { vm.setDone(iso, it, true) }
                state = next
            }, Modifier.weight(1f), enabled = state.rest == 0)
            if (state.rest > 0) LineButton("Saltar descanso", { state = state.skipRest() })
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            LineButton("Anterior", { state = state.go(session, state.index - 1) }, Modifier.weight(1f), enabled = state.index > 0)
            LineButton("Siguiente", { state = state.go(session, state.index + 1) }, Modifier.weight(1f), enabled = state.index < session.exercises.lastIndex)
        }
        if (doneCount == session.exercises.size) {
            Text("Entreno completo.", style = H.type.body.copy(color = H.RailMeal), modifier = Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.RailMeal.copy(alpha = 0.4f), H.cardShape).background(H.BlockMeal.copy(alpha = 0.4f)).padding(12.dp))
        }
    }
}
