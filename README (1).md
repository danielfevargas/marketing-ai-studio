# Studio IA — Generación de Imágenes y Edición de Contenido

Aplicación web para equipos de marketing y publicidad. Permite generar imágenes
con IA a partir de descripciones de texto, editar y mejorar contenido escrito
con IA, y colaborar organizados por **equipos** con roles y permisos.

## Qué hace la aplicación

### Equipos
- Cada usuario pertenece a **un equipo**. Al registrarte, puedes **crear un
  equipo nuevo** (quedas como `admin` automáticamente) o **unirte a uno
  existente** con un código de invitación de 6 caracteres.
- Todo lo que se genera (imágenes, proyectos, comentarios, versiones de
  contenido) queda aislado por equipo — un equipo nunca ve los datos de otro.
- Cualquier integrante puede **salir** del equipo. Un `admin` puede además
  **eliminar el equipo por completo** (con confirmación, borra todo su
  contenido de forma permanente).
- Desde "Equipo", un `admin` ve el código de invitación para compartirlo y
  puede cambiar el rol de cualquier integrante.

### Generación de imágenes
- Describe una imagen en texto y elige un estilo (anime, óleo, realismo,
  acuarela, cyberpunk).
- Las imágenes generadas se guardan en la galería de tu equipo.
- Se pueden descargar directamente desde la galería.

### Edición de contenido
- Cada pieza de contenido vive dentro de un "proyecto" (una campaña).
- Un texto puede resumirse, expandirse, corregirse (gramática/estilo), o
  generar una variación.
- Cada operación crea una nueva versión; nada se sobreescribe.
- Cualquier versión anterior puede restaurarse sin perder el historial.

### Colaboración
- Varios usuarios del mismo equipo pueden trabajar al mismo tiempo.
- Cada proyecto tiene su propio hilo de comentarios.

### Roles y permisos (dentro de cada equipo)
| Rol | Generar imágenes | Editar contenido | Aprobar | Comentar | Gestionar equipo |
|---|---|---|---|---|---|
| designer | ✅ | ❌ | ❌ | ✅ | ❌ |
| writer | ❌ | ✅ | ❌ | ✅ | ❌ |
| approver | ❌ | ❌ | ✅ | ✅ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ | ✅ |

"Aprobar" marca una imagen o una versión de contenido como lista para
publicación, sin borrar ni modificar el contenido — solo cambia su estado
visual (etiqueta "Aprobado").

### Moderación
Todo prompt de imagen y todo texto pasa por un filtro antes de llegar al
modelo de IA. Los términos prohibidos bloquean la solicitud; los términos
sensibles la marcan para revisión sin bloquearla.

## Interfaz

- Tema oscuro, sidebar colapsable (icono de flechas para achicar a solo
  iconos), y una pantalla de inicio (Dashboard) con resumen de actividad del
  equipo y accesos rápidos según tu rol.
- Estados de carga tipo "skeleton" y estados vacíos ilustrados en toda la app.

## Seguridad implementada

- **Autenticación**: Supabase Auth (JWT), contraseñas hasheadas, nunca
  gestionadas directamente por el backend.
- **Separación de credenciales**: el frontend usa la `anon key` (pública,
  limitada); el backend usa la `service_role key` (privilegiada, nunca
  expuesta al navegador).
- **Aislamiento multi-tenant por equipo**: cada fila de datos lleva
  `team_id`; el backend valida en cada endpoint que el recurso solicitado
  pertenezca al equipo del usuario autenticado — no solo al listar, también
  al editar/comentar/aprobar un proyecto específico.
- **Autorización por rol**: cada acción valida el rol del usuario *dentro de
  su equipo* antes de ejecutarse (`dependencies.py`).
- **Row Level Security (RLS)** activado en todas las tablas de Supabase,
  como segunda capa de defensa.
- **Moderación de contenido** antes de llegar a los modelos de IA.
- **Cifrado** en tránsito (HTTPS en Vercel/Render/Supabase) y en reposo
  (gestionado por la infraestructura de Supabase).
- **Trazabilidad**: toda versión de contenido y comentario queda asociado a
  su autor y fecha; nada es anónimo.

## Tecnología usada

