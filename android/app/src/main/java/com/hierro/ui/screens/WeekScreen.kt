package com.hierro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.hierro.data.Dates
import com.hierro.data.Kind
import com.hierro.data.PlanRepository
import com.hierro.data.Time
import com.hierro.data.shoulderFocus
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.Horizon
import com.hierro.ui.LocalNav
import com.hierro.ui.SpanView
import com.hierro.ui.components.Chip
import com.hierro.ui.components.Collapsible
import com.hierro.ui.components.Legend
import com.hierro.ui.components.MonthPicker
import com.hierro.ui.components.PageIntro
import com.hierro.ui.components.PeriodBar
import com.hierro.ui.components.SectionLabel
import com.hierro.ui.components.block
import com.hierro.ui.components.rail
import com.hierro.ui.theme.H
import java.time.LocalDate

@Composable
fun WeekScreen(vm: AppViewModel) {
    val plan = vm.plan
    val mark = H.Mark.getValue("semana")
    var horizon by remember { mutableStateOf(Horizon.initial(vm.today(), Dates.ANCHOR_MON)) }
    val date = horizon.date
    val days = if (horizon.view == SpanView.Semana) horizon.week else listOf(date)
    Page("pantalla-semana") {
        PageIntro(
            "Semana",
            "Malla real del día que elijas, del 1 de octubre de 2026 al 28 de febrero de 2027. El ciclo de hombro arranca el lunes 5 de octubre: semanas 1 y 3 tríceps, semanas 2 y 4 bíceps. El primer jueves con clases es el 8 de octubre.",
        )
        ChipRow {
            SectionLabel("Planificación")
            Chip("Semana ${Dates.isoWeek(date)}", color = H.Accent)
            Chip("Ciclo ${Dates.cycleWeek(date)}")
            Chip("${horizon.week.size} sesiones prog.")
        }
        PeriodBar(horizon, { horizon = it }, "la semana", mark)
        Text(
            "Semana ${Dates.cycleWeek(date)} del ciclo. El jueves de esta semana es hombro + ${shoulderFocus(Dates.cycleWeek(date))}. Gym lunes, jueves y viernes 07:00–09:00; martes y miércoles 18:00–19:15; sábado y domingo abdomen 10:00–11:00.",
            style = H.type.bodyStrong, modifier = Modifier.padding(top = 12.dp),
        )
        ChipRow(Modifier.padding(top = 12.dp)) {
            listOf(Kind.Gym to "Entreno", Kind.Clase to "Clases", Kind.Trabajo to "Trabajo", Kind.Comida to "Dieta").forEach { (k, n) -> Chip(n, dot = k.rail()) }
        }
        if (horizon.view == SpanView.Mes) MonthPicker(date, { horizon = horizon.withDate(it) }, caption = { plan.sessionFor(it).short })
        Column(Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (horizon.view == SpanView.Semana && LocalWide.current) {
                days.chunked(2).forEach { pair -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { pair.forEach { Box(Modifier.weight(1f)) { DayCard(plan, it, it == date && horizon.view == SpanView.Semana) { d -> horizon = horizon.withDate(d) } } } } }
            } else days.forEach { DayCard(plan, it, it == date && horizon.view == SpanView.Semana) { d -> horizon = horizon.withDate(d) } }
        }
        Collapsible("Materias") { Legend(plan) }
    }
}

@Composable
private fun DayCard(plan: PlanRepository, day: LocalDate, ring: Boolean, onSelect: (LocalDate) -> Unit) {
    val nav = LocalNav.current
    val iso = Dates.toIso(day)
    val session = plan.sessionFor(day)
    val classes = plan.classesFor(day)
    val work = plan.day(day)?.work ?: emptyList()
    Column(Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, if (ring) H.Accent.copy(alpha = 0.6f) else H.Line, H.cardShape).background(H.Panel).padding(16.dp)) {
        Row(Modifier.fillMaxWidth().clickable { onSelect(day) }, verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween) {
            Row {
                Text(Dates.capitalize(Dates.DOW_LONG[Dates.dow(day)]) + " ", style = H.type.display3)
                Text("${day.dayOfMonth}", style = H.type.display3.copy(color = H.Muted))
            }
            Text("${1 + classes.size + work.size} bloques", style = H.type.small)
        }
        Column(Modifier.padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            BlockRow(Kind.Gym, "Gimnasio", session.title, session.time) { nav.go(Routes.gym(iso)) }
            classes.forEach { BlockRow(Kind.Clase, "Materia · ${it.type}", it.name, "${it.start}–${it.end}", wrap = true) { nav.go(Routes.clase(iso, it.key)) } }
            work.forEach { BlockRow(Kind.Trabajo, "Trabajo", Time.formatDuration(it.end - it.start), Time.formatSpan(it)) { nav.go(Routes.trabajo(iso, it.start)) } }
        }
        if (classes.isEmpty()) Text("Sin clases.", style = H.type.small, modifier = Modifier.padding(top = 8.dp))
        Text("Ver el entreno", style = H.type.bodyStrong.copy(color = H.Mark.getValue("semana")), modifier = Modifier.padding(top = 12.dp).clickable { nav.go(Routes.gym(iso)) })
    }
}

@Composable
private fun BlockRow(kind: Kind, label: String, title: String, time: String, wrap: Boolean = false, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(kind.block().copy(alpha = 0.45f)).clickable(onClick = onClick).rail(kind.rail()).padding(start = 14.dp, end = 10.dp, top = 8.dp, bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Column(Modifier.weight(1f)) {
            Text(label.uppercase(), style = H.type.tiny.copy(color = kind.rail()))
            Text(title, style = H.type.bodyStrong, maxLines = if (wrap) 3 else 1, overflow = TextOverflow.Ellipsis)
        }
        Text(time, style = H.type.small.copy(color = kind.rail()))
    }
}
