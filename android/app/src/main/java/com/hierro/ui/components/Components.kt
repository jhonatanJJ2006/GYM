package com.hierro.ui.components

import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import android.graphics.BitmapFactory
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hierro.data.Kind
import com.hierro.data.Photo
import com.hierro.ui.theme.H
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

fun Kind.block(): Color = when (this) { Kind.Clase -> H.BlockClass; Kind.Trabajo -> H.BlockWork; Kind.Gym -> H.BlockGym; Kind.Comida -> H.BlockMeal }
fun Kind.rail(): Color = when (this) { Kind.Clase -> H.RailClass; Kind.Trabajo -> H.RailWork; Kind.Gym -> H.RailGym; Kind.Comida -> H.RailMeal }

fun hex(value: String): Color = Color(android.graphics.Color.parseColor(value))

/** Franja izquierda de 3px (box-shadow inset 3px 0 0). */
fun Modifier.rail(color: Color): Modifier = drawBehind { drawRect(color, Offset.Zero, Size(3.dp.toPx(), size.height)) }

@Composable
fun HCard(modifier: Modifier = Modifier, border: Color = H.Line, background: Color = H.Panel, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier.clip(H.cardShape).background(background).border(1.dp, border, H.cardShape), content = content)
}

@Composable
fun Chip(text: String, color: Color = H.Muted, border: Color = H.Line, modifier: Modifier = Modifier, dot: Color? = null) {
    Row(
        modifier.clip(H.chipShape).border(1.dp, border, H.chipShape).background(H.Panel).padding(horizontal = 10.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (dot != null) Box(Modifier.size(6.dp).clip(CircleShape).background(dot))
        Text(text, style = H.type.small.copy(color = color))
    }
}

@Composable
fun ToggleChip(text: String, on: Boolean, onClick: () -> Unit, dot: Color? = null, modifier: Modifier = Modifier) {
    Row(
        modifier.heightIn(min = 36.dp).clip(H.chipShape)
            .border(1.dp, if (on) H.Accent.copy(alpha = 0.4f) else H.Line, H.chipShape)
            .background(if (on) H.Panel2 else H.Panel)
            .clickable(onClick = onClick).padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (dot != null) Box(Modifier.size(6.dp).clip(CircleShape).background(dot))
        Text(text, style = H.type.small.copy(color = if (on) H.Cream else H.Muted))
    }
}

@Composable
fun AccentButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, icon: (@Composable () -> Unit)? = null) {
    Button(
        onClick = onClick, enabled = enabled, modifier = modifier.heightIn(min = 44.dp), shape = H.rowShape,
        colors = ButtonDefaults.buttonColors(containerColor = H.Accent, contentColor = H.AccentInk, disabledContainerColor = H.Accent.copy(alpha = 0.4f), disabledContentColor = H.AccentInk.copy(alpha = 0.6f)),
        contentPadding = PaddingValues(horizontal = 16.dp),
    ) {
        if (icon != null) { icon(); Spacer(Modifier.width(8.dp)) }
        Text(text, style = H.type.bodyStrong.copy(color = Color.Unspecified, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold))
    }
}

@Composable
fun LineButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    OutlinedButton(
        onClick = onClick, enabled = enabled, modifier = modifier.heightIn(min = 44.dp), shape = H.rowShape,
        border = BorderStroke(1.dp, H.Line),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = H.Cream, disabledContentColor = H.Muted.copy(alpha = 0.5f)),
        contentPadding = PaddingValues(horizontal = 14.dp),
    ) { Text(text, style = H.type.bodyStrong.copy(color = Color.Unspecified)) }
}

@Composable
fun IconSquareButton(label: String, symbol: String, enabled: Boolean, onClick: () -> Unit) {
    Box(
        Modifier.size(40.dp).clip(H.rowShape).border(1.dp, H.Line, H.rowShape).background(H.Panel)
            .clickable(enabled = enabled, onClick = onClick).semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) { Text(symbol, style = H.type.display3.copy(color = if (enabled) H.Cream else H.Muted.copy(alpha = 0.4f))) }
}

@Composable
fun PageIntro(title: String, text: String? = null) {
    Column(Modifier.padding(bottom = 24.dp)) {
        Text(title, style = H.type.pageTitle)
        if (text != null) Text(text, style = H.type.body.copy(color = H.Muted), modifier = Modifier.padding(top = 12.dp))
    }
}

@Composable
fun SectionLabel(text: String, modifier: Modifier = Modifier, color: Color = H.Muted) {
    Text(text.uppercase(), style = H.type.caption.copy(color = color), modifier = modifier)
}

@Composable
fun ProgressBar(value: Int, max: Int, color: Color = H.Accent, label: String) {
    val pct = if (max <= 0) 0f else minOf(1f, value.toFloat() / max)
    Box(Modifier.fillMaxWidth().height(6.dp).clip(H.chipShape).background(H.Panel2).semantics { contentDescription = "$label ${(pct * 100).toInt()}%" }) {
        Box(Modifier.fillMaxWidth(pct).fillMaxHeight().clip(H.chipShape).background(color))
    }
}

