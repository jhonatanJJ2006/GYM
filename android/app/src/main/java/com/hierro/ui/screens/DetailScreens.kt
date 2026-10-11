package com.hierro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hierro.coach.Coach3D
import com.hierro.coach.CoachThumb
import com.hierro.data.Dates
import com.hierro.data.Session
import com.hierro.data.Time
import com.hierro.data.TimelineItem
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.LocalNav
import com.hierro.ui.components.AssetImage
import com.hierro.ui.components.CompactRow
import com.hierro.ui.components.DetailHeader
import com.hierro.ui.components.Labeled
import com.hierro.ui.components.Note
import com.hierro.ui.components.PhotoHero
import com.hierro.ui.components.Thumb
import com.hierro.ui.theme.H

/** Hoja de detalle: equivale a ModalShell de la web (cierre arriba a la derecha). */
@Composable
fun Detail(tag: String, hero: (@Composable () -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    val nav = LocalNav.current
    Box(Modifier.fillMaxSize().background(H.Ink).testTag(tag)) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
            hero?.invoke()
            Column(Modifier.padding(start = 20.dp, end = 20.dp, top = if (hero == null) 56.dp else 16.dp, bottom = 32.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
        }
        Box(
            Modifier.align(Alignment.TopEnd).padding(12.dp).size(36.dp).clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel).clickable { nav.back() }.semantics { contentDescription = "Cerrar" },
            contentAlignment = Alignment.Center,
        ) { Text("×", style = H.type.display3) }
    }
}

private fun holidayNote(name: String?) = name?.let { "$it. La malla semanal igual aparece; confirma con la universidad si ese feriado suspende la clase." }

@Composable
fun Missing(text: String) = Detail("detalle-vacio") { Text(text, style = H.type.body.copy(color = H.Muted)) }

@Composable
fun DayDetail(vm: AppViewModel, iso: String) {
    val nav = LocalNav.current
    val plan = runCatching { vm.plan.day(Dates.parseIso(iso)) }.getOrNull() ?: return Missing("Ese día está fuera del rango.")
    Detail("detalle-dia") {
        DetailHeader(Dates.capitalize(Dates.formatLong(plan.date)))
        Text("Semana ${plan.cycleWeek} de 4 · ${plan.session.title} · ${plan.session.time}", style = H.type.body.copy(color = H.Muted))
        holidayNote(plan.holiday)?.let { Note(it, strong = true) }
        plan.banners.forEach { Note(it) }
        CompactRow(plan.session.title, plan.session.time, { nav.go(Routes.gym(iso)) }) { CoachThumb(plan.session.exercises.first().pose) }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            plan.classes.forEach { b -> CompactRow(b.name, b.start, { nav.go(Routes.clase(iso, b.key)) }) }
            val works = plan.items.filterIsInstance<TimelineItem.WorkItem>()
            works.forEachIndexed { i, w -> CompactRow("Trabajo ${i + 1} de ${works.size}", Time.formatSpan(com.hierro.data.Interval(w.start, w.end)), { nav.go(Routes.trabajo(iso, w.start)) }) }
            plan.meals.items.forEachIndexed { i, m -> CompactRow(m.role, m.`when`, { nav.go(Routes.comida(Dates.dow(plan.date), i)) }) { Thumb(m.photo) } }
        }
    }
}

@Composable
fun ClassDetail(vm: AppViewModel, iso: String, key: String) {
    val date = runCatching { Dates.parseIso(iso) }.getOrNull()
    val block = date?.let { vm.plan.day(it)?.classes?.firstOrNull { c -> c.key == key } } ?: return Missing("Esa clase no está en el día.")
    val description = if (block.modeLabel == "Sin salón") block.type else "${block.modeLabel} · ${block.type}"
    Detail("detalle-clase") {
        DetailHeader(block.name)
        Column {
            Labeled("Horario", "${block.start}–${block.end}")
            Labeled("Descripción", description)
            Labeled("Aula", block.place)
            Labeled("Profesor", block.professor.ifEmpty { "Sin profesor en la malla" })
            if (block.nrc.isNotEmpty()) Labeled("NRC", block.nrc)
        }
        holidayNote(vm.plan.holiday(date))?.let { Note(it, strong = true) }
    }
}

@Composable
fun WorkDetail(vm: AppViewModel, iso: String, start: Int) {
    val plan = runCatching { vm.plan.day(Dates.parseIso(iso)) }.getOrNull()
    val index = plan?.work?.indexOfFirst { it.start == start } ?: -1
    if (plan == null || index < 0) return Missing("Bloque de trabajo. Ese bloque no está en el día.")
    val block = plan.work[index]
    Detail("detalle-trabajo") {
        DetailHeader("Bloque de trabajo")
        Text(Time.formatSpan(block), style = H.type.body.copy(color = H.Muted))
        Text("Bloque ${index + 1} de ${plan.work.size} · ${Time.formatDuration(block.end - block.start)}.", style = H.type.body)
        Note("Hueco libre entre semana: no coincide con una clase ni con el gym. El día suma ${Time.formatDuration(plan.workMinutes)} de trabajo, dentro de las 5 a 6 horas.")
    }
}