| Función | Servicio | Por qué |
|---|---|---|
| Generación de imágenes | Hugging Face (Inference Providers) | Gratis, sin GPU propia |
| Edición de texto | Groq (LLaMA 3.3 70B) | Gratis, muy rápido, cumple el rol de Claude |
| Base de datos, autenticación y storage | Supabase | Gratis (free tier) |
| Backend | FastAPI (Python) | Lógica de negocio, moderación, permisos, equipos |
| Frontend | React + Vite | Interfaz de usuario |
| Iconos | lucide-react | Set de iconos consistente |
| Despliegue backend | Render | Gratis |
| Despliegue frontend | Vercel | Gratis |

> Nota: esta es la versión funcional del proyecto, construida con
> herramientas gratuitas. El mapeo conceptual a una arquitectura de
> producción con Amazon Bedrock (tal como lo pide el enunciado original de
> la empresa de marketing) está documentado por separado en
> `Documento_Arquitectura_Bedrock.docx`, junto con las políticas de uso
> ético en `Politicas_Uso_Etico_IA.docx`.

## Estructura del proyecto

```
marketing-ai-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # punto de entrada de la API
│   │   ├── config.py            # variables de entorno
│   │   ├── dependencies.py      # autenticación, equipos y permisos por rol
│   │   ├── routers/
│   │   │   ├── teams.py         # crear/unirse/salir/eliminar equipo, miembros
│   │   │   ├── images.py        # generación y galería
│   │   │   ├── content.py       # edición, historial, revertir, aprobar
│   │   │   ├── projects.py      # proyectos por equipo
│   │   │   └── collaboration.py # comentarios
│   │   └── services/            # huggingface, groq, supabase, moderación
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── TeamOnboarding.jsx   # crear/unirse a equipo
│       │   ├── Dashboard.jsx        # pantalla de inicio
│       │   ├── GenerateImage.jsx
│       │   ├── Gallery.jsx
│       │   ├── ProjectWorkspace.jsx
│       │   └── Team.jsx             # roster del equipo, roles, invitación
│       ├── components/          # Sidebar, Comments
│       └── lib/                 # supabaseClient, api, AuthContext
└── supabase/
    └── schema.sql               # tablas, roles, equipos y RLS
```

## Cómo ejecutarlo

### 1. Supabase
1. Crea un proyecto en https://supabase.com
2. Ve a **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`
3. Ve a **Storage** → crea un bucket llamado `generated-images` con
   **Public bucket** activado
4. En **Project Settings → API**, copia: `Project URL`, `anon key`
   (frontend) y `service_role key` (backend)

### 2. Hugging Face
1. Crea cuenta en https://huggingface.co
2. Genera un token en **Settings → Access Tokens** (permiso "Read" basta)

### 3. Groq
1. Crea cuenta en https://console.groq.com
2. Genera una API key en **API Keys**

### 4. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
Crea `backend/.env`:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key
HF_API_TOKEN=tu-token-de-huggingface
HF_MODEL_ID=black-forest-labs/FLUX.1-schnell
GROQ_API_KEY=tu-key-de-groq
ALLOWED_ORIGINS=http://localhost:5173
```
```bash
uvicorn app.main:app --reload --port 8000
```
Docs interactivas en `http://localhost:8000/docs`.

### 5. Frontend
```bash
cd frontend
npm install
```
Crea `frontend/.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:8000
```
```bash
npm run dev
```
Abre `http://localhost:5173`.

## Primer uso

1. Regístrate normalmente.
2. La app te pedirá **crear un equipo nuevo** (quedas como `admin`) o
   **unirte a uno** con un código de invitación.
3. Como `admin`, ve a "Equipo" para copiar el código de invitación y
   compartirlo con tu equipo, o para cambiar el rol de cualquier integrante.

## Despliegue

- **Backend** en [Render](https://render.com): Root Directory `backend`,
  Build Command `pip install -r requirements.txt`, Start Command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Variables de entorno
  iguales a las del `.env` local, más `ALLOWED_ORIGINS` con la URL de
  producción del frontend.
- **Frontend** en [Vercel](https://vercel.com): Root Directory `frontend`.
  Variables de entorno iguales a las del `.env` local, con `VITE_API_URL`
  apuntando a la URL de Render. Requiere un archivo `frontend/vercel.json`
  con:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
  (necesario porque es una SPA con rutas manejadas por React Router).

> El plan gratuito de Render duerme el servicio tras ~15 min de inactividad;
> la primera petición después de eso tarda 30-50s en responder.
