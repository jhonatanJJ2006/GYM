package com.hierro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
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
import androidx.compose.ui.unit.dp
import com.hierro.data.ClassBlock
import com.hierro.data.Dates
import com.hierro.data.PlanRepository
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.Horizon
import com.hierro.ui.LocalNav
import com.hierro.ui.SpanView
import com.hierro.ui.components.Chip
import com.hierro.ui.components.MonthPicker
import com.hierro.ui.components.PageIntro
import com.hierro.ui.components.PeriodBar
import com.hierro.ui.components.hex
import com.hierro.ui.components.rail
import com.hierro.ui.theme.H
import java.time.LocalDate

@Composable
fun ClassesScreen(vm: AppViewModel) {
    val plan = vm.plan
    var horizon by remember { mutableStateOf(Horizon.initial(vm.today(), Dates.TERM_START)) }
    val date = horizon.date
    val subjects = plan.courses.classes.values.flatten().map { it.name }.toSet().size
    val shown = if (horizon.view == SpanView.Semana) horizon.week else listOf(date)
    val holidays = shown.mapNotNull { plan.holiday(it) }
    Page("pantalla-clases") {
        PageIntro(
            "Clases",
            "Del lunes 5 de octubre de 2026 al 2 de febrero de 2027. Sábado y domingo no hay clases. Puedes ver un día, la semana o el mes, y saltar a cualquier fecha del rango.",
        )
        ChipRow {
            Chip("$subjects asignaturas", color = H.RailClass)
            Chip("Semana ${Dates.isoWeek(date)}")
        }
        PeriodBar(horizon, { horizon = it }, "clases", H.Mark.getValue("clases"))
        if (horizon.view == SpanView.Dia) {
            Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                (0L until 6L).map { Dates.mondayOnOrBefore(date).plusDays(it) }.forEach { day ->
                    val on = day == date
                    Column(
                        Modifier.weight(1f).heightIn(min = 56.dp).clip(H.cardShape).border(1.dp, if (on) H.Accent.copy(alpha = 0.5f) else H.Line, H.cardShape)
                            .background(if (on) H.Panel2 else H.Panel).clickable { horizon = horizon.withDate(day) },
                        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                    ) {
                        Text(Dates.DOW_LONG[Dates.dow(day)].take(3).uppercase(), style = H.type.caption.copy(color = if (on) H.Accent else H.Muted))
                        Text("${day.dayOfMonth}", style = H.type.display3.copy(color = if (on) H.Accent else H.Muted))
                    }
                }
            }
        }
        if (holidays.isNotEmpty()) {
            Text("Feriado en esta vista: ${holidays.joinToString(" · ")}.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 12.dp).fillMaxWidth().clip(H.cardShape).background(H.Panel).border(1.dp, H.Line, H.cardShape).padding(12.dp))
        }
        if (horizon.view == SpanView.Mes) {
            MonthPicker(date, { horizon = horizon.withDate(it) }, caption = { day ->
                val dow = Dates.dow(day)
                when {
                    dow == 0 || dow == 6 -> "Libre"
                    !Dates.isInTerm(day) -> "—"
                    else -> plan.classesFor(day).size.let { if (it > 0) "$it clases" else "—" }
                }
            })
        }
        Column(Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(24.dp)) {
            if (horizon.view == SpanView.Semana && LocalWide.current) {
                shown.chunked(2).forEach { pair ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { pair.forEach { Box(Modifier.weight(1f)) { DayColumn(plan, it) } } }
                }
            } else shown.forEach { DayColumn(plan, it) }
        }
    }
}

@Composable
private fun DayColumn(plan: PlanRepository, date: LocalDate) {
    val nav = LocalNav.current
    val iso = Dates.toIso(date)
    val dow = Dates.dow(date)
    val weekend = dow == 0 || dow == 6
    val holiday = plan.holiday(date)
    val classes = plan.classesFor(date)
    Column {
        Column(Modifier.fillMaxWidth().clickable { nav.go(Routes.dia(iso)) }) {
            Text(Dates.WEEK_LETTERS[(dow + 6) % 7], style = H.type.tiny)
            Text("${Dates.capitalize(Dates.DOW_LONG[dow])} ${date.dayOfMonth}", style = H.type.display3)
        }
        holiday?.let { Text("$it. Puede suspender la clase. Confirma con la universidad.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 8.dp)) }
        if (weekend) Text("Sin clases y sin trabajo.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 12.dp))
        if (!weekend && !Dates.isInTerm(date)) {
            Text(if (date.isBefore(Dates.TERM_START)) "Antes del 5 de octubre no hay clases." else "Después del 2 de febrero de 2027 no hay clases.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 12.dp))
        }
        Column(Modifier.padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            classes.forEach { ClassCard(it) { nav.go(Routes.clase(iso, it.key)) } }
        }
    }
}

@Composable
private fun ClassCard(block: ClassBlock, onOpen: () -> Unit) {
    Column(Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).clickable(onClick = onOpen).rail(hex(block.color)).padding(start = 20.dp, end = 16.dp, top = 14.dp, bottom = 14.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(block.name, style = H.type.cardTitle, modifier = Modifier.weight(1f))
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Chip(block.type, color = H.RailClass, border = H.RailClass.copy(alpha = 0.3f))
                Chip(block.modeLabel)
            }
        }
        Row(Modifier.padding(top = 12.dp)) {
            Field("Hora", "${block.start} – ${block.end}", Modifier.weight(1f))
            Field("NRC", block.nrc.ifEmpty { "Sin NRC" }, Modifier.weight(1f))
        }
        Field("Lugar", block.place, Modifier.padding(top = 6.dp))
        if (block.professor.isNotEmpty()) Field("Docente", block.professor, Modifier.padding(top = 6.dp))
    }
}

@Composable
private fun Field(label: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier) {
        Text(label.uppercase(), style = H.type.tiny)
        Text(value, style = H.type.small.copy(color = H.Cream))
    }
}
