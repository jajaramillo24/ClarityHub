<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ClarityHub - AI-Powered Project Management

ClarityHub es una aplicación de gestión de proyectos potenciada por IA que te ayuda a organizar ideas, analizar requisitos no funcionales, y generar tarjetas de proyecto detalladas.

## Características

- 🧠 **Free Jam Session**: Captura y organiza ideas libremente
- 📄 **Análisis de Documentos**: Word (.doc/.docx), Excel (.xls/.xlsx) e imágenes como contexto para la IA
- 🛡️ **Análisis de NFRs**: Define y analiza requisitos no funcionales
- 📋 **Generación de Tarjetas**: Crea tarjetas de proyecto detalladas con estimaciones
- 📊 **Exportación a Jira**: Exporta historias y subtareas en formato CSV optimizado para Jira
  - ✅ Incluye subtareas como issues separadas
  - ✅ Prioridad automática basada en story points
  - ✅ Campos estándar de Jira (Summary, Description, Issue Type, Priority, Labels, Parent ID)
  - ✅ Mapeo automático de relaciones padre-hijo para subtareas

## Arquitectura

Frontend (React + Vite) hablando exclusivamente con un **backend distribuido** de 4
microservicios NestJS detrás de un API Gateway — ninguna llamada a IA ni escritura
de datos ocurre en el navegador:

```
Frontend ──▶ api-gateway ──┬──▶ idea-board-service ──────▶ MySQL (idea_board)
                            ├──▶ structure-service ───────▶ MySQL (structure)
                            ├──▶ jira-exporter-service ──▶ MySQL (jira_exporter)
                            │        │
                            │        └── llama a structure-service (HTTP)
                            └──▶ RabbitMQ ──▶ requirement-refiner-service ──▶ Anthropic Claude
```

- **idea-board-service**: ideas y adjuntos. Sigue funcionando aunque el resto del
  sistema esté caído.
- **requirement-refiner-service**: el único punto que depende de un proveedor de IA
  externo (Claude). Aislado detrás de RabbitMQ — si falla o tarda, el resto de la
  app no se ve afectado.
- **structure-service**: jerarquía del backlog (épicas, historias, subtareas, NFRs).
- **jira-exporter-service**: genera el CSV de exportación a partir de lo ya
  estructurado, con reintentos si falla.
- **api-gateway**: único punto de entrada para el frontend — proxy transparente
  hacia los tres servicios REST, traduce las llamadas de IA a RPC sobre RabbitMQ.

Cada servicio del backend documenta su propia API en su `README.md`
(`backend/<servicio>/README.md`).

## Tecnología

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS 11 (microservicios) + Prisma ORM + MySQL + RabbitMQ
- **IA**: Anthropic Claude (`claude-opus-5`), vía `requirement-refiner-service`

## Run Locally

### Todo el stack con Docker Compose (recomendado)

**Prerequisites:** Docker, Docker Compose, una API key de Anthropic.

```bash
cp .env.example .env    # VITE_API_URL=http://localhost:3000 ya viene por defecto
ANTHROPIC_API_KEY=tu-api-key-aqui docker compose up --build
```

Esto levanta los 4 microservicios + api-gateway + RabbitMQ + una instancia de
MySQL por servicio. El frontend (`npm run dev`, ver abajo) apunta a
`http://localhost:3000` (api-gateway) por defecto.

### Solo el frontend

**Prerequisites:** Node.js, el backend corriendo (Docker Compose o cada servicio
manualmente — ver `backend/<servicio>/README.md`).

```bash
npm install
cp .env.example .env   # ajustá VITE_API_URL si el gateway no está en localhost:3000
npm run dev
```

## Despliegue en GitHub Pages

El proyecto se despliega automáticamente en GitHub Pages cuando haces push a la rama `main`. Solo el frontend se despliega ahí — el backend se despliega por separado (ver `backend/README` de cada servicio, y Railway para producción).

### Configurar el Secret en GitHub:

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Nombre: `VITE_API_URL`
5. Value: la URL pública de tu `api-gateway` desplegado (por ejemplo, en Railway)
6. Haz clic en **Add secret**

El workflow de GitHub Actions (`.github/workflows/deploy.yml`) usa este secret como `VITE_API_URL` durante el build.

### Desplegar Manualmente:

También puedes desplegar manualmente con:
```bash
npm run deploy
```

## Exportación a Jira

ClarityHub incluye una funcionalidad completa de exportación a Jira que permite:

1. **Exportar historias de usuario** con todos sus campos estándar
2. **Incluir subtareas automáticamente** como issues separadas vinculadas
3. **Configurar columnas** según las necesidades de tu proyecto

### Características de Exportación:

- **Subtareas inteligentes**: Cada subtarea se exporta como un "Sub-task" en Jira con referencia a su historia padre
- **Prioridad automática**: Se calcula basándose en story points (High: >13, Medium: 6-13, Low: ≤5)
- **Tipos de subtareas**: Backend, Frontend, Testing, DevOps, Docs
- **Campos personalizables**: Activa/desactiva columnas según tu configuración de Jira
- **Múltiples delimitadores**: Soporta coma (`,`) y punto y coma (`;`)
- **Reintentos**: si `structure-service` no está disponible al exportar, el intento queda
  registrado como fallido y se puede reintentar sin perder el backlog ya estructurado
  (ver `backend/jira-exporter-service/README.md`)
