# Prompt para Claude Code — Espejo Emocional App

## Contexto del proyecto

Este es un proyecto React + HeroUI (antes NextUI) ya inicializado. La base del proyecto ya existe — NO crear un nuevo proyecto, trabajar sobre la estructura existente.

---

## Instrucción principal

Implementa la lógica completa de una aplicación móvil-first llamada **"Espejo Emocional"** — una herramienta de introspección guiada que ayuda a las personas a reconocer cómo los conflictos externos activan procesos internos, y cómo su relación con esas emociones influye en su malestar.

---

## Stack técnico

- **Framework:** React (ya instalado)
- **UI Library:** HeroUI (ya instalado) — usar sus componentes: `Button`, `Card`, `CardBody`, `CardHeader`, `Input`, `Textarea`, `Progress`, `Modal`, `Chip`, `Divider`, `Avatar`, `Tabs`, `Tab`
- **Estado:** React Context + useReducer (NO instalar Redux ni Zustand)
- **Persistencia local:** `localStorage` para guardar sesiones de reflexión del usuario
- **Animaciones:** Framer Motion (`framer-motion`) — instalar si no está presente
- **Routing:** React Router DOM (`react-router-dom`) — instalar si no está presente
- **IA / LLM:** Anthropic API vía `fetch` al endpoint `https://api.anthropic.com/v1/messages` — la API key se pasa por variable de entorno `VITE_ANTHROPIC_API_KEY`

---

## Arquitectura de la aplicación

