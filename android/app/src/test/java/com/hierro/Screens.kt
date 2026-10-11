package com.hierro

import com.hierro.navigation.Routes

/** Ruta concreta y etiqueta de prueba para cada ruta del grafo. */
object Screens {
    val samples: List<Triple<String, String, String>> = listOf(
        Triple(Routes.CALENDARIO, Routes.CALENDARIO, "pantalla-calendario"),
        Triple(Routes.CLASES, Routes.CLASES, "pantalla-clases"),
        Triple(Routes.SEMANA, Routes.SEMANA, "pantalla-semana"),
        Triple(Routes.ENTRENO, Routes.ENTRENO, "pantalla-entreno"),
        Triple(Routes.COMIDAS, Routes.COMIDAS, "pantalla-comidas"),
        Triple(Routes.DIA, Routes.dia("2026-10-12"), "detalle-dia"),
        Triple(Routes.CLASE, Routes.clase("2026-10-12", Fixtures.plan.classesFor(Fixtures.today).first().key), "detalle-clase"),
        Triple(Routes.TRABAJO, Routes.trabajo("2026-10-12", Fixtures.plan.day(Fixtures.today)!!.work.first().start), "detalle-trabajo"),
        Triple(Routes.GYM, Routes.gym("2026-10-12"), "detalle-sesion"),
        Triple(Routes.SESION, Routes.sesion("legs"), "detalle-sesion"),
        Triple(Routes.COMIDA, Routes.comida(1, 1), "detalle-comida"),
        Triple(Routes.EJERCICIO, Routes.ejercicio("push", 0), "detalle-ejercicio"),
        Triple(Routes.GUIADO, Routes.guiado("2026-10-12"), "pantalla-guiado"),
        Triple(Routes.EVENTO, Routes.evento("2026-10-12"), "pantalla-evento"),
        Triple(Routes.AVISOS, Routes.AVISOS, "pantalla-avisos"),
        Triple(Routes.PERFIL, Routes.PERFIL, "pantalla-perfil"),
    )
}
