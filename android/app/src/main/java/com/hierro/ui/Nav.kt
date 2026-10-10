package com.hierro.ui

import androidx.compose.runtime.staticCompositionLocalOf
import com.hierro.data.DayPlan
import com.hierro.data.Dates
import com.hierro.data.TimelineItem
import com.hierro.navigation.Routes

/** Navegación que usan las pantallas (equivale a useModals() y NavLink en la web). */
interface Navigator {
    fun go(route: String)
    fun tab(route: String)
    fun back()
}

val LocalNav = staticCompositionLocalOf<Navigator> { error("Sin navegador") }

/** openItem() de WeekGrid.tsx. */
fun Navigator.openItem(plan: DayPlan, item: TimelineItem) = when (item) {
    is TimelineItem.ClassItem -> go(Routes.clase(plan.iso, item.block.key))
    is TimelineItem.WorkItem -> go(Routes.trabajo(plan.iso, item.start))
    is TimelineItem.GymItem -> go(Routes.gym(plan.iso))
    is TimelineItem.MealItem -> go(Routes.comida(Dates.dow(plan.date), item.index))
}
