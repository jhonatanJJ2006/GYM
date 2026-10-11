package com.hierro.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DatePickerDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.hierro.data.Dates
import com.hierro.ui.Horizon
import com.hierro.ui.SpanView
import com.hierro.ui.theme.H
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

/** Selector Día/Semana/Mes con indicador cobre. */
@Composable
fun ViewTabs(view: SpanView, onView: (SpanView) -> Unit, label: String) {
    BoxWithConstraints(Modifier.fillMaxWidth().clip(H.cardShape).background(H.Panel).border(1.dp, H.Line, H.cardShape).padding(4.dp).semantics { contentDescription = "Vista de $label" }) {
        val w = (maxWidth) / 3
        val x by animateFloatAsState(SpanView.entries.indexOf(view).toFloat(), label = "tab")
        Box(Modifier.offset(x = w * x).width(w).heightIn(min = 36.dp).height(36.dp).clip(H.rowShape).background(H.Panel2).border(1.dp, H.Accent.copy(alpha = 0.4f), H.rowShape))
        Row(Modifier.fillMaxWidth()) {
            SpanView.entries.forEach { item ->
                Box(
                    Modifier.weight(1f).height(36.dp).clip(H.rowShape).clickable { onView(item) }.semantics { role = Role.Tab; selected = item == view },
                    contentAlignment = Alignment.Center,
                ) { Text(item.label, style = H.type.small.copy(color = if (item == view) H.Accent else H.Muted, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)) }
            }
        }
    }
}

/** Port de PeriodBar: pestañas, flechas y salto a un día. */
@Composable
fun PeriodBar(horizon: Horizon, onChange: (Horizon) -> Unit, label: String, mark: androidx.compose.ui.graphics.Color) {
    Column(Modifier.padding(top = 16.dp)) {
        ViewTabs(horizon.view, { onChange(horizon.copy(view = it)) }, label)
        Row(Modifier.fillMaxWidth().padding(top = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            IconSquareButton("Anterior", "‹", !horizon.atStart) { onChange(horizon.step(-1)) }
            Text(horizon.title, style = H.type.cardTitle.copy(color = mark), textAlign = TextAlign.Center, modifier = Modifier.weight(1f).padding(horizontal = 8.dp))
            IconSquareButton("Siguiente", "›", !horizon.atEnd) { onChange(horizon.step(1)) }
        }
        GoToDay(horizon.date, { onChange(horizon.withDate(it)) }, Modifier.padding(top = 12.dp))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GoToDay(date: LocalDate, onDate: (LocalDate) -> Unit, modifier: Modifier = Modifier, compact: Boolean = false) {
    var open by remember { mutableStateOf(false) }
    if (compact) {
        Row(
            modifier.heightIn(min = 36.dp).clip(H.chipShape).border(1.dp, H.Line, H.chipShape).background(H.Panel).clickable { open = true }.padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(Icons.Filled.CalendarMonth, null, tint = H.Muted, modifier = Modifier.width(16.dp))
            Text("Ir a un día", style = H.type.small)
        }
    } else {
        Row(
            modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Ink2).clickable { open = true }.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("Ir a un día", style = H.type.body.copy(color = H.Muted))
            Text(Dates.toIso(date), style = H.type.body, modifier = Modifier.clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Ink).padding(horizontal = 10.dp, vertical = 8.dp))
        }
    }
    if (open) {
        val start = Dates.RANGE_START.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli()
        val end = Dates.RANGE_END.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli()
        val state = rememberDatePickerState(
            initialSelectedDateMillis = date.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli(),
            yearRange = 2026..2027,
            selectableDates = object : SelectableDates {
                override fun isSelectableDate(utcTimeMillis: Long) = utcTimeMillis in start..end
                override fun isSelectableYear(year: Int) = year in 2026..2027
            },
        )
        val colors = DatePickerDefaults.colors(containerColor = H.Ink, selectedDayContainerColor = H.Accent, selectedDayContentColor = H.AccentInk, todayDateBorderColor = H.Accent, todayContentColor = H.Accent)
        DatePickerDialog(
            onDismissRequest = { open = false },
            confirmButton = {
                TextButton(onClick = {
                    state.selectedDateMillis?.let { onDate(Instant.ofEpochMilli(it).atZone(ZoneOffset.UTC).toLocalDate()) }
                    open = false
                }) { Text("Ir", color = H.Accent) }
            },
            dismissButton = { TextButton(onClick = { open = false }) { Text("Cancelar", color = H.Muted) } },
            colors = colors,
        ) { DatePicker(state = state, colors = colors) }
    }
}

/** Mes de lunes a domingo con un pie de texto por día (MonthPicker). */
@Composable
fun MonthPicker(date: LocalDate, onChoose: (LocalDate) -> Unit, caption: ((LocalDate) -> String)? = null, dots: ((LocalDate) -> List<androidx.compose.ui.graphics.Color>)? = null, today: LocalDate? = null) {
    val cells = Dates.monthCells(date.year, date.monthValue)
    Column(Modifier.fillMaxWidth().padding(top = 16.dp).clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Ink2).padding(12.dp)) {
        Row(Modifier.fillMaxWidth()) { Dates.WEEK_LETTERS.forEach { Text(it, style = H.type.tiny, textAlign = TextAlign.Center, modifier = Modifier.weight(1f)) } }
        cells.chunked(7).forEach { week ->
            Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                week.forEach { day ->
                    if (day == null || !Dates.isInRange(day)) {
                        Box(Modifier.weight(1f).heightIn(min = 48.dp))
                    } else {
                        val active = day == date
                        Column(
                            Modifier.weight(1f).heightIn(min = 48.dp).clip(H.rowShape).background(if (active) H.Cream else androidx.compose.ui.graphics.Color.Transparent)
                                .then(if (!active && day == today) Modifier.border(1.dp, H.Cream, H.rowShape) else Modifier)
                                .clickable { onChoose(day) }.padding(vertical = 4.dp).semantics { contentDescription = Dates.formatLong(day) },
                            horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                        ) {
                            Text("${day.dayOfMonth}", style = H.type.cardTitle.copy(color = if (active) H.Ink else if (Dates.isInTerm(day) || caption != null) H.Cream else H.Muted))
                            caption?.let { Text(it(day), style = H.type.tiny.copy(color = if (active) H.Ink.copy(alpha = 0.7f) else H.Muted), maxLines = 2, textAlign = TextAlign.Center) }
                            dots?.let { list ->
                                Row(Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                    list(day).forEach { Box(Modifier.width(6.dp).height(6.dp).clip(H.chipShape).background(it)) }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