### Estructura de carpetas

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx          # Layout principal mobile-first con nav
│   │   └── BottomNav.jsx         # Navegación inferior (Inicio, Reflexión, Historial, Perfil)
│   ├── reflection/
│   │   ├── ReflectionFlow.jsx    # Orquestador del flujo de 6 capas
│   │   ├── LayerCard.jsx         # Componente genérico de cada capa
│   │   ├── LayerNarrative.jsx    # Capa 1: Narrativa externa
│   │   ├── LayerEmotion.jsx      # Capa 2: Reacción emocional
│   │   ├── LayerResonance.jsx    # Capa 3: Resonancia interna
│   │   ├── LayerPattern.jsx      # Capa 4: Patrón recurrente
│   │   ├── LayerRelationship.jsx # Capa 5: Relación con la emoción
│   │   ├── LayerInsight.jsx      # Capa 6: Insight / espejo
│   │   ├── MirrorSummary.jsx     # Resumen final generado por IA
│   │   └── ProgressIndicator.jsx # Barra visual de progreso entre capas
│   ├── home/
│   │   ├── HomeScreen.jsx        # Pantalla de inicio con saludo + acceso rápido
│   │   └── DailyPrompt.jsx       # Prompt introspectivo diario (rotativo)
│   ├── history/
│   │   ├── HistoryList.jsx       # Lista de reflexiones pasadas
│   │   └── ReflectionDetail.jsx  # Detalle de una reflexión guardada
│   └── profile/
│       └── ProfileScreen.jsx     # Configuración básica (nombre, preferencias)
├── context/
│   ├── ReflectionContext.jsx     # Estado global de la reflexión activa
│   └── UserContext.jsx           # Datos del usuario y preferencias
├── hooks/
│   ├── useReflection.js          # Hook para manejar el flujo de reflexión
│   ├── useAIInsight.js           # Hook para llamadas a la API de Anthropic
│   └── useLocalStorage.js        # Hook genérico de persistencia
├── services/
│   ├── anthropicService.js       # Servicio de llamadas a Claude API
│   └── storageService.js         # CRUD de reflexiones en localStorage
├── utils/
│   ├── prompts.js                # System prompts y templates para Claude
│   ├── emotions.js               # Catálogo de emociones con descripciones
│   └── dailyPrompts.js           # Array de prompts introspectivos diarios
├── pages/
│   ├── Home.jsx
│   ├── Reflect.jsx
│   ├── History.jsx
│   └── Profile.jsx
├── App.jsx                       # Router + Providers
└── main.jsx
```

---

## Modelo de datos

### Reflexión (objeto que se guarda en localStorage)

```js
{
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  layers: {
    narrative: {
      situation: "",      // ¿Qué pasó?
      people: "",         // ¿Quién estuvo involucrado?
      context: ""         // ¿Dónde / cuándo?
    },
    emotion: {
      primary: "",        // Emoción principal (de un catálogo)
      secondary: [],      // Emociones secundarias
      intensity: 5,       // 1-10
      bodyLocation: ""    // ¿Dónde lo sientes en el cuerpo?
    },
    resonance: {
      whatTouches: "",     // ¿Qué de esto te toca personalmente?
      coreNeed: ""        // ¿Qué necesidad profunda se activa?
    },
    pattern: {
      hasHappenedBefore: null,  // boolean
      when: "",                  // Descripción de cuándo
      commonThread: ""           // ¿Qué tienen en común?
    },
    relationship: {
      stance: "",         // "aferrándome" | "evitando" | "resistiendo" | "observando" | "otro"
      description: ""     // Cómo se siente esa relación
    },
    insight: {
      mirror: "",         // ¿Qué podrías estar viendo de ti mismo?
      intention: ""       // ¿Con qué intención quieres avanzar?
    }
  },
  aiSummary: null,        // Resumen generado por Claude (se llena al final)
  completed: false
}
```

### Catálogo de emociones (`utils/emotions.js`)

```js
export const EMOTIONS = [
  { id: "tristeza", label: "Tristeza", color: "#5B7FA5", icon: "💧", description: "Sensación de pérdida o vacío" },
  { id: "rabia", label: "Rabia", color: "#C1512D", icon: "🔥", description: "Energía intensa ante una injusticia o límite cruzado" },
  { id: "miedo", label: "Miedo", color: "#6B5B73", icon: "🌑", description: "Señal de amenaza o incertidumbre" },
  { id: "vergüenza", label: "Vergüenza", color: "#A0522D", icon: "🫣", description: "Sensación de exposición o inadecuación" },
  { id: "frustración", label: "Frustración", color: "#D4764E", icon: "⛓️", description: "Deseo bloqueado o expectativa no cumplida" },
  { id: "ansiedad", label: "Ansiedad", color: "#8B8589", icon: "🌀", description: "Anticipación de algo que aún no sucede" },
  { id: "culpa", label: "Culpa", color: "#556B2F", icon: "⚖️", description: "Sensación de haber actuado contra tus valores" },
  { id: "soledad", label: "Soledad", color: "#4A5568", icon: "🏔️", description: "Desconexión de los demás o de ti mismo" },
  { id: "impotencia", label: "Impotencia", color: "#708090", icon: "🪨", description: "Sensación de no poder cambiar lo que duele" },
  { id: "decepción", label: "Decepción", color: "#B8860B", icon: "💔", description: "Expectativa rota sobre alguien o algo" },
  { id: "envidia", label: "Envidia", color: "#2E8B57", icon: "🪞", description: "Deseo por lo que otro tiene o es" },
  { id: "ternura", label: "Ternura", color: "#DEB887", icon: "🤲", description: "Suavidad y cuidado hacia algo vulnerable" }
];
```

---

## Flujo principal: Las 6 capas de reflexión

El componente `ReflectionFlow.jsx` orquesta un wizard de 6 pasos. Cada capa es un componente independiente que recibe `onNext(data)` y `onBack()`.

### Comportamiento de cada capa

**Capa 1 — Narrativa externa (`LayerNarrative.jsx`)**
- Título: "¿Qué sucedió?"
- Subtítulo: "Describe la situación, sin juzgarla aún."
- Campos: `Textarea` para situación, `Input` para personas involucradas, `Input` para contexto
- Transición: fade suave al siguiente paso

**Capa 2 — Reacción emocional (`LayerEmotion.jsx`)**
- Título: "¿Qué sentiste?"
- Subtítulo: "Nombrar lo que sientes es el primer acto de consciencia."
- UI: Grid de `Chip` seleccionables con las emociones del catálogo (selección múltiple, la primera es la primaria)
- Slider de intensidad (1-10) usando un `input[type=range]` estilizado
- `Input` para ubicación corporal ("¿Dónde lo sientes en tu cuerpo?")

**Capa 3 — Resonancia interna (`LayerResonance.jsx`)**
- Título: "¿Qué de esto te toca?"
- Subtítulo: "Más allá de lo que pasó afuera, ¿qué se mueve adentro?"
- Campos: `Textarea` para lo que toca personalmente, `Textarea` para necesidad profunda
- Incluir una pequeña nota orientativa: "Algunas necesidades comunes: reconocimiento, seguridad, pertenencia, autonomía, ser visto, control, amor"

**Capa 4 — Patrón recurrente (`LayerPattern.jsx`)**
- Título: "¿Esto te ha pasado antes?"
- Subtítulo: "Los patrones nos muestran dónde hay algo pendiente."
- Toggle Sí/No (usar `Button` group)
- Si "Sí": `Textarea` para describir cuándo, `Textarea` para el hilo común

**Capa 5 — Relación con la emoción (`LayerRelationship.jsx`)**
- Título: "¿Cómo te estás relacionando con esto?"
- Subtítulo: "No es lo que sientes, sino cómo te posicionas ante lo que sientes."
- Opciones seleccionables (estilo cards): Aferrándome, Evitando, Resistiendo, Observando, Otro
- Cada opción con una breve descripción
- `Textarea` para expandir

**Capa 6 — Insight / Espejo (`LayerInsight.jsx`)**
- Título: "¿Qué podrías estar viendo de ti mismo?"
- Subtítulo: "La situación externa a veces es un espejo de algo interno."
- `Textarea` para el insight
- `Textarea` para intención ("¿Con qué intención quieres avanzar desde aquí?")

### Después de la capa 6 → `MirrorSummary.jsx`

Al completar todas las capas, hacer una llamada a la API de Claude para generar un resumen empático y profundo.

---

## Integración con Claude API (`services/anthropicService.js`)

```js
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function generateMirrorSummary(reflectionData) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: MIRROR_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildReflectionPrompt(reflectionData)
        }
      ]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

