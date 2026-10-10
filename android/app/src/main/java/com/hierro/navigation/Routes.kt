package com.hierro.navigation

import android.net.Uri

/** Rutas de la app. Las cinco primeras son las pestañas (rutas de la web); el resto son los modales de la web. */
object Routes {
    const val CALENDARIO = "calendario"
    const val CLASES = "clases"
    const val SEMANA = "semana"
    const val ENTRENO = "entreno"
    const val COMIDAS = "comidas"
    const val DIA = "dia/{iso}"
    const val CLASE = "clase/{iso}/{key}"
    const val TRABAJO = "trabajo/{iso}/{start}"
    const val GYM = "gym/{iso}"
    const val SESION = "sesion/{id}"
    const val COMIDA = "comida/{dow}/{index}"
    const val EJERCICIO = "ejercicio/{sessionId}/{index}"
    const val GUIADO = "guiado/{iso}"
    const val EVENTO = "evento/{iso}"
    const val AVISOS = "avisos"
    const val PERFIL = "perfil"

    data class Tab(val route: String, val label: String, val page: String, val web: String)

    val tabs = listOf(
        Tab(CALENDARIO, "Calendario", "cal", "/"),
        Tab(CLASES, "Clases", "clases", "/clases"),
        Tab(SEMANA, "Semana", "semana", "/semana"),
        Tab(ENTRENO, "Entreno", "entreno", "/entreno"),
        Tab(COMIDAS, "Comidas", "comidas", "/comidas"),
    )

    val all = listOf(CALENDARIO, CLASES, SEMANA, ENTRENO, COMIDAS, DIA, CLASE, TRABAJO, GYM, SESION, COMIDA, EJERCICIO, GUIADO, EVENTO, AVISOS, PERFIL)

    fun dia(iso: String) = "dia/$iso"
    fun clase(iso: String, key: String) = "clase/$iso/${Uri.encode(key)}"
    fun trabajo(iso: String, start: Int) = "trabajo/$iso/$start"
    fun gym(iso: String) = "gym/$iso"
    fun sesion(id: String) = "sesion/$id"
    fun comida(dow: Int, index: Int) = "comida/$dow/$index"
    fun ejercicio(sessionId: String, index: Int) = "ejercicio/$sessionId/$index"
    fun guiado(iso: String) = "guiado/$iso"
    fun evento(iso: String) = "evento/$iso"

    /** Sección (data-page) que pinta la marca de color de una ruta. */
    fun pageOf(route: String?): String = when {
        route == null -> "cal"
        route.startsWith(CLASES) || route.startsWith("clase/") -> "clases"
        route.startsWith(SEMANA) || route.startsWith("trabajo") -> "semana"
        route.startsWith(ENTRENO) || route.startsWith("gym") || route.startsWith("sesion") || route.startsWith("ejercicio") || route.startsWith("guiado") -> "entreno"
        route.startsWith(COMIDAS) || route.startsWith("comida/") -> "comidas"
        else -> "cal"
    }

    fun isTab(route: String?) = tabs.any { it.route == route }
}
