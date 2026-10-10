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
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hierro.data.Dates
import com.hierro.data.Meal
import com.hierro.data.Progress
import com.hierro.navigation.Routes
import com.hierro.ui.AppViewModel
import com.hierro.ui.Horizon
import com.hierro.ui.LocalNav
import com.hierro.ui.SpanView
import com.hierro.ui.components.AssetImage
import com.hierro.ui.components.Chip
import com.hierro.ui.components.HCard
import com.hierro.ui.components.HCheckbox
import com.hierro.ui.components.LineButton
import com.hierro.ui.components.MonthPicker
import com.hierro.ui.components.PageIntro
import com.hierro.ui.components.PeriodBar
import com.hierro.ui.components.ProgressBar
import com.hierro.ui.components.SectionLabel
import com.hierro.ui.theme.H

@Composable
fun MealsScreen(vm: AppViewModel) {
    val nav = LocalNav.current
    val plan = vm.plan
    val n = plan.nutrition
    val p = n.profile
    val mark = H.Mark.getValue("comidas")
    val log by vm.meals.collectAsState()
    val checks by vm.shopping.collectAsState()
    var horizon by remember { mutableStateOf(Horizon.initial(vm.today())) }
    val intake = Progress.intakeFor(plan, horizon.date, log)
    val shown = if (horizon.view == SpanView.Semana) horizon.week else listOf(horizon.date)
    Page("pantalla-comidas") {
        PageIntro("Comidas", "Meta ~${p.kcal} kcal y ${p.protein} g de proteína. Estimación para ${p.weightKg} kg y ${p.heightM} m, IMC ~${p.bmi}.")
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Kcal" to "${p.kcal}", "Proteína" to "${p.protein} g", "IMC" to "~${p.bmi}").forEach { (label, value) ->
                HCard(Modifier.weight(1f)) {
                    Column(Modifier.padding(12.dp)) {
                        Text(label, style = H.type.small)
                        Text(value, style = H.type.display2.copy(color = mark), modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
        HCard(Modifier.fillMaxWidth().padding(top = 12.dp)) {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    SectionLabel("Consumido el ${Dates.DOW_LONG[Dates.dow(horizon.date)]} ${horizon.date.dayOfMonth}")
                    Text("${intake.eaten} de ${intake.planned} comidas marcadas", style = H.type.small)
                }
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column(Modifier.weight(1f)) {
                        Amount("${intake.kcal}", " / ${intake.targetKcal} kcal")
                        Box(Modifier.padding(top = 8.dp)) { ProgressBar(intake.kcal, intake.targetKcal, label = "Kcal consumidas") }
                    }
                    Column(Modifier.weight(1f)) {
                        Amount("${intake.protein}", " / ${intake.targetProtein} g proteína")
                        Box(Modifier.padding(top = 8.dp)) { ProgressBar(intake.protein, intake.targetProtein, H.RailMeal, "Proteína consumida") }
                    }
                }
            }
        }
        PeriodBar(horizon, { horizon = it }, "comidas", mark)
        if (horizon.view == SpanView.Mes) MonthPicker(horizon.date, { horizon = horizon.withDate(it) }, caption = { "plato" })
        Text("En el plato", style = H.type.display2, modifier = Modifier.padding(top = 32.dp))
        Text(
            "Estimación, no consejo médico. Lunes, jueves y viernes: pre-entreno ligero 6:15–6:30 en casa y post-entreno para llevar (tupper preparado la noche anterior) a las 9:00, antes de las clases de las 10:00. Martes, miércoles y fin de semana: desayuno 5:30–6:00. Meta ~${p.kcal} kcal y ${p.protein} g de proteína.",
            style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 4.dp),
        )
        val wide = LocalWide.current
        shown.forEach { item ->
            val dow = Dates.dow(item)
            val menu = plan.mealsFor(dow)
            val iso = Dates.toIso(item)
            Text("${Dates.capitalize(Dates.DOW_LONG[dow])} ${item.dayOfMonth} · ~${menu.total}", style = H.type.bodyStrong.copy(color = H.Cream.copy(alpha = 0.85f)), modifier = Modifier.padding(top = 16.dp, bottom = 8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                menu.items.withIndex().toList().chunked(if (wide) 2 else 1).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        row.forEach { (index, meal) ->
                            Box(Modifier.weight(1f)) {
                                MealCard(meal, (log[iso] ?: emptyList()).contains(index), { vm.toggleMeal(iso, index) }) { nav.go(Routes.comida(dow, index)) }
                            }
                        }
                        if (wide && row.size == 1) Box(Modifier.weight(1f))
                    }
                }
            }
        }
        Text("De dónde salen las 2800 kcal", style = H.type.display2, modifier = Modifier.padding(top = 32.dp))
        Text(n.kcalIntro, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 8.dp))
        Column(Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            n.points.forEachIndexed { i, point ->
                Row {
                    Text("${i + 1}", style = H.type.cardTitle.copy(color = mark), modifier = Modifier.width(28.dp))
                    Text(buildAnnotatedString { withStyle(SpanStyle(fontWeight = FontWeight.SemiBold)) { append(point.lead + " ") }; append(point.text) }, style = H.type.body)
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 32.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Compra de la semana", style = H.type.display2, modifier = Modifier.weight(1f))
            LineButton("Vaciar", vm::clearShopping)
        }
        Text("${n.shoppingNote} ${checks.count { it }} de ${n.shopping.size} marcados.", style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 4.dp))
        Column(Modifier.fillMaxWidth().padding(top = 12.dp).clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel)) {
            n.shopping.forEachIndexed { i, row ->
                val on = checks.getOrElse(i) { false }
                Row(Modifier.fillMaxWidth().heightIn(min = 56.dp).clickable { vm.toggleShopping(i) }.padding(horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    HCheckbox(on, { vm.toggleShopping(i) }, label = row.item)
                    Column(Modifier.padding(vertical = 8.dp)) {
                        Text(row.item, style = H.type.bodyStrong.copy(color = if (on) H.Muted else H.Cream, textDecoration = if (on) TextDecoration.LineThrough else null))
                        Text(row.amount, style = H.type.body.copy(color = H.Muted))
                    }
                }
                if (i < n.shopping.lastIndex) Box(Modifier.fillMaxWidth().heightIn(min = 1.dp, max = 1.dp).background(H.Line))
            }
        }
        Text(n.disclaimer, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 24.dp))
    }
}

