# Animación Cinemática de Sables de Luz - Star Wars Homenaje

## Descripción

Secuencia animada cinemática que recrea el icónico choque de sables de luz de Star Wars utilizando **Three.js** y **Tween.js**. El proyecto implementa un sistema de animación encadenada complejo con efectos de iluminación dinámica, geometría procedural de texto 3D y timing cinematográfico preciso.

**Autor:** Alberto Redondo Álvarez de Sotomayor 

**Video y CodeSandbox:**

https://drive.google.com/file/d/1_7d03CTi2MLd9eRyWHVe9dGUt6TzzVi7/view?usp=sharing

https://codesandbox.io/p/sandbox/animation-j6p2g6

---

## Características Principales

### Texturas y Materiales

El proyecto utiliza una combinación estratégica de materiales físicos y emisivos para lograr el característico brillo de los sables de luz:

#### **Sables de Luz**

**Geometría:**
- `CylinderGeometry` (radio: 0.08, altura: 4.0, segmentos: 32)
- Dimensiones: `BLADE_LENGTH = 4` unidades
- Detalle: 32 segmentos radiales para suavidad
- Origen: Centro del cilindro en Y=0, desplazado +2 para empuñadura

**Material Sable Azul:**
```javascript
MeshPhongMaterial {
  color: 0x66aaff,           // Azul claro (#66aaff)
  emissive: 0x2277ff,        // Azul brillante emisivo
  emissiveIntensity: 1.8     // 180% de intensidad emisiva
}
```

**Material Sable Rojo:**
```javascript
MeshPhongMaterial {
  color: 0xff6666,           // Rojo claro (#ff6666)
  emissive: 0xff2222,        // Rojo brillante emisivo
  emissiveIntensity: 1.8     // 180% de intensidad emisiva
}
```

**Propiedades clave del `MeshPhongMaterial`:**
- **Color base:** Tono visible bajo iluminación directa
- **Emissive:** Color que emite independientemente de luces
- **EmissiveIntensity > 1:** Efecto de "sobre-brillo" característico
- **Modelo Phong:** Cálculo de especular para reflejos sutiles
- **Respuesta a luces:** Sí (a diferencia de `MeshBasicMaterial`)

**Resultado visual:**
- Hojas brillantes que parecen emitir luz propia
- Gradientes suaves en la superficie cilíndrica
- Intensidad aumentada por `emissiveIntensity`
- Apariencia de plasma energizado

#### **Empuñaduras**

**Geometría:**
```javascript
CylinderGeometry {
  radiusTop: 0.12,
  radiusBottom: 0.14,      // Ligeramente cónico
  height: 0.6,
  radialSegments: 16
}
```

**Material Metálico:**
```javascript
MeshStandardMaterial {
  color: 0xb5b5b5,         // Gris metálico (#b5b5b5)
  metalness: 1.0,          // 100% metálico
  roughness: 0.25          // 25% rugosidad (muy pulido)
}
```

**Propiedades de PBR (Physically Based Rendering):**
- **Metalness máximo:** Reflexiones metálicas puras
- **Roughness bajo:** Superficie muy pulida/brillante
- **Sin emissive:** No genera luz propia
- **Responde a iluminación:** Reflejos realistas del entorno

**Jerarquía de grupos:**
```
Group (Sable completo)
  ├─ Mesh (Hoja/Blade)   → position.y = +2.0
  └─ Mesh (Empuñadura)   → position.y = -0.3
```

Ventaja: Rotación y traslación del grupo mueve ambos componentes como unidad

#### **Campo de Estrellas**

**Sistema de Partículas:**
```javascript
Points {
  count: 1000 estrellas,
  distribution: Cubo de 160×160×160 unidades,
  size: 0.12 unidades por punto,
  sizeAttenuation: true    // Perspectiva correcta
}
```

**Material:**
```javascript
PointsMaterial {
  size: 0.12,
  sizeAttenuation: true,   // Tamaño reduce con distancia
  color: default (blanco)
}
```

