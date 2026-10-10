package com.hierro.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.hierro.data.Agenda
import com.hierro.data.Dates
import com.hierro.data.GOALS
import com.hierro.data.Kind
import com.hierro.data.Profile
import com.hierro.data.Time
import com.hierro.notify.Reminders
import com.hierro.ui.AppViewModel
import com.hierro.ui.LocalNav
import com.hierro.ui.components.AccentButton
import com.hierro.ui.components.GoToDay
import com.hierro.ui.components.LineButton
import com.hierro.ui.components.ProgressBar
import com.hierro.ui.components.SectionLabel
import com.hierro.ui.components.ToggleChip
import com.hierro.ui.components.rail
import com.hierro.ui.theme.H
import java.time.LocalDateTime

@Composable
private fun Field(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier, number: Boolean = false, placeholder: String = "") {
    Column(modifier) {
        SectionLabel(label, Modifier.padding(bottom = 4.dp))
        OutlinedTextField(
            value, onChange, Modifier.fillMaxWidth(), singleLine = true, textStyle = H.type.body,
            placeholder = { Text(placeholder, style = H.type.body.copy(color = H.Muted)) },
            keyboardOptions = if (number) KeyboardOptions(keyboardType = KeyboardType.Decimal) else KeyboardOptions.Default,
            shape = H.rowShape,
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = H.Accent, unfocusedBorderColor = H.Line, focusedContainerColor = H.Panel, unfocusedContainerColor = H.Panel, cursorColor = H.Accent),
        )
    }
}

/** Nuevo evento propio (NewEventDialog). */
@Composable
fun NewEventScreen(vm: AppViewModel, iso: String) {
    val nav = LocalNav.current
    var title by rememberSaveable { mutableStateOf("") }
    var date by remember { mutableStateOf(runCatching { Dates.clampToRange(Dates.parseIso(iso)) }.getOrDefault(Dates.TERM_START)) }
    var start by rememberSaveable { mutableStateOf("18:00") }
    var end by rememberSaveable { mutableStateOf("19:00") }
    var kind by rememberSaveable { mutableStateOf("gym") }
    var error by rememberSaveable { mutableStateOf("") }
    Detail("pantalla-evento") {
        Text("Nuevo evento", style = H.type.display2)
        Field("Nombre", title, { title = it }, placeholder = "Ej. Reunión de proyecto")
        SectionLabel("Fecha")
        GoToDay(date, { date = it })
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Field("Inicio", start, { start = it }, Modifier.weight(1f))
            Field("Fin", end, { end = it }, Modifier.weight(1f))
        }
        SectionLabel("Categoría (se filtra con ella)")
        ChipRow { Kind.entries.forEach { k -> ToggleChip(k.card, kind == k.id, { kind = k.id }, dot = k.rail()) } }
        if (error.isNotEmpty()) Text(error, style = H.type.small.copy(color = H.Danger))
        AccentButton("Guardar evento", {
            val normalized = listOf(start, end).map { runCatching { Time.formatClock(Time.parseClock(it)) }.getOrDefault(it) }
            val result = vm.addEvent(title, Dates.toIso(date), normalized[0], normalized[1], kind)
            if (result == null) nav.back() else error = result
        }, Modifier.fillMaxWidth())
    }
}

/** Lo que queda hoy, más los recordatorios locales. */
@Composable
fun NoticesScreen(vm: AppViewModel) {
    val context = LocalContext.current
    val events by vm.events.collectAsState()
    val reminders by vm.reminders.collectAsState()
    val now = remember { LocalDateTime.of(vm.today(), java.time.LocalTime.now()) }
    val items = Agenda.upcomingToday(vm.plan, now, events)
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        vm.setReminders(granted)
        if (granted) Reminders.enable(context) else Reminders.disable(context)
    }
    Detail("pantalla-avisos") {
        Text("Lo que queda hoy", style = H.type.display2)
        Text(Dates.capitalize(Dates.formatLong(now.toLocalDate())), style = H.type.small)
        if (items.isEmpty()) Text("No quedan bloques para hoy.", style = H.type.body.copy(color = H.Muted))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items.forEach { item ->
                Row(
                    Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).rail(item.kind.rail()).padding(start = 16.dp, end = 12.dp, top = 10.dp, bottom = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        SectionLabel(item.kind.card)
                        Text(item.label, style = H.type.bodyStrong, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    Text(Time.formatClock(item.start), style = H.type.small.copy(color = H.Accent))
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 12.dp).clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Recordatorios", style = H.type.bodyStrong)
                Text("Aviso 10 minutos antes de cada bloque y evento propio del día.", style = H.type.small)
            }
            Switch(
                checked = reminders,
                onCheckedChange = { on ->
                    if (!on) { vm.setReminders(false); Reminders.disable(context) }
                    else if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    else { vm.setReminders(true); Reminders.enable(context) }
                },
                colors = SwitchDefaults.colors(checkedTrackColor = H.Accent, checkedThumbColor = H.Ink),
            )
        }
    }
}