private fun heroPose(session: Session) = (session.exercises.firstOrNull { it.name != "Calentamiento" } ?: session.exercises.first()).pose

@Composable
fun SessionDetail(vm: AppViewModel, session: Session, iso: String?) {
    val nav = LocalNav.current
    Detail("detalle-sesion", hero = { Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f)) { Coach3D(heroPose(session), label = session.title) } }) {
        DetailHeader(session.title)
        Text("${session.time} · ${session.minutesLabel}", style = H.type.body.copy(color = H.Muted))
        Text(session.note, style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f)))
        iso?.let { holidayNote(vm.plan.holiday(Dates.parseIso(it)))?.let { n -> Note(n, strong = true) } }
        if (iso != null) com.hierro.ui.components.AccentButton("Iniciar entreno guiado", { nav.go(Routes.guiado(iso)) }, Modifier.fillMaxWidth())
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            session.exercises.forEachIndexed { i, e -> CompactRow(e.name, e.reps, { nav.go(Routes.ejercicio(session.id, i)) }) { CoachThumb(e.pose) } }
        }
    }
}

@Composable
fun GymDetail(vm: AppViewModel, iso: String) {
    val date = runCatching { Dates.parseIso(iso) }.getOrNull() ?: return Missing("Fecha inválida.")
    SessionDetail(vm, vm.plan.sessionFor(date), iso)
}

@Composable
fun MealDetail(vm: AppViewModel, dow: Int, index: Int) {
    val meal = runCatching { vm.plan.mealsFor(dow).items[index] }.getOrNull() ?: return Missing("Comida. Esa comida no está en el día.")
    Detail("detalle-comida", hero = { PhotoHero(meal.photo, "${meal.role}. ${meal.photo.alt}") }) {
        DetailHeader(meal.role)
        Text(meal.`when`, style = H.type.pageTitle.copy(color = H.Accent))
        Text("~${meal.kcal} kcal · ~${meal.protein} g de proteína", style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f)))
        Text("Ingredientes", style = H.type.bodyStrong)
        meal.ingredients.forEach { Text(it, style = H.type.body) }
        Text("Paso a paso", style = H.type.bodyStrong, modifier = Modifier.padding(top = 8.dp))
        meal.steps.forEachIndexed { i, s ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("${i + 1}", style = H.type.cardTitle)
                Text(s, style = H.type.body)
            }
        }
        Text("Foto: ${meal.photo.credit}. ${meal.photo.source}", style = H.type.tiny)
    }
}

@Composable
fun ExerciseDetail(vm: AppViewModel, sessionId: String, index: Int) {
    val exercise = runCatching { vm.plan.session(sessionId).exercises[index] }.getOrNull() ?: return Missing("Ejercicio. Ese ejercicio no está en la rutina.")
    val profile = vm.plan.nutrition.profile
    Detail("detalle-ejercicio", hero = {
        Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f)) {
            Coach3D(exercise.pose, label = exercise.name)
            exercise.photo?.let {
                AssetImage(it.assetPath, Modifier.align(Alignment.BottomEnd).padding(8.dp).size(64.dp).clip(H.rowShape).border(1.dp, H.Line, H.rowShape), "Foto de referencia: ${it.alt}", maxPx = 200)
            }
        }
    }) {
        DetailHeader(exercise.name)
        Text(exercise.how, style = H.type.body.copy(color = H.Cream.copy(alpha = 0.9f)))
        Column(Modifier.fillMaxWidth().clip(H.rowShape).background(H.Panel).padding(12.dp)) {
            Text("Repeticiones", style = H.type.body.copy(color = H.Muted))
            Text(exercise.reps, style = H.type.bodyStrong, modifier = Modifier.padding(top = 4.dp))
        }
        Column(Modifier.fillMaxWidth().clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel2).padding(12.dp)) {
            Text(if (exercise.weightSuggested) "Peso sugerido" else "Peso", style = H.type.body.copy(color = H.Muted))
            Text(exercise.weight, style = H.type.bodyStrong, modifier = Modifier.padding(top = 4.dp))
            Text(
                if (exercise.weightSuggested) "Punto de partida para arrancar con ${profile.weightKg} kg. No es un peso medido." else "Sin número inventado: este movimiento va con el peso del cuerpo.",
                style = H.type.small.copy(color = H.Cream, fontSize = 12.sp), modifier = Modifier.padding(top = 8.dp),
            )
        }
        if (exercise.blurb.isNotEmpty()) Text(exercise.blurb, style = H.type.small)
        exercise.photo?.let { Text("Foto de referencia: ${it.credit}. ${it.source}", style = H.type.tiny) }
    }
}
