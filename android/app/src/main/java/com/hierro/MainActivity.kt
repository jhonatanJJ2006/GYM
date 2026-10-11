package com.hierro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.hierro.data.DataStoreUserRepository
import com.hierro.data.JsonPlanRepository
import com.hierro.notify.Reminders
import com.hierro.ui.AppViewModel
import com.hierro.ui.HierroApp
import com.hierro.ui.theme.HierroTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        Reminders.ensureChannel(this)
        val plan = JsonPlanRepository.get(this)
        val factory = viewModelFactory { initializer { AppViewModel(plan, DataStoreUserRepository(applicationContext, plan.nutrition.shopping.size)) } }
        setContent {
            HierroTheme {
                HierroApp(viewModel(factory = factory))
            }
        }
    }
}
