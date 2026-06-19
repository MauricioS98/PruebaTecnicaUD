# OrchestApp — Manual de Marca

## Esencia de marca

OrchestApp fusiona **música orquestal clásica** con **tecnología moderna**. Transmite elegancia, sofisticación, minimalismo premium, movimiento, armonía y exclusividad artística.

**Isotipo:** orca minimalista con pentagrama, notas y batuta de director.

| Archivo | Uso |
|---------|-----|
| `public/assets/logo-orchestapp-blanco.png` | Fondos oscuros (UI principal) |
| `public/assets/logo-orchestapp-negro.png` | Fondos claros |

Componente Angular: `<app-brand-logo surface="dark" size="md" align="center" />`

- `surface="dark"` → logo blanco · `surface="light"` → logo negro
- `align="center"` → login, hero · `align="start"` → sidebar (default)

---

## Paleta cromática

### Primarios

| Nombre | HEX | RGB | Uso |
|--------|-----|-----|-----|
| Negro profundo | `#08080C` | `8, 8, 12` | Fondo principal, canvas |
| Azul navy oscuro | `#0D1520` | `13, 21, 32` | Sidebar, navbar, superficies |
| Azul navy elevado | `#141C2B` | `20, 28, 43` | Cards, modales |
| Blanco suave | `#F4F4EF` | `244, 244, 239` | Texto principal, títulos |

### Secundarios

| Nombre | HEX | RGB | Uso |
|--------|-----|-----|-----|
| Dorado tenue | `#C4A96B` | `196, 169, 107` | Acentos, CTAs, highlights premium |
| Gris grafito | `#2A2A32` | `42, 42, 50` | Tooltips, superficies secundarias |
| Gris grafito claro | `#3D3D47` | `61, 61, 71` | Bordes activos |
| Azul eléctrico sutil | `#5B8DEF` | `91, 141, 239` | Estados activos, badges tecnológicos |

### Jerarquía visual

1. **Fondo** → Negro profundo / Navy
2. **Contenido** → Blanco suave / Gris secundario
3. **Acento premium** → Dorado (uso moderado)
4. **Acento tech** → Azul eléctrico (badges, estados)

---

## Tipografía

| Rol | Familia | Uso |
|-----|---------|-----|
| **UI principal** | Inter | Botones, inputs, tablas, navegación |
| **Secundaria** | Manrope | Subtítulos, metadata, labels |
| **Títulos / Display** | Cormorant Garamond | Headlines, nombres de obras, hero |

### Escala tipográfica

| Token | Tamaño | Uso |
|-------|--------|-----|
| `text-xs` | 12px | Badges, labels uppercase |
| `text-sm` | 14px | UI secundaria, tablas |
| `text-base` | 16px | Cuerpo |
| `text-lg` | 18px | Subtítulos de card |
| `text-xl` | 20px | Secciones |
| `text-2xl` | 24px | Títulos de página |
| `text-3xl` | 32px | Dashboard headers |
| `text-4xl` | 44px | Hero / login |

### Pesos y tracking

- Regular `400` — cuerpo
- Medium `500` — UI, botones
- Semibold `600` — énfasis tabular
- Tracking títulos: `-0.02em`
- Labels uppercase: `0.08em`

---

## Sistema UI

Implementado en `frontend/src/styles/_tokens.scss` y `_components.scss`.

### Componentes

| Componente | Clase base | Notas |
|------------|------------|-------|
| Botón primario | `.oa-btn--primary` | Dorado, hover con glow |
| Botón secundario | `.oa-btn--secondary` | Borde sutil |
| Input | `.oa-input` | Fondo translúcido, focus dorado |
| Card | `.oa-card` | Navy elevado, hover sutil |
| Card glass | `.oa-card--glass` | Glassmorphism en login |
| Badge | `.oa-badge--gold/blue/neutral` | Estados y categorías |
| Tabla | `.oa-table` | Registros administrativos |
| Modal | `.oa-modal` | Overlay con blur |

### Layout

- **Sidebar:** 260px, navy oscuro, navegación con iconos musicales
- **Navbar:** 64px, glassmorphism, búsqueda global
- **Grid:** max-width 1280px, gap 32px
- **Espaciado:** sistema base 4px (4, 8, 12, 16, 24, 32, 48, 64)

### Experiencia visual

| Propiedad | Valor |
|-----------|-------|
| Border radius sm/md/lg/xl | 6 / 10 / 14 / 20px |
| Sombras | Sutiles, `rgba(0,0,0,0.24–0.4)` |
| Glassmorphism | `backdrop-filter: blur(16px)`, opacidad 72% |
| Gradientes | Hero navy, acento dorado diagonal |
| Hover | `translateY(-1px)`, border más visible |
| Transiciones | 150ms / 250ms / 400ms ease |

### Inspiración aplicada

- **Spotify / TIDAL** — cards musicales, dark UI
- **Apple Music Classical** — tipografía serif en títulos
- **Linear / Notion** — limpieza, espaciado generoso
- **Stripe** — botones refinados, jerarquía clara

---

## Implementación técnica

Los tokens viven en SCSS y se consumen en componentes Angular. Prefijo de clases utilitarias: `oa-` (OrchestApp).

```scss
@use 'styles/tokens' as *;
@use 'styles/components';
```