**Características:**
- Distribución aleatoria uniforme en 3D
- Rotación continua sobre eje Y (0.0001 rad/s)
- Sin textura (puntos cuadrados básicos)
- Bajo costo de renderizado (solo vértices)

#### **Efectos de Choque**

**Haz de Luz (Clash Beam):**

**Geometría:**
```javascript
CylinderGeometry {
  radiusTop: 0.08,
  radiusBottom: 0.3,       // Forma cónica (haz expansivo)
  height: 2.5,
  radialSegments: 16,
  openEnded: true          // Sin tapas circulares
}
```

**Material:**
```javascript
MeshBasicMaterial {
  color: 0xffffee,         // Amarillo-blanco muy claro
  transparent: true,
  opacity: 0.0,            // Invisible por defecto
  side: THREE.DoubleSide   // Visible desde ambos lados
}
```

**Estados del haz:**
- **Reposo:** Escala 0.01, opacidad 0.0 (invisible)
- **Choque:** Escala 1.0, opacidad 0.9 (máxima visibilidad)
- **Duración:** 180ms de fade-in, 180ms de fade-out (yoyo)
- **Orientación:** Rotado 90° en Z (horizontal)

**Luz Puntual de Choque:**
```javascript
PointLight {
  color: 0xffffff,         // Blanco puro
  intensity: 0-6,          // Variable según animación
  distance: 8,             // Radio de influencia
  position: (0, -2.5, 0)   // Centro del haz
}
```

**Comportamiento:**
- Intensidad 0 en reposo (no consume recursos)
- Intensidad 6 en pico de choque
- Ilumina dinámicamente los sables y el entorno
- Decay natural con la distancia

#### **Texto 3D: "INFORMATICA GRAFICA"**

**Geometría:**
```javascript
TextGeometry {
  font: Helvetiker Regular,
  size: 1.2,               // Altura de letras
  height: 0.25,            // Profundidad/extrusión
  curveSegments: 12,       // Suavidad de curvas
  bevelEnabled: true,      // Biselado activado
  bevelThickness: 0.04,
  bevelSize: 0.03,
  bevelSegments: 4
}
```

**Material:**
```javascript
MeshBasicMaterial {
  color: 0xffee33,         // Amarillo Star Wars (#ffee33)
  transparent: true,
  opacity: 0.0-1.0         // Animado durante fade-in/out
}
```

**Características del texto:**
- Dos meshes independientes (INFORMATICA, GRAFICA)
- Centrado mediante cálculo de bounding box
- Espaciado vertical: 1.4 unidades entre líneas
- Biselado 3D para profundidad visual
- Rotación sutil animada (±0.03 rad)

**Centrado automático:**
```javascript
const centerGeo = (geo) => {
  const box = geo.boundingBox;
  const offsetX = (box.max.x - box.min.x) / 2;
  const offsetY = (box.max.y - box.min.y) / 2;
  geo.translate(-offsetX, -offsetY, 0);
}
```
Calcula dimensiones y traslada geometría para alinear centro con origen

---

### 💡 Sistema de Iluminación

El proyecto utiliza un **modelo de iluminación híbrido** combinando luces globales constantes con efectos dinámicos:

#### **Iluminación Base (Constante)**

**Luz Ambiental:**
```javascript
AmbientLight {
  color: 0x404040,         // Gris oscuro (#404040)
  intensity: 1.5           // 150% de intensidad estándar
}
```

**Función:**
- Iluminación uniforme omnidireccional
- Evita negros absolutos en sombras
- No genera dirección ni especular
- Simula luz reflejada del entorno

**Luz Principal (Key Light):**
```javascript
PointLight {
  color: 0xffffff,         // Blanco puro
  intensity: 2.0,          // 200% de intensidad
  distance: 50,            // Radio efectivo
  position: (5, 5, 10)     // Superior-derecha-frontal
}
```

**Función:**
- Iluminación direccional desde posición fija
- Crea reflejos especulares en empuñaduras metálicas
- Ilumina las hojas de los sables desde ángulo superior
- Proporciona profundidad tridimensional

#### **Iluminación Dinámica (Animada)**

