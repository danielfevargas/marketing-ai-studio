# Studio IA — Generación de Imágenes y Edición de Contenido

Aplicación web para equipos de marketing y publicidad que permite generar imágenes
con IA a partir de descripciones de texto, editar y mejorar contenido escrito con IA,
y colaborar en equipo con un sistema de roles y permisos.

## Qué hace la aplicación

**Generación de imágenes**
- Describe una imagen en texto y elige un estilo (anime, óleo, realismo, acuarela, cyberpunk)
- Las imágenes generadas se guardan en una galería compartida por todo el equipo
- Las imágenes pueden descargarse directamente desde la galería

**Edición de contenido**
- Cada pieza de contenido vive dentro de un "proyecto" (una campaña, por ejemplo)
- Un texto puede resumirse, expandirse, corregirse (gramática/estilo), o generar una variación
- Cada operación crea una nueva versión; nada se sobreescribe
- Cualquier versión anterior puede restaurarse sin perder el historial completo

**Colaboración**
- Varios usuarios pueden trabajar al mismo tiempo, cada uno con su propia cuenta
- Cada proyecto tiene su propio hilo de comentarios
- Un administrador gestiona los roles de todo el equipo desde una pantalla dentro de la app

**Roles y permisos**
| Rol | Generar imágenes | Editar contenido | Aprobar | Comentar |
|---|---|---|---|---|
| designer | ✅ | ❌ | ❌ | ✅ |
| writer | ❌ | ✅ | ❌ | ✅ |
| approver | ❌ | ❌ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |

"Aprobar" marca una imagen o una versión de contenido como lista para publicación,
sin borrar ni modificar el contenido — solo cambia su estado visual (etiqueta "Aprobado").

**Moderación**
Todo prompt de imagen y todo texto pasa por un filtro antes de llegar al modelo de IA.
Los términos prohibidos bloquean la solicitud; los términos sensibles la marcan para
revisión sin bloquearla.

## Tecnología usada

| Función | Servicio | Por qué |
|---|---|---|
| Generación de imágenes | Hugging Face (Inference Providers) | Gratis, sin necesidad de GPU propia |
| Edición de texto | Groq (LLaMA 3.3 70B) | Gratis y muy rápido, cumple el rol de Claude |
| Base de datos, autenticación y almacenamiento | Supabase | Gratis (free tier), todo en un solo lugar |
| Backend | FastAPI (Python) | Lógica de negocio, moderación, permisos |
| Frontend | React + Vite | Interfaz de usuario |

> Nota: esta es la versión funcional del proyecto, construida con herramientas gratuitas.
> El mapeo conceptual a una arquitectura de producción con Amazon Bedrock (tal como lo
> pide el enunciado original) está en un documento aparte, no en este código.

## Estructura del proyecto

```
marketing-ai-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # punto de entrada de la API
│   │   ├── config.py            # variables de entorno
│   │   ├── dependencies.py      # autenticación y permisos por rol
│   │   ├── routers/             # endpoints: images, content, collaboration, users, projects
│   │   └── services/            # integraciones: huggingface, groq, supabase, moderación
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/               # GenerateImage, Gallery, ProjectWorkspace, Admin, Login
│       ├── components/          # Sidebar, Comments
│       └── lib/                 # cliente de Supabase, cliente de la API, contexto de auth
└── supabase/
    └── schema.sql               # tablas, roles y seguridad a nivel de fila
```

## Cómo ejecutarlo

### 1. Supabase
1. Crea un proyecto en https://supabase.com
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Storage** → crea un bucket llamado `generated-images` con **Public bucket** activado
4. En **Project Settings → API**, copia: `Project URL`, `anon key` (frontend) y
   `service_role key` (backend, nunca se expone al navegador)

### 2. Hugging Face
1. Crea cuenta en https://huggingface.co
2. Genera un token en **Settings → Access Tokens** (permiso "Read" es suficiente)

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
Crea un archivo `.env` en `backend/` con:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key
HF_API_TOKEN=tu-token-de-huggingface
HF_MODEL_ID=black-forest-labs/FLUX.1-schnell
GROQ_API_KEY=tu-key-de-groq
ALLOWED_ORIGINS=http://localhost:5173
```
Levanta el servidor:
```bash
uvicorn app.main:app --reload --port 8000
```
Documentación interactiva en `http://localhost:8000/docs`.

### 5. Frontend
```bash
cd frontend
npm install
```
Crea un archivo `.env` en `frontend/` con:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_API_URL=http://localhost:8000
```
Levanta la aplicación:
```bash
npm run dev
```
Abre `http://localhost:5173`.

## Primer uso

Todo usuario nuevo se registra con rol `writer` por defecto. Para acceder al panel de
administración ("Usuarios y roles") necesitas al menos una cuenta con rol `admin`.

Para crear el primer administrador (solo la primera vez):
1. Regístrate normalmente en la app
2. Ve a Supabase → **Table Editor → profiles**
3. Busca tu usuario y cambia manualmente el campo `role` a `admin`
4. Cierra sesión y vuelve a entrar en la app

Desde ahí, ya puedes asignar roles a los demás usuarios directamente desde la app,
sin volver a tocar Supabase.