@Composable
private fun Amount(value: String, rest: String) {
    Text(buildAnnotatedString {
        append(value)
        withStyle(SpanStyle(fontSize = 14.sp, color = H.Muted, fontWeight = FontWeight.SemiBold)) { append(rest) }
    }, style = H.type.displayNum)
}

@Composable
private fun MealCard(meal: Meal, eaten: Boolean, onEaten: () -> Unit, onOpen: () -> Unit) {
    var open by rememberSaveable { mutableStateOf(false) }
    HCard(Modifier.fillMaxWidth(), border = if (eaten) H.RailMeal.copy(alpha = 0.5f) else H.Line) {
        Box(Modifier.fillMaxWidth().aspectRatio(16f / 9f).clickable(onClick = onOpen)) {
            AssetImage(meal.photo.assetPath, Modifier.matchParentSize(), "Ver ${meal.role}")
            Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Transparent, Color.Black.copy(alpha = 0.7f)))))
            Box(Modifier.align(Alignment.TopStart).padding(12.dp)) { Chip("COMIDA", color = H.RailMeal, border = H.RailMeal.copy(alpha = 0.4f)) }
            Text(meal.time, style = H.type.small.copy(color = H.Cream, fontWeight = FontWeight.SemiBold), modifier = Modifier.align(Alignment.TopEnd).padding(12.dp).clip(H.blockShape).background(H.Ink.copy(alpha = 0.8f)).border(1.dp, H.Line, H.blockShape).padding(horizontal = 8.dp, vertical = 2.dp))
        }
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.Top) {
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(meal.role, style = H.type.bodyStrong.copy(fontWeight = FontWeight.Bold), modifier = Modifier.weight(1f, fill = false).clickable(onClick = onOpen))
                    if (Regex("para llevar", RegexOption.IGNORE_CASE).containsMatchIn(meal.role)) Chip("Para llevar", color = H.RailClass)
                }
                Text(meal.`when`, style = H.type.small, modifier = Modifier.padding(top = 2.dp))
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Chip("${meal.kcal} kcal", color = H.Accent)
                    Chip("${meal.protein} g proteína", color = H.RailMeal)
                }
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HCheckbox(eaten, onEaten, H.RailMeal, if (eaten) "Desmarcar ${meal.role}" else "Marcar ${meal.role} como comida")
                Text(if (eaten) "HECHA" else "MARCAR", style = H.type.tiny)
            }
        }
        Column(Modifier.padding(start = 12.dp, end = 12.dp, bottom = 12.dp)) {
            Row(
                Modifier.fillMaxWidth().clip(H.chipShape).border(1.dp, H.Line, H.chipShape).clickable { open = !open }.padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(if (open) "Ocultar receta" else "Ingredientes y pasos", style = H.type.small.copy(color = H.Cream.copy(alpha = 0.85f), fontWeight = FontWeight.SemiBold))
                Text(if (open) "▴" else "▾", style = H.type.small)
            }
            if (open) RecipeDetail(meal)
        }
    }
}

@Composable
fun RecipeDetail(meal: Meal) {
    Column(Modifier.padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Column {
            Text("INGREDIENTES", style = H.type.caption.copy(color = H.Accent, fontWeight = FontWeight.Bold))
            meal.ingredients.forEach { Text("•  $it", style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f))) }
        }
        Column {
            Text("PASOS", style = H.type.caption.copy(color = H.Accent, fontWeight = FontWeight.Bold))
            meal.steps.forEachIndexed { i, s -> Text("${i + 1}.  $s", style = H.type.body.copy(color = H.Cream.copy(alpha = 0.85f))) }
        }
    }
}