**Luz de Choque (Clash Light):**
```javascript
PointLight {
  intensity: 0 → 6 → 0,    // Animado con tween
  position: (0, -2.5, 0),  // Centro de colisión
  distance: 8
}
```

**Ciclo de animación:**
1. **t=0ms:** Intensidad 0 (apagada)
2. **t=180ms:** Intensidad 6 (pico máximo)
3. **t=360ms:** Intensidad 0 (apagada)
4. **Easing:** Cubic.Out + yoyo (in/out simétrico)

**Efecto visual:**
- Flash brillante en momento de impacto
- Ilumina dramáticamente hojas y empuñaduras
- Simula liberación de energía del choque
- Radio de 8 unidades cubre toda la zona de contacto

#### **Interacción de Luces y Materiales**

**MeshPhongMaterial (Hojas):**
```
Luz Ambiente → Color difuso base
Luz Puntual → Especular + reflexión
Emissive → Brillo propio constante
─────────────────────────────────
Resultado = Base + Iluminación + Emisión
```

**MeshStandardMaterial (Empuñaduras):**
```
Modelo PBR:
  Metalness=1.0 → Reflexión de luces como metal
  Roughness=0.25 → Superficie muy pulida
  Luz Ambiente → Tono base
  Luz Puntual → Reflejos metálicos intensos
```

**MeshBasicMaterial (Texto/Haz):**
```
Sin respuesta a luces:
  Color = color material (constante)
  Opacidad = controlada por animación
  No afectado por PointLights/AmbientLight
```

#### **Valores de Intensidad Comparados**

```
Escala de intensidades:
AmbientLight:    1.5  ━━━━━━━━━━━━━━━━━━━━━━━━━━━
KeyLight:        2.0  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ClashLight:      6.0  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

La luz de choque es **3× más intensa** que la iluminación base, creando impacto dramático

---

### 🎬 Sistema de Animación con Tween.js

El proyecto implementa una **secuencia cinemática compleja** usando cadenas de tweens para timing preciso:

#### **Arquitectura de la Secuencia**

```
┌─────────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
│ ClashTween  │────▶│ExitTween │────▶│TitleInTween│────▶│HoldTween │────▶│TitleOutTw.│
│   1.6s      │     │  0.7s    │     │   1.3s     │     │  1.2s    │     │   1.0s    │
└─────────────┘     └──────────┘     └────────────┘     └──────────┘     └───────────┘
                                                                                  │
                                                                                  │
                                                                          ┌───────▼──────┐
                                                                          │    LOOP      │
                                                                          │   (reset)    │
                                                                          └──────────────┘
```

**Duración total del ciclo:** ~6.8 segundos (bucle infinito)

#### **Tween 1: Choque de Sables (clashTween)**

**Duración:** 1600ms (1.6 segundos)  
**Easing:** `TWEEN.Easing.Cubic.InOut` (aceleración suave)

**Parámetros animados:**
```javascript
{ t: 0 } → { t: 1 }  // Progreso lineal normalizado
```

**Geometría del movimiento:**

1. **Posiciones Iniciales:**
   ```
   Sable Azul:  (-6, -3, 0)  [Fuera de pantalla izquierda-abajo]
   Sable Rojo:  (+6, -3, 0)  [Fuera de pantalla derecha-abajo]
   ```

2. **Punto de Colisión (CLASH):**
   ```javascript
   const CLASH = { x: 0, y: 1.0 };  // Centro-arriba de escena
   ```

3. **Cálculo de Posiciones Finales:**
   ```javascript
   // Distancia desde punto de choque hasta empuñaduras
   const clashDistance = BLADE_LENGTH / 2;  // 2.0 unidades
   
   // Vectores direccionales desde CLASH hacia posiciones base
   blueDir = normalize((-1.3, -1.2) - (0, 1.0))
   redDir = normalize((+1.3, -1.2) - (0, 1.0))
   
   // Posiciones finales (empuñaduras a 2 unidades del punto de choque)
   blueEnd = CLASH + blueDir × clashDistance
   redEnd = CLASH + redDir × clashDistance
   ```

4. **Interpolación de Posición:**
   ```javascript
   blue.position = lerp((-6, -3), blueEnd, t)
   red.position = lerp((+6, -3), redEnd, t)
   ```

**Rotación Dinámica:**

```javascript
// Azul: apunta hacia punto de choque
const angleB = atan2(CLASH.x - blue.pos.x, CLASH.y - blue.pos.y);
blue.rotation.z = angleB + π + sin(t×π) × 0.08;

