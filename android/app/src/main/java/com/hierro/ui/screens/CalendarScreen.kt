package com.hierro.ui.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.hierro.data.Dates
import com.hierro.data.Kind
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.Horizon
import com.hierro.ui.LocalNav
import com.hierro.ui.SpanView
import com.hierro.ui.components.AccentButton
import com.hierro.ui.components.Chip
import com.hierro.ui.components.Collapsible
import com.hierro.ui.components.DayAgenda
import com.hierro.ui.components.GoToDay
import com.hierro.ui.components.IconSquareButton
import com.hierro.ui.components.Legend
import com.hierro.ui.components.MonthPicker
import com.hierro.ui.components.PageIntro
import com.hierro.ui.components.SectionLabel
import com.hierro.ui.components.ToggleChip
import com.hierro.ui.components.ViewTabs
import com.hierro.ui.components.WeekAgenda
import com.hierro.ui.components.WeekGrid
import com.hierro.ui.components.rail
import com.hierro.ui.theme.H

@Composable
fun CalendarScreen(vm: AppViewModel) {
    val nav = LocalNav.current
    val wide = LocalWide.current
    val today = vm.today()
    val events by vm.events.collectAsState()
    var horizon by remember { mutableStateOf(Horizon(Dates.initialDate(today), if (wide) SpanView.Semana else SpanView.Dia)) }
    var kinds by rememberSaveable { mutableStateOf(Kind.entries.map { it.id }.toSet()) }
    val active = Kind.entries.filter { it.id in kinds }.toSet()
    val cursor = horizon.date

    Page("pantalla-calendario") {
        PageIntro("Calendario", "Día, semana o mes · 1 oct – 28 feb")
        ChipRow(Modifier.padding(bottom = 12.dp)) {
            Chip("Semana ${Dates.isoWeek(today)}")
            ToggleChip("Hoy", cursor == today, { if (Dates.isInRange(today)) horizon = horizon.withDate(today) })
            Spacer(Modifier.weight(1f))
            AccentButton("+ Nuevo evento", { nav.go(Routes.evento(Dates.toIso(cursor))) })
        }
        ViewTabs(horizon.view, { horizon = horizon.copy(view = it) }, "calendario")
        Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.End) { GoToDay(cursor, { horizon = horizon.withDate(it) }, compact = true) }
        Row(Modifier.fillMaxWidth().padding(vertical = 12.dp).horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ToggleChip("Todos", active.size == Kind.entries.size, { kinds = Kind.entries.map { it.id }.toSet() })
            Kind.entries.forEach { k -> ToggleChip(k.label, k in active, { kinds = if (k.id in kinds) kinds - k.id else kinds + k.id }, dot = k.rail()) }
        }
        Row(
            Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            val label = when (horizon.view) { SpanView.Dia -> "Día"; SpanView.Mes -> "Mes"; SpanView.Semana -> "Semana" }
            IconSquareButton("$label anterior", "‹", !horizon.atStart) { horizon = horizon.step(-1) }
            Text(horizon.title, style = H.type.cardTitle, textAlign = TextAlign.Center, modifier = Modifier.weight(1f))
            IconSquareButton("$label siguiente", "›", !horizon.atEnd) { horizon = horizon.step(1) }
        }
        Spacer(Modifier.padding(top = 12.dp))
        when (horizon.view) {
            SpanView.Dia -> DayAgenda(vm.plan, cursor, active, events, vm::removeEvent)
            SpanView.Semana -> if (wide) {
                Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                    Box(Modifier.weight(1f)) { WeekGrid(vm.plan, horizon.week, active, cursor, today) { horizon = horizon.withDate(it) } }
                    Column(Modifier.width(336.dp).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(16.dp)) {
                        SectionLabel("Detalle del día")
                        Text(Dates.capitalize(Dates.formatLong(cursor)), style = H.type.display3, modifier = Modifier.padding(bottom = 12.dp))
                        DayAgenda(vm.plan, cursor, active, events, vm::removeEvent)
                    }
                }
            } else {
                WeekAgenda(vm.plan, horizon.week, active, cursor) { horizon = horizon.withDate(it) }
            }
            SpanView.Mes -> {
                MonthPicker(cursor, { horizon = horizon.withDate(it) }, today = today, dots = { day ->
                    val plan = vm.plan.day(day)
                    listOf(Kind.Clase, Kind.Gym, Kind.Trabajo, Kind.Comida).filter { k -> k in active && plan?.items?.any { it.kind == k } == true }.map { it.rail() }
                })
                Spacer(Modifier.padding(top = 12.dp))
                WeekAgenda(vm.plan, listOf(cursor), active, cursor) { horizon = horizon.withDate(it) }
            }
        }
        if (active.isEmpty()) {
            Text("Activa al menos un tipo para ver el día.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 16.dp).fillMaxWidth().clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel).padding(12.dp))
        }
        Collapsible("Materias") { Legend(vm.plan) }
    }
}