/** Perfil, avance de la semana y créditos (cajón y barra lateral de la web). */
@Composable
fun ProfileScreen(vm: AppViewModel) {
    Detail("pantalla-perfil") {
        Text("Perfil", style = H.type.display2)
        ProfilePanel(vm)
        WeekStatsPanel(vm)
        Credits(vm)
    }
}

@Composable
fun ProfilePanel(vm: AppViewModel) {
    val profile by vm.profile.collectAsState()
    var editing by rememberSaveable { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(12.dp)) {
        if (editing) {
            var name by rememberSaveable { mutableStateOf(profile.name) }
            var height by rememberSaveable { mutableStateOf(profile.heightM.toString()) }
            var weight by rememberSaveable { mutableStateOf(profile.weightKg.toString()) }
            var goal by rememberSaveable { mutableStateOf(profile.goal) }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Field("Nombre", name, { name = it })
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Field("Altura (m)", height, { height = it }, Modifier.weight(1f), number = true)
                    Field("Peso (kg)", weight, { weight = it }, Modifier.weight(1f), number = true)
                }
                SectionLabel("Objetivo")
                ChipRow { GOALS.forEach { g -> ToggleChip(g, goal == g, { goal = g }) } }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AccentButton("Guardar", {
                        val ok = vm.saveProfile(Profile(name, height.replace(',', '.').toDoubleOrNull() ?: 0.0, weight.replace(',', '.').toDoubleOrNull() ?: 0.0, goal))
                        if (ok) editing = false
                    }, Modifier.weight(1f))
                    LineButton("Cancelar", { editing = false }, Modifier.weight(1f))
                }
            }
        } else {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(Modifier.size(40.dp).clip(CircleShape).border(1.dp, H.Accent.copy(alpha = 0.4f), CircleShape).background(H.Panel2), contentAlignment = Alignment.Center) {
                    Text(profile.initials.ifEmpty { "H" }, style = H.type.cardTitle.copy(color = H.Accent))
                }
                Column(Modifier.weight(1f)) {
                    Text(profile.name, style = H.type.bodyStrong, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(profile.goal, style = H.type.small)
                }
                Text("Editar", style = H.type.small.copy(color = H.Accent), modifier = Modifier.clip(H.rowShape).clickable { editing = true }.padding(horizontal = 8.dp, vertical = 4.dp))
            }
            Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Altura" to "%.2f m".format(profile.heightM), "Peso" to "${trim(profile.weightKg)} kg", "IMC" to "%.1f".format(profile.bmi)).forEach { (l, v) ->
                    Column(Modifier.weight(1f).clip(H.rowShape).background(H.Panel2).padding(vertical = 6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(l.uppercase(), style = H.type.tiny)
                        Text(v, style = H.type.small.copy(color = H.Cream))
                    }
                }
            }
        }
    }
}

private fun trim(v: Double) = if (v % 1.0 == 0.0) v.toInt().toString() else v.toString()

@Composable
fun WeekStatsPanel(vm: AppViewModel) {
    val stats by vm.weekStats.collectAsState()
    Column(Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel).padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            SectionLabel("Semana ${Dates.isoWeek(vm.today())}")
            Text("${stats.days} días", style = H.type.small)
        }
        Column {
            Row(Modifier.fillMaxWidth().padding(bottom = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text("Carga de entreno", style = H.type.small.copy(color = H.Cream)); Text("${stats.load}%", style = H.type.small.copy(color = H.Accent)) }
            ProgressBar(stats.load, 100, label = "Carga de entreno")
        }
        Column {
            Row(Modifier.fillMaxWidth().padding(bottom = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) { Text("Comidas hechas", style = H.type.small.copy(color = H.Cream)); Text("${stats.meals}%", style = H.type.small.copy(color = H.RailMeal)) }
            ProgressBar(stats.meals, 100, H.RailMeal, "Comidas hechas")
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Cumplimiento", style = H.type.small)
            Text("${stats.compliance}%", style = H.type.small.copy(color = H.Cream))
        }
        Text("${stats.sessionsDone} entrenos completos y ${stats.mealsEaten} de ${stats.mealsPlanned} comidas marcadas hasta hoy.", style = H.type.tiny)
    }
}

@Composable
private fun Credits(vm: AppViewModel) {
    var open by rememberSaveable { mutableStateOf(false) }
    val photos = (vm.plan.sessions.values.flatMap { s -> s.exercises.mapNotNull { it.photo } } + (0..6).flatMap { vm.plan.mealsFor(it).items.map { m -> m.photo } }).distinctBy { it.file }
    Column(Modifier.fillMaxWidth().clip(H.cardShape).border(1.dp, H.Line, H.cardShape).background(H.Panel)) {
        Row(Modifier.fillMaxWidth().clickable { open = !open }.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Créditos de las fotos (${photos.size})", style = H.type.bodyStrong)
            Text(if (open) "▴" else "▾", style = H.type.body.copy(color = H.Muted))
        }
        if (open) Column(Modifier.padding(start = 12.dp, end = 12.dp, bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            photos.forEach { Text("${it.alt} — ${it.credit}. ${it.source}", style = H.type.tiny) }
            Text("Tipografías Syne y Manrope, SIL Open Font License. Coach 3D y equipo: ver CREDITS.md del repositorio.", style = H.type.tiny)
        }
    }
}