// Rojo: apunta hacia punto de choque
const angleR = atan2(CLASH.x - red.pos.x, CLASH.y - red.pos.y);
red.rotation.z = angleR + π - sin(t×π) × 0.08;
```

**Componentes de rotación:**
- `angleB/R`: Ángulo hacia centro de choque (orientación base)
- `+ π`: Flip de 180° (hojas apuntan hacia adelante)
- `± sin(t×π) × 0.08`: Oscilación de ±4.6° durante aproximación
- Efecto: Sables "luchan" contra la resistencia al acercarse

**Sacudida de Cámara (Camera Shake):**

```javascript
const clashPower = sin(t × π);  // Intensidad parabólica [0→1→0]

camera.position.x = sin(t × 40) × 0.08 × clashPower;
camera.position.y = cos(t × 35) × 0.08 × clashPower;
camera.lookAt(0, 0, 0);
```

**Características:**
- Frecuencias: 40 rad/s (X), 35 rad/s (Y) → vibración asíncrona
- Amplitud: 0.08 unidades máxima (en t=0.5)
- `clashPower`: Modulación parabólica (más intensa en medio)
- Simula impacto físico del choque

**Callback onComplete:**
```javascript
.onComplete(() => {
  // Guardar posiciones para siguiente tween
  blueExitStart = blue.position.clone();
  redExitStart = red.position.clone();
  
  // Disparar efecto visual
  startClashFlash();
})
```

#### **Flash de Choque (startClashFlash)**

**Tween independiente (no encadenado):**

**Duración:** 360ms (180ms × 2 por yoyo)  
**Easing:** `Cubic.Out` con `yoyo(true)` + `repeat(1)`

**Parámetros animados:**
```javascript
{
  intensity: 0 → 6,        // PointLight
  beamScale: 0.01 → 1.0,   // Escala del mesh
  beamOpacity: 0.0 → 0.9   // Transparencia
}
```

**Timeline del flash:**
```
t=0ms:    Invisible (intensity=0, scale=0.01, opacity=0)
t=180ms:  Pico máximo (intensity=6, scale=1.0, opacity=0.9)
t=360ms:  Invisible de nuevo (vuelta a 0)
```

**Efecto visual:**
- Luz explota desde punto de choque
- Haz cónico se expande y contrae
- Sincronizado con fade-out de luz
- Simula liberación de energía

#### **Tween 2: Salida de Sables (exitTween)**

**Duración:** 700ms  
**Easing:** `Cubic.In` (aceleración creciente)

**Movimiento:**
```javascript
// Desde posiciones finales de clash hacia fuera de escena
blue: (blueExitStart) → (-10, -6, 0)
red:  (redExitStart)  → (+10, -6, 0)
```

**Justificación del easing:**
- `Cubic.In`: Salida lenta al inicio, rápida al final
- Simula "empujón" del choque que acelera los sables
- Más cinematográfico que lineal

#### **Tween 3: Entrada de Título (titleInTween)**

**Duración:** 1300ms  
**Easing:** `Cubic.Out` (desaceleración suave)

**Parámetros:**
```javascript
titleInParams: {
  s: 0.001 → 1.1,     // Escala (ligeramente over-scale)
  o: 0.0 → 1.0        // Opacidad
}
```

**Efectos aplicados:**
```javascript
titleGroup.scale.set(s, s, s);
titleMaterial.opacity = o;

