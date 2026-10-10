# Filament / SceneView usan JNI y reflexion.
-keep class com.google.android.filament.** { *; }
-keep class io.github.sceneview.** { *; }
# Modelos serializados (datos de la web y almacenamiento local).
-keepclassmembers @kotlinx.serialization.Serializable class com.hierro.** { *; }
-keep class com.hierro.**$$serializer { *; }
-keepclassmembers class com.hierro.** { *** Companion; kotlinx.serialization.KSerializer serializer(...); }
-dontwarn org.slf4j.**