@Composable
fun HCheckbox(checked: Boolean, onChange: () -> Unit, color: Color = H.Accent, label: String) {
    Checkbox(
        checked = checked, onCheckedChange = { onChange() },
        colors = CheckboxDefaults.colors(checkedColor = color, uncheckedColor = H.Muted, checkmarkColor = H.Ink),
        modifier = Modifier.semantics { contentDescription = label },
    )
}

/** Imagen local de assets/photos, decodificada fuera del hilo principal. */
@Composable
fun AssetImage(path: String, modifier: Modifier = Modifier, contentDescription: String? = null, maxPx: Int = 900) {
    val context = LocalContext.current
    var bitmap by remember(path) { mutableStateOf<ImageBitmap?>(null) }
    LaunchedEffect(path) {
        val decoded = withContext(Dispatchers.IO) {
            runCatching {
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                context.assets.open(path).use { BitmapFactory.decodeStream(it, null, bounds) }
                var sample = 1
                while (maxOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= maxPx) sample *= 2
                context.assets.open(path).use { BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = sample }) }?.asImageBitmap()
            }.getOrNull()
        }
        bitmap = decoded
    }
    Box(modifier.background(H.Panel2)) {
        bitmap?.let { Image(it, contentDescription, Modifier.matchParentSize(), contentScale = ContentScale.Crop) }
    }
}

@Composable
fun Thumb(photo: Photo, size: Dp = 40.dp) = AssetImage(photo.assetPath, Modifier.size(size).clip(H.rowShape), maxPx = 160)

/** Foto grande con crédito (PhotoHero.tsx). Solo en detalles. */
@Composable
fun PhotoHero(photo: Photo, alt: String = photo.alt) {
    Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f)) {
        AssetImage(photo.assetPath, Modifier.matchParentSize(), alt)
        Box(Modifier.align(Alignment.BottomStart).fillMaxWidth().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)))).padding(start = 12.dp, end = 12.dp, top = 32.dp, bottom = 8.dp)) {
            Text(photo.credit, style = H.type.tiny.copy(color = Color.White.copy(alpha = 0.75f), fontSize = 10.sp))
        }
    }
}

/** Fila compacta 44px con miniatura opcional (CompactRow.tsx). */
@Composable
fun CompactRow(title: String, meta: String, onClick: () -> Unit, thumb: (@Composable () -> Unit)? = null) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 44.dp).clip(H.rowShape).background(H.Panel).clickable(onClick = onClick).padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        thumb?.invoke()
        Text(title, style = H.type.bodyStrong.copy(fontWeight = androidx.compose.ui.text.font.FontWeight.Medium), maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
        Text(meta, style = H.type.small)
    }
}

/** Tarjeta con franja de color y tinte de su tipo. */
@Composable
fun RailCard(kind: Kind, onClick: (() -> Unit)?, modifier: Modifier = Modifier, dashed: Boolean = false, alarm: Boolean = false, content: @Composable RowScope.() -> Unit) {
    Row(
        modifier.fillMaxWidth().clip(H.cardShape).background(kind.block().copy(alpha = 0.45f))
            .border(1.dp, if (alarm) Color(0x99EF4444) else if (dashed) H.Grid else H.Line, H.cardShape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .rail(kind.rail()).padding(start = 16.dp, end = 14.dp, top = 12.dp, bottom = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top, content = content,
    )
}

@Composable
fun TimeTag(text: String, color: Color) {
    Text(text, style = H.type.small.copy(color = color), modifier = Modifier.clip(H.blockShape).background(H.Ink.copy(alpha = 0.5f)).border(1.dp, color.copy(alpha = 0.2f), H.blockShape).padding(horizontal = 8.dp, vertical = 4.dp))
}

@Composable
fun Note(text: String, strong: Boolean = false) {
    Text(text, style = H.type.body.copy(color = if (strong) H.Cream else H.Cream.copy(alpha = 0.8f)), modifier = Modifier.fillMaxWidth().clip(H.rowShape).background(H.Panel).padding(12.dp))
}

@Composable
fun DetailHeader(title: String) {
    Text(title, style = H.type.display2.copy(fontSize = 26.sp, lineHeight = 30.sp))
}

@Composable
fun Labeled(label: String, value: String) {
    Column(Modifier.fillMaxWidth().padding(top = 12.dp)) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(H.Line))
        Text(label, style = H.type.small, modifier = Modifier.padding(top = 12.dp))
        Text(value, style = H.type.body, modifier = Modifier.padding(top = 2.dp))
    }
}

@Composable
fun Centered(content: @Composable BoxScope.() -> Unit) = Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center, content = content)

