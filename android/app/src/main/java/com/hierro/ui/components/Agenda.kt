package com.hierro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hierro.data.Agenda
import com.hierro.data.CustomEvent
import com.hierro.data.Dates
import com.hierro.data.Kind
import com.hierro.data.PlanRepository
import com.hierro.data.Time
import com.hierro.data.TimelineItem
import com.hierro.ui.LocalNav
import com.hierro.ui.openItem
import com.hierro.ui.theme.H
import java.time.LocalDate

private fun thumbOf(item: TimelineItem) = (item as? TimelineItem.MealItem)?.meal?.photo

/** Agenda del día con eventos propios (DayAgenda). */
@Composable
fun DayAgenda(plan: PlanRepository, day: LocalDate, kinds: Set<Kind>, events: List<CustomEvent>, onRemove: (String) -> Unit) {
    val nav = LocalNav.current
    val dayPlan = plan.day(day)
    val items = (dayPlan?.items ?: emptyList()).filter { it.kind in kinds }.sortedWith(compareBy({ it.start }, { it.end }))
    val custom = Agenda.eventsFor(events, Dates.toIso(day)).filter { Kind.of(it.kind) in kinds }
    val entries: List<Pair<Int, Any>> = (items.map { it.start to it as Any } + custom.mapNotNull { e -> Time.parseClockOrNull(e.start)?.let { it to e as Any } }).sortedBy { it.first }
    Column(Modifier.fillMaxWidth()) {
        dayPlan?.holiday?.let { Text(it, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(bottom = 8.dp)) }
        if (entries.isEmpty()) {
            Text("Nada con estos filtros.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel).padding(12.dp))
            return@Column
        }
        val first = entries.first().second
        Row(
            Modifier.fillMaxWidth().padding(bottom = 12.dp).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel2).padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                SectionLabel("Primer bloque")
                Text(if (first is TimelineItem) Agenda.agendaStart(first) else (first as CustomEvent).start, style = H.type.displayNum.copy(fontSize = 36.sp, lineHeight = 38.sp))
            }
            Column(horizontalAlignment = Alignment.End, modifier = Modifier.weight(1f).padding(start = 12.dp)) {
                Text("${entries.size} ${if (entries.size == 1) "bloque" else "bloques"}", style = H.type.small)
                Text(if (first is TimelineItem) Agenda.agendaLabel(first) else (first as CustomEvent).title, style = H.type.small.copy(color = H.Cream.copy(alpha = 0.85f)), maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            entries.forEach { (_, entry) ->
                if (entry is CustomEvent) {
                    val kind = Kind.of(entry.kind)
                    RailCard(kind, null, dashed = true) {
                        Column(Modifier.weight(1f)) {
                            Text("${kind.card} · propio".uppercase(), style = H.type.caption.copy(color = kind.rail()))
                            Text(entry.title, style = H.type.cardTitle)
                            Text("Eliminar", style = H.type.small.copy(textDecoration = TextDecoration.Underline), modifier = Modifier.padding(top = 4.dp).clickable { onRemove(entry.id) })
                        }
                        TimeTag("${entry.start} – ${entry.end}", kind.rail())
                    }
                } else {
                    val item = entry as TimelineItem
                    val clash = item is TimelineItem.GymItem && dayPlan!!.gymConflicts.isNotEmpty()
                    RailCard(item.kind, { nav.openItem(dayPlan!!, item) }, alarm = clash) {
                        Column(Modifier.weight(1f)) {
                            Text(item.kind.card.uppercase(), style = H.type.caption.copy(color = item.kind.rail()))
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                thumbOf(item)?.let { Thumb(it, 20.dp) }
                                Text(Agenda.agendaLabel(item), style = H.type.cardTitle)
                            }
                            Text(item.kind.title, style = H.type.small)
                            if (clash) {
                                Text(
                                    "Aviso: Choca con ${dayPlan!!.gymConflicts.joinToString(", ")}",
                                    style = H.type.tiny.copy(color = H.Amber, fontSize = 11.sp),
                                    modifier = Modifier.padding(top = 4.dp).clip(H.chipShape).background(androidx.compose.ui.graphics.Color(0x26EF4444)).border(1.dp, H.Amber.copy(alpha = 0.4f), H.chipShape).padding(horizontal = 8.dp, vertical = 2.dp),
                                )
                            }
                        }
                        TimeTag(Agenda.agendaWhen(item), item.kind.rail())
                    }
                }
            }
        }
    }
}