// Rotación sutil animada
titleGroup.rotation.z = 0.03 × sin(time × 0.002);
```

**Características:**
- Over-scaling a 1.1 (10% más grande que tamaño final)
- Fade-in sincronizado con escala
- Oscilación suave (±1.7°) para dinamismo
- `onStart`: Hace visible el grupo de texto

#### **Tween 4: Mantener Título (titleHoldTween)**

**Duración:** 1200ms  
**Sin parámetros animados** (solo tiempo de espera)

**Función:**
```javascript
.onUpdate(() => {
  // Continuar animación de rotación
  titleGroup.rotation.z = 0.03 × sin(time × 0.002);
})
```

**Propósito:**
- Dar tiempo al espectador para leer el texto
- Mantener movimiento sutil (no estático)
- Preparar para salida

#### **Tween 5: Salida de Título (titleOutTween)**

**Duración:** 1000ms  
**Easing:** `Cubic.In` (aceleración)

**Parámetros:**
```javascript
titleOutParams: {
  s: 1.1 → 1.5,      // Escala crece 50%
  o: 1.0 → 0.0       // Fade-out completo
}
```

**Efectos:**
- Over-scaling extremo (alejamiento dramático)
- Fade-out simultáneo
- Simula texto "volando" hacia la cámara

**Callback onComplete:**
```javascript
.onComplete(() => {
  titleGroup.visible = false;
  titleGroup.scale.set(0.001, 0.001, 0.001);
  
  resetSabers(blue, red);
  
  // REINICIAR BUCLE
  clashParams.t = 0;
  exitParams.t = 0;
  clashTween.start();
})
```

**Cierre del ciclo:**
- Oculta y resetea título
- Restaura sables a posiciones iniciales
- Resetea parámetros de tweens
- Relanza `clashTween` → bucle infinito

---

### Interactividad y Controles

#### **Sin Controles de Usuario**

Este proyecto es una **secuencia automática** sin interacción directa:
- No hay OrbitControls
- No hay botones/sliders
- No hay eventos de ratón/teclado
- Experiencia puramente cinemática

**Justificación:**
- Enfoque en storytelling visual
- Timing preciso predefinido
- Cámara con shake programado (incompatible con controles libres)

#### **Interacción Pasiva**

El usuario puede:
- **Ver:** Secuencia completa en bucle
- **Esperar:** Cambios automáticos cada 6.8 segundos
- **Redimensionar:** Ventana adapta aspect ratio automáticamente

---

### Loop Principal

```javascript
function animationLoop() {
  requestAnimationFrame(animationLoop);
  
  const time = performance.now() * 0.0002;
  
  // Rotación continua de estrellas
  if (stars) {
    stars.rotation.y = time × 0.5;
  }
  
  // Actualizar todas las animaciones Tween activas
  TWEEN.update();
  
  // Renderizar escena
  renderer.render(scene, camera);
}
```

**Frecuencia:** ~60 FPS (VSync)

**Orden de ejecución:**
1. Solicitar próximo frame
2. Calcular tiempo global escalado
3. Rotar campo estelar (efecto de profundidad)
4. Actualizar estado de todos los tweens activos
5. Renderizar escena con estado actualizado

**TWEEN.update():**
- Avanza todos los tweens activos
- Ejecuta callbacks `onUpdate`
- Maneja transiciones de cadena (`.chain()`)
- Aplica funciones de easing

---


### Estructura de Archivos

```
proyecto/
├── src/
│   └── main.js           # Código principal (único archivo)
├── index.html
├── package.json
└── README.md
```

**Nota:** Fuente Helvetiker se carga desde CDN de Three.js (sin assets locales)

---

## Tecnologías

- **Three.js (r150):** Renderizado WebGL 3D
- **Tween.js (@tweenjs/tween.js):** Sistema de animación por interpolación
- **FontLoader:** Cargador de fuentes tipográficas 3D
- **TextGeometry:** Generador de geometría de texto 3D
- **JavaScript ES6+:** Sintaxis moderna

---

## Características Técnicas Destacadas

### Sistema de Timing Cinemático

**Duración de cada fase:**
```
Clash:        1.6s  ████████████████
Exit:         0.7s  ███████
TitleIn:      1.3s  █████████████
Hold:         1.2s  ████████████
TitleOut:     1.0s  ██████████
Flash:        0.36s ███ (paralelo a Clash)
────────────────────────────────────
Total:        ~6.8s (bucle completo)
```

**Sincronización perfecta:**
- Tweens encadenados con `.chain()`
- Callbacks `onComplete` para eventos dependientes
- Flash independiente disparado por callback, no por cadena
- Sin race conditions ni gaps temporales

### Easings Estratégicos

**Cubic.InOut (Clash):**
```
Velocidad
  ▲
  │     ╱────╲
  │    ╱      ╲
  │   ╱        ╲
  │  ╱          ╲
  └──────────────▶ Tiempo
