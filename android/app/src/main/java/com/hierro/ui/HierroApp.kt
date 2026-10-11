package com.hierro.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ViewList
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.hierro.data.Agenda
import com.hierro.navigation.Routes
import com.hierro.ui.screens.CalendarScreen
import com.hierro.ui.screens.ClassDetail
import com.hierro.ui.screens.ClassesScreen
import com.hierro.ui.screens.DayDetail
import com.hierro.ui.screens.ExerciseDetail
import com.hierro.ui.screens.GuidedScreen
import com.hierro.ui.screens.GymDetail
import com.hierro.ui.screens.LocalWide
import com.hierro.ui.screens.MealDetail
import com.hierro.ui.screens.MealsScreen
import com.hierro.ui.screens.Missing
import com.hierro.ui.screens.NewEventScreen
import com.hierro.ui.screens.NoticesScreen
import com.hierro.ui.screens.ProfilePanel
import com.hierro.ui.screens.ProfileScreen
import com.hierro.ui.screens.SessionDetail
import com.hierro.ui.screens.TrainingScreen
import com.hierro.ui.screens.WeekScreen
import com.hierro.ui.screens.WeekStatsPanel
import com.hierro.ui.theme.H
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.LocalTime

private val TAB_ICONS: Map<String, ImageVector> = mapOf(
    Routes.CALENDARIO to Icons.Filled.CalendarMonth,
    Routes.CLASES to Icons.Filled.School,
    Routes.SEMANA to Icons.AutoMirrored.Filled.ViewList,
    Routes.ENTRENO to Icons.Filled.FitnessCenter,
    Routes.COMIDAS to Icons.Filled.Restaurant,
)

class NavControllerNavigator(private val nav: NavHostController) : Navigator {
    override fun go(route: String) = nav.navigate(route) { launchSingleTop = true }
    override fun tab(route: String) = nav.navigate(route) {
        popUpTo(Routes.CALENDARIO) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
    override fun back() { if (!nav.popBackStack()) nav.navigate(Routes.CALENDARIO) }
}

/** Grafo de navegación con todas las rutas. */
@Composable
fun HierroNavHost(nav: NavHostController, vm: AppViewModel, modifier: Modifier = Modifier, startRoute: String = Routes.CALENDARIO) {
    NavHost(nav, startDestination = Routes.CALENDARIO, modifier = modifier) {
        composable(Routes.CALENDARIO) { CalendarScreen(vm) }
        composable(Routes.CLASES) { ClassesScreen(vm) }
        composable(Routes.SEMANA) { WeekScreen(vm) }
        composable(Routes.ENTRENO) { TrainingScreen(vm) }
        composable(Routes.COMIDAS) { MealsScreen(vm) }
        composable(Routes.DIA) { DayDetail(vm, it.arguments?.getString("iso").orEmpty()) }
        composable(Routes.CLASE) { ClassDetail(vm, it.arguments?.getString("iso").orEmpty(), android.net.Uri.decode(it.arguments?.getString("key").orEmpty())) }
        composable(Routes.TRABAJO, listOf(navArgument("start") { type = NavType.IntType })) { TrabajoArgs(vm, it.arguments?.getString("iso").orEmpty(), it.arguments?.getInt("start") ?: -1) }
        composable(Routes.GYM) { GymDetail(vm, it.arguments?.getString("iso").orEmpty()) }
        composable(Routes.SESION) { entry ->
            val session = vm.plan.sessions[entry.arguments?.getString("id")]
            if (session == null) Missing("Esa sesión no existe.") else SessionDetail(vm, session, null)
        }
        composable(Routes.COMIDA, listOf(navArgument("dow") { type = NavType.IntType }, navArgument("index") { type = NavType.IntType })) {
            MealDetail(vm, it.arguments?.getInt("dow") ?: 0, it.arguments?.getInt("index") ?: 0)
        }
        composable(Routes.EJERCICIO, listOf(navArgument("index") { type = NavType.IntType })) {
            ExerciseDetail(vm, it.arguments?.getString("sessionId").orEmpty(), it.arguments?.getInt("index") ?: 0)
        }
        composable(Routes.GUIADO) { GuidedScreen(vm, it.arguments?.getString("iso").orEmpty()) }
        composable(Routes.EVENTO) { NewEventScreen(vm, it.arguments?.getString("iso").orEmpty()) }
        composable(Routes.AVISOS) { NoticesScreen(vm) }
        composable(Routes.PERFIL) { ProfileScreen(vm) }
    }
    // Se navega después de fijar el grafo (la barra lateral usa subcomposición).
    LaunchedEffect(startRoute) { if (startRoute != Routes.CALENDARIO) nav.navigate(startRoute) }
}

@Composable
private fun TrabajoArgs(vm: AppViewModel, iso: String, start: Int) = com.hierro.ui.screens.WorkDetail(vm, iso, start)

/** Contenedor: encabezado HIERRO, barra inferior en teléfono y barra lateral en tableta. */
@Composable
fun HierroApp(vm: AppViewModel, startRoute: String = Routes.CALENDARIO) {
    val nav = rememberNavController()
    val navigator = remember(nav) { NavControllerNavigator(nav) }
    val entry by nav.currentBackStackEntryAsState()
    val route = entry?.destination?.route
    val drawer = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val events by vm.events.collectAsState()
    val pending = Agenda.upcomingToday(vm.plan, LocalDateTime.of(vm.today(), LocalTime.now()), events).size
    val page = Routes.pageOf(route)
    val mark = H.Mark.getValue(page)
    BoxWithConstraints(Modifier.fillMaxSize().background(H.Ink)) {
        val wide = maxWidth >= 840.dp
        CompositionLocalProvider(LocalNav provides navigator, LocalWide provides wide) {
            ModalNavigationDrawer(
                drawerState = drawer,
                gesturesEnabled = !wide,
                drawerContent = {
                    ModalDrawerSheet(drawerContainerColor = H.Ink, modifier = Modifier.width(320.dp)) {
                        DrawerContent(vm, route) { target -> scope.launch { drawer.close() }; navigator.tab(target) }
                    }
                },
            ) {
                Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.statusBars)) {
                    Header(wide, pending, onMenu = { scope.launch { drawer.open() } }, onBell = { navigator.go(Routes.AVISOS) }, onBrand = { navigator.tab(Routes.CALENDARIO) })
                    Row(Modifier.weight(1f)) {
                        if (wide) SideBar(vm, route, navigator)
                        Box(
                            Modifier.weight(1f).fillMaxHeight().drawBehind {
                                drawRect(Brush.verticalGradient(listOf(mark.copy(alpha = 0.07f), Color.Transparent), endY = 260f))
                            },
                        ) { HierroNavHost(nav, vm, Modifier.fillMaxSize(), startRoute) }
                    }
                    if (!wide && (Routes.isTab(route) || route == null)) BottomBar(route, navigator)
                }
            }
        }
    }
}