/** Lista por día para la vista Semana en teléfono y bajo el mes (WeekAgenda). */
@Composable
fun WeekAgenda(plan: PlanRepository, days: List<LocalDate>, kinds: Set<Kind>, selected: LocalDate, onSelect: (LocalDate) -> Unit) {
    val nav = LocalNav.current
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        days.filter(Dates::isInRange).forEach { date ->
            val dayPlan = plan.day(date)!!
            val items = dayPlan.items.filter { it.kind in kinds }
            val active = date == selected
            Column(Modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Grid, H.rowShape).background(if (active) H.Wash else H.Ink)) {
                Row(Modifier.fillMaxWidth().clickable { onSelect(date) }.padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(Dates.formatLong(date), style = H.type.bodyStrong.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium))
                    Text(Dates.WEEK_LETTERS[(Dates.dow(date) + 6) % 7], style = H.type.tiny)
                }
                dayPlan.holiday?.let { Text(it, style = H.type.small, modifier = Modifier.padding(start = 12.dp, end = 12.dp, bottom = 8.dp)) }
                if (items.isEmpty()) Text("Nada con estos filtros.", style = H.type.small, modifier = Modifier.padding(start = 12.dp, bottom = 12.dp))
                Column(Modifier.padding(start = 8.dp, end = 8.dp, bottom = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    items.forEach { item ->
                        Row(
                            Modifier.fillMaxWidth().clip(H.blockShape).background(item.kind.block()).clickable { nav.openItem(dayPlan, item) }.rail(item.kind.rail()).padding(horizontal = 8.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            thumbOf(item)?.let { Thumb(it, 16.dp) }
                            Text(Agenda.gridLabel(item), style = H.type.bodyStrong.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium), maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
                            Text(Agenda.meta(item), style = H.type.small.copy(color = H.Cream.copy(alpha = 0.8f)))
                        }
                    }
                }
            }
        }
    }
}

private const val START_HOUR = 5
private const val END_HOUR = 25
private val HOUR = 52.dp

/** Reparte bloques que se pisan en carriles (placeLanes). */
fun placeLanes(items: List<TimelineItem>): Pair<List<Pair<TimelineItem, Int>>, Int> {
    val sorted = items.sortedWith(compareBy({ it.start }, { it.end }))
    val ends = mutableListOf<Int>()
    val placed = sorted.map { item ->
        var lane = ends.indexOfFirst { it <= item.start + 1 }
        if (lane < 0) { lane = ends.size; ends += item.end } else ends[lane] = item.end
        item to lane
    }
    return placed to maxOf(1, ends.size)
}

