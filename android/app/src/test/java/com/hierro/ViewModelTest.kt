package com.hierro

import com.hierro.data.InMemoryUserRepository
import com.hierro.data.Profile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ViewModelTest {
    @Before fun setUp() = Dispatchers.setMain(UnconfinedTestDispatcher())
    @After fun tearDown() = Dispatchers.resetMain()

    private val user = InMemoryUserRepository(shoppingSize = Fixtures.plan.nutrition.shopping.size)
    private val vm by lazy { Fixtures.vm(user) }

    @Test fun eventos() {
        assertEquals("Ponle un nombre al evento.", vm.addEvent("", "2026-10-12", "10:00", "11:00", "gym"))
        assertTrue(vm.addEvent("Fuera", "2027-05-01", "10:00", "11:00", "gym")!!.contains("1 de octubre"))
        assertNull(vm.addEvent("  Proyecto ", "2026-10-12", "10:00", "11:00", "trabajo"))
        assertEquals("Proyecto", vm.events.value.single().title)
        vm.removeEvent(vm.events.value.single().id)
        assertTrue(vm.events.value.isEmpty())
    }

    @Test fun comidasYEntreno() {
        vm.toggleMeal("2026-10-12", 1)
        assertEquals(listOf(1), vm.meals.value["2026-10-12"])
        val session = Fixtures.plan.sessionFor(Fixtures.today)
        session.exercises.forEach { vm.setDone("2026-10-12", it.id, true) }
        assertTrue(vm.isDone("2026-10-12", session.exercises[0].id))
        assertEquals(100, vm.weekStats.value.load)
        assertEquals(1, vm.weekStats.value.sessionsDone)
    }

    @Test fun perfil() {
        assertFalse(vm.saveProfile(Profile(" ", 1.7, 70.0, "Mantener")))
        assertFalse(vm.saveProfile(Profile("A", 0.0, 70.0, "Mantener")))
        assertTrue(vm.saveProfile(Profile(" Ana ", 1.6, 55.0, "Fuerza")))
        assertEquals("Ana", vm.profile.value.name)
        assertEquals("A", vm.profile.value.initials)
    }

    @Test fun compra() {
        vm.toggleShopping(2)
        assertTrue(vm.shopping.value[2])
        vm.clearShopping()
        assertTrue(vm.shopping.value.none { it })
        vm.setReminders(true)
        assertTrue(vm.reminders.value)
    }
}