### System prompt para el resumen (`utils/prompts.js`)

```js
export const MIRROR_SYSTEM_PROMPT = `Eres un acompañante introspectivo profundo. Tu rol es devolver al usuario un reflejo empático, respetuoso y revelador de lo que ha compartido en su proceso de reflexión.

Principios:
- NUNCA juzgues, diagnostiques ni etiquetes al usuario
- NUNCA sugieras que el usuario "está mal" o necesita "arreglarse"
- Usa un tono cálido, pausado, casi meditativo
- Habla en segunda persona (tú)
- Sé breve pero profundo (máximo 250 palabras)
- Conecta los puntos entre las capas sin forzar conclusiones
- Si identificas un patrón, ofrécelo como pregunta, no como afirmación
- Honra la vulnerabilidad del usuario
- Termina con una invitación suave a seguir observando, no con un consejo

Formato de respuesta:
- Un párrafo de reflejo (lo que pareces estar viviendo)
- Una o dos preguntas que inviten a profundizar
- Una frase de cierre que honre el proceso`;

export function buildReflectionPrompt(data) {
  const { layers } = data;
  return `El usuario completó un proceso de reflexión con las siguientes capas:

**Narrativa:** ${layers.narrative.situation}
Personas involucradas: ${layers.narrative.people}
Contexto: ${layers.narrative.context}

**Emoción principal:** ${layers.emotion.primary} (intensidad ${layers.emotion.intensity}/10)
Emociones secundarias: ${layers.emotion.secondary.join(", ")}
Ubicación corporal: ${layers.emotion.bodyLocation}

**Resonancia interna:** ${layers.resonance.whatTouches}
Necesidad profunda: ${layers.resonance.coreNeed}

**Patrón:** ${layers.pattern.hasHappenedBefore ? "Sí, esto ha pasado antes: " + layers.pattern.when + ". Hilo común: " + layers.pattern.commonThread : "No identifica un patrón previo."}

**Relación con la emoción:** ${layers.relationship.stance} — ${layers.relationship.description}

**Insight del usuario:** ${layers.insight.mirror}
Intención: ${layers.insight.intention}

Genera un reflejo empático basado en toda esta información.`;
}
```

---

## Diseño y UX