/** Grilla semanal de escritorio y tableta (WeekGrid). */
@Composable
fun WeekGrid(plan: PlanRepository, days: List<LocalDate>, kinds: Set<Kind>, selected: LocalDate, today: LocalDate, onSelect: (LocalDate) -> Unit) {
    val nav = LocalNav.current
    val hours = (START_HOUR until END_HOUR).toList()
    Column(Modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Grid, H.rowShape).background(H.Ink)) {
        Row(Modifier.fillMaxWidth().drawBehind { drawLine(H.Grid, Offset(0f, size.height), Offset(size.width, size.height), 1f) }) {
            Box(Modifier.width(40.dp))
            days.forEach { date ->
                val inside = Dates.isInRange(date)
                val active = date == selected
                Column(
                    Modifier.weight(1f).background(if (active) H.Wash else H.Ink).clickable(enabled = inside) { onSelect(date) }.padding(vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(Dates.WEEK_LETTERS[(Dates.dow(date) + 6) % 7], style = H.type.tiny)
                    Box(
                        Modifier.padding(top = 4.dp).size(28.dp).clip(CircleShape).background(if (active) H.Cream else androidx.compose.ui.graphics.Color.Transparent)
                            .then(if (!active && date == today) Modifier.border(1.dp, H.Cream, CircleShape) else Modifier),
                        contentAlignment = Alignment.Center,
                    ) { Text("${date.dayOfMonth}", style = H.type.cardTitle.copy(color = if (active) H.Ink else H.Cream.copy(alpha = if (inside) 0.8f else 0.35f))) }
                }
            }
        }
        Row(Modifier.fillMaxWidth().height(HOUR * hours.size)) {
            Box(Modifier.width(40.dp).height(HOUR * hours.size)) {
                hours.forEach { h -> Text(Time.formatClock((h % 24) * 60), style = H.type.tiny.copy(fontSize = 9.sp), textAlign = TextAlign.End, modifier = Modifier.width(36.dp).offset(y = HOUR * (h - START_HOUR) + 4.dp)) }
            }
            days.forEach { date ->
                val dayPlan = if (Dates.isInRange(date)) plan.day(date) else null
                val (placed, lanes) = placeLanes(dayPlan?.items?.filter { it.kind in kinds } ?: emptyList())
                BoxWithConstraints(
                    Modifier.weight(1f).height(HOUR * hours.size).background(if (date == selected) H.Wash else H.Ink).drawBehind {
                        drawLine(H.Grid, Offset(0f, 0f), Offset(0f, size.height), 1f)
                        val step = HOUR.toPx()
                        var y = step
                        while (y < size.height) { drawLine(H.Grid.copy(alpha = 0.6f), Offset(0f, y), Offset(size.width, y), 1f); y += step }
                    },
                ) {
                    val laneW = maxWidth / lanes
                    placed.forEach { (item, lane) ->
                        val top = HOUR * ((item.start - START_HOUR * 60) / 60f)
                        val h = maxOf(16.dp, HOUR * ((item.end - item.start) / 60f) - 2.dp)
                        Column(
                            Modifier.offset(x = laneW * lane + 1.dp, y = top + 1.dp).width(laneW - 3.dp).height(h).clip(H.blockShape).background(item.kind.block())
                                .clickable { nav.openItem(dayPlan!!, item) }.rail(item.kind.rail()).padding(start = 6.dp, end = 4.dp, top = 2.dp),
                        ) {
                            Text(Agenda.gridLabel(item), style = H.type.tiny.copy(color = H.Cream, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            if (h >= 32.dp) Text(Agenda.meta(item), style = H.type.tiny.copy(color = H.Cream.copy(alpha = 0.8f), fontSize = 9.sp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun Legend(plan: PlanRepository) {
    val names = plan.courses.short.values.toList()
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        names.chunked(2).forEach { pair ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                pair.forEach { Text(it, style = H.type.small.copy(color = H.Cream.copy(alpha = 0.85f)), maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f)) }
                if (pair.size == 1) Box(Modifier.weight(1f))
            }
        }
    }
}

/** Sección plegable "Materias". */
@Composable
fun Collapsible(title: String, content: @Composable () -> Unit) {
    var open by androidx.compose.runtime.saveable.rememberSaveable { androidx.compose.runtime.mutableStateOf(false) }
    HCard(Modifier.fillMaxWidth().padding(top = 16.dp)) {
        Row(Modifier.fillMaxWidth().clickable { open = !open }.padding(horizontal = 16.dp).height(44.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Text(title, style = H.type.bodyStrong)
            Text(if (open) "▴" else "▾", style = H.type.body.copy(color = H.Muted))
        }
        if (open) Box(Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp)) { content() }
    }
}
