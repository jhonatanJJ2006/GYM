package com.hierro

import com.hierro.data.InMemoryUserRepository
import com.hierro.data.JsonPlanRepository
import com.hierro.ui.AppViewModel
import java.io.File
import java.time.LocalDate

object Fixtures {
    val plan: JsonPlanRepository by lazy { JsonPlanRepository(File("src/main/assets/data/hierro.json").readText()) }
    val today: LocalDate = LocalDate.of(2026, 10, 12)

    fun vm(user: InMemoryUserRepository = InMemoryUserRepository(shoppingSize = plan.nutrition.shopping.size)) = AppViewModel(plan, user) { today }
}