```
Aceleración suave → velocidad constante → desaceleración suave

**Cubic.In (Exit, TitleOut):**
```
Velocidad
  ▲          ╱
  │         ╱
  │        ╱
  │       ╱
  │      ╱
  └──────────────▶ Tiempo
```
Inicio lento, aceleración dramática (salida explosiva)

**Cubic.Out (Flash, TitleIn):**
```
Velocidad
  ▲╲
  │ ╲
  │  ╲
  │   ╲
  │    ╲____
  └──────────────▶ Tiempo
```
Inicio rápido, desaceleración suave (llegada elegante)

### Optimizaciones de Rendimiento

**Geometrías reutilizadas:**
```javascript
const bladeGeo = new THREE.CylinderGeometry(...);  // Una instancia
const blueMat = new THREE.MeshPhongMaterial(...);  // Material único

// Múltiples meshes comparten geometría
const blueBlade = new THREE.Mesh(bladeGeo, blueMat);
```

**Luces eficientes:**
- ClashLight con intensity=0 cuando inactiva (no calcula iluminación)
- Solo 2 PointLights en escena (límite razonable para rendimiento)
- AmbientLight es computacionalmente barata (sin cálculos direccionales)

**Sistema de partículas:**
- 1000 puntos vs 1000 meshes = ~100× más eficiente
- `Points` usa un solo draw call para todos los vértices
- Sin materiales individuales ni transformaciones de objeto

### Cálculo de Colisión Matemático

**Vectores direccionales:**
```javascript
// Posición base de empuñadura
basePos = (-1.3, -1.2)  // o (1.3, -1.2) para rojo

// Vector desde punto de choque hacia base
dir = normalize(basePos - CLASH)

// Posición final: punto de choque + vector × distancia de hoja
finalPos = CLASH + dir × (BLADE_LENGTH / 2)
```

**Resultado:**
- Hojas exactamente a 2 unidades del punto de choque
- Ángulo de aproximación natural (no perpendicular artificial)
- Matemática vectorial pura sin hardcoding

### Responsive Design

```javascript
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
```

**Adaptación:**
- Mantiene proporciones correctas en cualquier aspect ratio
- Sin distorsión de objetos
- Renderer escala sin pérdida de resolución efectiva

---

## Funciones Principales

### `createLightsabers()`
Construye los dos sables (azul y rojo) con hojas y empuñaduras.
- Crea geometrías compartidas
- Aplica materiales emisivos (Phong) y metálicos (Standard)
- Agrupa componentes en jerarquía

### `resetSabers(blue, red)`
Restaura sables a posiciones iniciales fuera de escena.
- Posición: (-6, -3, 0) y (6, -3, 0)
- Rotación: (0, 0, 0)
- Llamada en `onComplete` de `titleOutTween`

### `createAnimationSequence()`
Configura y encadena todos los tweens del ciclo.
- Define parámetros de animación
- Crea 5 tweens encadenados
- Establece callbacks
- Inicia bucle infinito

### `startClashFlash()`
Dispara efecto visual de choque (luz + haz).
- Tween independiente con yoyo
- 180ms de fade-in/out
- Sincronizado con fin de `clashTween`

### `loadTitleFont()`
Carga fuente Helvetiker desde CDN y genera texto 3D.
- Asíncrono (no bloquea init)
- Callback crea geometría de texto
- Maneja errores de carga

### `createTitleText(font)`
Genera meshes 3D de "INFORMATICA GRAFICA".
-
