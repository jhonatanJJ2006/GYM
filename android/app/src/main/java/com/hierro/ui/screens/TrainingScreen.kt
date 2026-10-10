package com.hierro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.hierro.coach.CoachFallback
import com.hierro.data.Dates
import com.hierro.data.Exercise
import com.hierro.data.GROUPS
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.Horizon
import com.hierro.ui.LocalNav
import com.hierro.ui.SpanView
import com.hierro.ui.components.AccentButton
import com.hierro.ui.components.Chip
import com.hierro.ui.components.HCard
import com.hierro.ui.components.HCheckbox
import com.hierro.ui.components.MonthPicker
import com.hierro.ui.components.PageIntro
import com.hierro.ui.components.PeriodBar
import com.hierro.ui.components.ToggleChip
import com.hierro.ui.theme.H

@Composable
fun TrainingScreen(vm: AppViewModel) {
    val nav = LocalNav.current
    val plan = vm.plan
    val today = vm.today()
    val checks by vm.training.collectAsState()
    var horizon by remember { mutableStateOf(Horizon.initial(today, Dates.ANCHOR_MON)) }
    val day = horizon.date
    val iso = Dates.toIso(day)
    val session = plan.sessionFor(day)
    val doneCount = session.exercises.count { checks["$iso:${it.id}"] == true }
    val mark = H.Mark.getValue("entreno")
    Page("pantalla-entreno") {
        PageIntro(
            "Entreno",
            "Ciclo de 4 semanas desde el lunes 5 de octubre de 2026 hasta el 2 de febrero de 2027. Lunes pecho y tríceps, martes cuádriceps y gemelos, miércoles espalda y bíceps, jueves hombro (tríceps en semanas 1 y 3, bíceps en 2 y 4), viernes femoral, gemelos y glúteo. Fin de semana, abdomen.",
        )
        ChipRow {
            Chip("Hoy, ${Dates.formatLong(today)}", color = H.Accent)
            Chip("Semana ${Dates.isoWeek(today)}")
            ToggleChip("Ir a hoy", false, { horizon = horizon.withDate(today) })
        }
        PeriodBar(horizon, { horizon = it }, "entreno", mark)
        if (horizon.view == SpanView.Semana) {
            Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                horizon.week.forEach { item ->
                    val on = item == day
                    Column(
                        Modifier.weight(1f).heightIn(min = 56.dp).clip(H.rowShape).border(1.dp, if (on) H.Accent.copy(alpha = 0.4f) else H.Line, H.rowShape)
                            .background(if (on) H.Panel2 else H.Panel).clickable { horizon = horizon.withDate(item) }.padding(vertical = 4.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        val c = if (on) H.Accent else H.Muted
                        Text(Dates.DOW_LONG[Dates.dow(item)].take(3), style = H.type.tiny.copy(color = c))
                        Text("${item.dayOfMonth}", style = H.type.display3.copy(color = c))
                        Text(plan.sessionFor(item).short, style = H.type.tiny.copy(color = c))
                    }
                }
            }
        }
        if (horizon.view == SpanView.Mes) MonthPicker(day, { horizon = horizon.withDate(it) }, caption = { plan.sessionFor(it).short })
        HCard(Modifier.fillMaxWidth().padding(top = 16.dp)) {
            Column(Modifier.padding(20.dp)) {
                Text(session.title, style = H.type.display2.copy(fontSize = androidx.compose.ui.unit.TextUnit(30f, androidx.compose.ui.unit.TextUnitType.Sp)))
                Text("${session.time} · ${session.minutesLabel}", style = H.type.bodyStrong.copy(color = H.Cream.copy(alpha = 0.8f)), modifier = Modifier.padding(top = 4.dp))
                Text(session.note, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 12.dp))
                Text("Hechos $doneCount de ${session.exercises.size}", style = H.type.bodyStrong, modifier = Modifier.padding(top = 12.dp))
                AccentButton("Iniciar entreno guiado", { nav.go(Routes.guiado(iso)) }, Modifier.fillMaxWidth().padding(top = 16.dp), icon = { Icon(Icons.Filled.PlayArrow, null, Modifier.size(18.dp)) })
            }
        }
        val wide = LocalWide.current
        GROUPS.getValue(session.id).forEach { group ->
            Text(group.label, style = H.type.display2, modifier = Modifier.padding(top = 24.dp, bottom = 8.dp))
            val list = session.exercises.subList(group.from, minOf(group.to, session.exercises.size))
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                list.chunked(if (wide) 2 else 1).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        row.forEach { exercise ->
                            val index = session.exercises.indexOf(exercise)
                            val checked = checks["$iso:${exercise.id}"] == true
                            Box(Modifier.weight(1f)) {
                                ExerciseCard(exercise, checked, { nav.go(Routes.ejercicio(session.id, index)) }) { vm.setDone(iso, exercise.id, !checked) }
                            }
                        }
                        if (row.size == 1 && wide) Box(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun ExerciseCard(exercise: Exercise, checked: Boolean, onOpen: () -> Unit, onToggle: () -> Unit) {
    Row(Modifier.fillMaxWidth().alpha(if (checked) 0.6f else 1f).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel)) {
        Box(Modifier.weight(5f).aspectRatio(1f).clickable(onClick = onOpen)) { CoachFallback(exercise.pose, size = 72.dp) }
        Row(Modifier.weight(7f)) {
            Column(Modifier.weight(1f).clickable(onClick = onOpen).padding(horizontal = 12.dp, vertical = 10.dp)) {
                Text(exercise.name, style = H.type.bodyStrong)
                Text(exercise.reps, style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f)), modifier = Modifier.padding(top = 4.dp))
                Text(exercise.weight, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 4.dp))
            }
            HCheckbox(checked, onToggle, H.Mark.getValue("entreno"), if (checked) "Desmarcar ${exercise.name}" else "Marcar ${exercise.name} como hecho")
        }
    }
}