### Paleta de colores (definir como CSS variables en `index.css`)
- `--color-bg`: `#F5F0EB` (crema cálido)
- `--color-surface`: `#FFFFFF`
- `--color-text`: `#2D2A26`
- `--color-text-soft`: `#6B6560`
- `--color-accent`: `#8B6F5C` (tierra cálida)
- `--color-accent-light`: `#C4A882`
- `--color-border`: `#E8E0D8`
- `--color-highlight`: `#D4A574` (para estados activos)

### Tipografía
- Importar de Google Fonts: `Cormorant Garamond` (títulos) y `Source Sans 3` (cuerpo)
- Títulos de capa: `Cormorant Garamond`, 28px, weight 500
- Subtítulos orientativos: `Source Sans 3`, 16px, italic, color `--color-text-soft`
- Cuerpo: `Source Sans 3`, 16px, weight 400

### Animaciones (Framer Motion)
- Transición entre capas: `AnimatePresence` con fade + slide vertical suave (y: 20, opacity: 0 → y: 0, opacity: 1), duración 0.5s, ease "easeOut"
- Entrada de cada card: stagger de 100ms entre elementos
- Barra de progreso: animación spring al avanzar
- Al mostrar el resumen de IA: typing effect o fade-in palabra por palabra

### Layout mobile-first
- Max-width: 480px, centrado
- Padding horizontal: 20px
- Bottom navigation con 4 tabs (Inicio, Reflexión, Historial, Perfil) usando iconos simples
- Cada capa ocupa la pantalla completa con scroll si es necesario
- Botones "Continuar" y "Atrás" fijos en la parte inferior de cada capa

---

## Pantallas adicionales

### Home (`HomeScreen.jsx`)
- Saludo personalizado con el nombre del usuario (o "Hola" genérico si no hay nombre)
- Prompt introspectivo del día (rotativo, de un array de 30+)
- Botón principal: "Iniciar reflexión"
- Resumen: "Llevas X reflexiones" (conteo de localStorage)
- Última reflexión: mini-card con fecha y emoción principal

### Historial (`HistoryList.jsx`)
- Lista de reflexiones ordenadas por fecha (más reciente primero)
- Cada item muestra: fecha, emoción principal (con color/icon), primeras palabras de la narrativa
- Al tocar: abre `ReflectionDetail.jsx` con todas las capas + resumen de IA

### Perfil (`ProfileScreen.jsx`)
- Campo para nombre del usuario
- Toggle: "Recibir prompt diario" (para futuro)
- Botón: "Borrar todos mis datos" (con confirmación)
- Texto informativo sobre privacidad: "Tus reflexiones se guardan solo en tu dispositivo"

---

## Notas de implementación importantes

1. **Manejo de errores en API:** Si la llamada a Claude falla, mostrar un mensaje empático: "No pudimos generar tu reflejo en este momento. Tu reflexión ha sido guardada." y guardar la reflexión sin `aiSummary`.

2. **Responsive:** Aunque es mobile-first, debe verse bien en desktop (max-width centrado con fondo extendido).

3. **Accesibilidad:** Labels en todos los inputs, contraste adecuado, navegación por teclado funcional.

4. **Sin dependencias innecesarias:** Solo instalar `framer-motion` y `react-router-dom` si no están. Todo lo demás se resuelve con HeroUI + React.

5. **Prompts diarios (`utils/dailyPrompts.js`):** Incluir al menos 30 prompts introspectivos en español. Ejemplos:
   - "¿Qué emoción has estado evitando hoy?"
   - "Si tu cuerpo pudiera hablar, ¿qué te diría en este momento?"
   - "¿Qué necesitas que nadie te ha preguntado?"
   - "¿A qué le tienes miedo realmente?"
   - "¿Qué parte de ti necesita más compasión hoy?"

---

## Orden de implementación sugerido

1. Configurar rutas y layout (`App.jsx`, `AppShell`, `BottomNav`)
2. Implementar contextos (`ReflectionContext`, `UserContext`)
3. Implementar hooks y servicios (`useLocalStorage`, `storageService`, `anthropicService`)
4. Construir el flujo de reflexión completo (6 capas + resumen)
5. Implementar Home, Historial y Perfil
6. Aplicar estilos, tipografía y animaciones
7. Testing manual del flujo completo