@Composable
private fun Header(wide: Boolean, pending: Int, onMenu: () -> Unit, onBell: () -> Unit, onBrand: () -> Unit) {
    Box(Modifier.fillMaxWidth().height(56.dp).background(H.Ink).drawBehind { drawLine(H.Line, Offset(0f, size.height), Offset(size.width, size.height), 1f) }.padding(horizontal = 16.dp)) {
        Row(Modifier.align(Alignment.CenterStart), verticalAlignment = Alignment.CenterVertically) {
            if (!wide) {
                Box(Modifier.size(40.dp).clip(H.rowShape).clickable(onClick = onMenu).semantics { contentDescription = "Abrir menú" }, contentAlignment = Alignment.Center) {
                    Icon(Icons.Filled.Menu, null, tint = H.Cream, modifier = Modifier.size(22.dp))
                }
            } else {
                Box(Modifier.size(40.dp).clip(H.rowShape).clickable(onClick = onBrand).semantics { contentDescription = "Hierro, ir al calendario" }, contentAlignment = Alignment.Center) { BrandMark() }
                Text("HIERRO", style = H.type.display3.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.ExtraBold, letterSpacing = 5.sp), modifier = Modifier.padding(start = 8.dp))
            }
        }
        if (!wide) Text("HIERRO", style = H.type.display3.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.ExtraBold, letterSpacing = 5.sp), modifier = Modifier.align(Alignment.Center))
        Row(Modifier.align(Alignment.CenterEnd), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            if (wide) Text("Clases, gym y comidas", style = H.type.small)
            Box(Modifier.size(40.dp).clip(H.rowShape).clickable(onClick = onBell).semantics { contentDescription = "Lo que queda hoy: $pending bloques" }.testTag("campana"), contentAlignment = Alignment.Center) {
                Icon(Icons.Filled.NotificationsNone, null, tint = H.Cream, modifier = Modifier.size(22.dp))
                if (pending > 0) {
                    Text(
                        "$pending", style = H.type.tiny.copy(color = H.AccentInk, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold),
                        modifier = Modifier.align(Alignment.TopEnd).offset(x = (-4).dp, y = 4.dp).clip(CircleShape).background(H.Accent).padding(horizontal = 5.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun BrandMark() {
    Box(Modifier.size(28.dp).clip(H.rowShape).background(Color(0xFF141210)), contentAlignment = Alignment.Center) {
        Text("H", style = H.type.cardTitle.copy(color = H.Accent))
    }
}

@Composable
private fun BottomBar(route: String?, nav: Navigator) {
    val index = Routes.tabs.indexOfFirst { it.route == route }.coerceAtLeast(0)
    BoxWithConstraints(Modifier.fillMaxWidth().background(H.Ink.copy(alpha = 0.96f)).drawBehind { drawLine(H.Line, Offset(0f, 0f), Offset(size.width, 0f), 1f) }.windowInsetsPadding(WindowInsets.navigationBars).padding(6.dp)) {
        val w = maxWidth / Routes.tabs.size
        val x by animateDpAsState(w * index, label = "pill")
        Box(Modifier.offset(x = x).width(w).height(56.dp).clip(H.rowShape).background(H.Panel2).border(1.dp, H.Accent.copy(alpha = 0.3f), H.rowShape))
        Row(Modifier.fillMaxWidth()) {
            Routes.tabs.forEachIndexed { i, tab ->
                val on = i == index
                Column(
                    Modifier.weight(1f).heightIn(min = 56.dp).clip(H.rowShape).clickable { nav.tab(tab.route) }.testTag("tab-${tab.route}").semantics { contentDescription = tab.label + if (on) ", sección actual" else "" },
                    horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                ) {
                    Icon(TAB_ICONS.getValue(tab.route), null, tint = if (on) H.Accent else H.Muted, modifier = Modifier.size(20.dp))
                    Text(tab.label, style = H.type.tiny.copy(color = if (on) H.Accent else H.Muted))
                }
            }
        }
    }
}

@Composable
private fun SideBar(vm: AppViewModel, route: String?, nav: Navigator) {
    Column(Modifier.width(240.dp).fillMaxHeight().background(H.Ink).drawBehind { drawLine(H.Line, Offset(size.width, 0f), Offset(size.width, size.height), 1f) }.verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Routes.tabs.forEach { tab ->
            val on = tab.route == route
            Row(
                Modifier.fillMaxWidth().heightIn(min = 44.dp).clip(H.rowShape).background(if (on) H.Panel2 else Color.Transparent)
                    .drawBehind { if (on) drawRect(H.Accent, Offset.Zero, androidx.compose.ui.geometry.Size(2.dp.toPx(), size.height)) }
                    .clickable { nav.tab(tab.route) }.padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Icon(TAB_ICONS.getValue(tab.route), null, tint = if (on) H.Accent else H.Muted, modifier = Modifier.size(20.dp))
                Text(tab.label, style = H.type.bodyStrong.copy(color = if (on) H.Accent else H.Muted))
            }
        }
        Text("PERFIL", style = H.type.caption, modifier = Modifier.padding(start = 4.dp, top = 12.dp, bottom = 4.dp))
        ProfilePanel(vm)
        Box(Modifier.padding(top = 8.dp)) { WeekStatsPanel(vm) }
    }
}

@Composable
private fun DrawerContent(vm: AppViewModel, route: String?, onSection: (String) -> Unit) {
    val nav = LocalNav.current
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).windowInsetsPadding(WindowInsets.safeDrawing).padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("HIERRO", style = H.type.cardTitle.copy(letterSpacing = 4.sp), modifier = Modifier.padding(bottom = 12.dp))
        Routes.tabs.forEach { tab ->
            val on = tab.route == route
            Text(
                tab.label, style = H.type.bodyStrong.copy(color = if (on) H.Accent else H.Muted),
                modifier = Modifier.fillMaxWidth().heightIn(min = 44.dp).clip(H.rowShape).background(if (on) H.Panel2 else Color.Transparent)
                    .drawBehind { if (on) drawRect(H.Accent, Offset.Zero, androidx.compose.ui.geometry.Size(2.dp.toPx(), size.height)) }
                    .clickable { onSection(tab.route) }.padding(horizontal = 12.dp, vertical = 12.dp),
            )
        }
        Text("PERFIL", style = H.type.caption, modifier = Modifier.padding(top = 20.dp, bottom = 8.dp))
        ProfilePanel(vm)
        Box(Modifier.padding(top = 12.dp)) { WeekStatsPanel(vm) }
        Text("Ver perfil y créditos", style = H.type.small.copy(color = H.Accent), modifier = Modifier.padding(top = 12.dp).clickable { nav.go(Routes.PERFIL) })
    }
}
