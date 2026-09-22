# Despliegue en Railway

Guía paso a paso para desplegar el backend distribuido en Railway. Esto
**no fue ejecutado** durante el desarrollo (esta sesión no tiene acceso a
una cuenta de Railway) — son instrucciones para que lo hagas vos. El
frontend sigue desplegándose en GitHub Pages (ver `README.md`), apuntando
`VITE_API_URL` a la URL pública del `api-gateway` una vez desplegado acá.

Cada servicio de `backend/` ya trae su propio `railway.json` (healthcheck
en `/health`, restart on failure) y `Dockerfile` — Railway los detecta
automáticamente.

## 1. Crear el proyecto

En [railway.app](https://railway.app), **New Project → Empty Project**.
Todo lo de abajo va dentro de ese mismo proyecto, para que los servicios
puedan verse entre sí por la red privada de Railway.

## 2. Bases de datos (una instancia por servicio, a propósito)

Agregar **4 veces** `+ New → Database → Add MySQL` (una por cada
servicio que necesita persistencia — los 3 de dominio más `api-gateway`,
que tiene su propia tabla `users` para el login). Nombralas para no
confundirlas, por ejemplo:

- `idea-board-db`
- `structure-db`
- `jira-exporter-db`
- `auth-db`

Cada una expone automáticamente variables `MYSQLHOST`/`MYSQLPORT`/
`MYSQLUSER`/`MYSQLPASSWORD`/`MYSQLDATABASE` (y una `MYSQL_URL` ya armada)
que vas a referenciar desde el servicio correspondiente (paso 4).

## 3. RabbitMQ

`+ New → Template` y buscar el template comunitario de **RabbitMQ**
(con plugin de management habilitado). Si no está disponible, alternativa
más simple: crear una cuenta gratuita en [CloudAMQP](https://cloudamqp.com)
y usar la URL `amqps://...` que te da como `RABBITMQ_URL`.

## 4. Los 5 servicios de `backend/`

Por cada uno (`idea-board-service`, `requirement-refiner-service`,
`structure-service`, `jira-exporter-service`, `api-gateway`):

1. `+ New → GitHub Repo` → seleccionar este repositorio.
2. En **Settings → Source**, poner el **Root Directory** en
   `backend/<nombre-del-servicio>` (así Railway usa su `Dockerfile` propio,
   no el de otro servicio).
3. En **Settings → Networking**, generar un dominio público sólo para
   `api-gateway` (es el único que el frontend necesita alcanzar). Los
   otros 4 quedan únicamente en la red privada — no necesitan URL pública,
   y no deberían tenerla.
4. Variables de entorno (**Settings → Variables**), usando la sintaxis de
   referencia de Railway (`${{NombreDelServicio.VARIABLE}}`) para apuntar
   a los otros servicios/bases por red privada en vez de hardcodear URLs:

   `CORS_ORIGIN` abajo es la URL pública de tu frontend en GitHub Pages
   (p. ej. `https://tu-usuario.github.io`) — sin ella, cada servicio cae al
   default de desarrollo (`http://localhost:5173`), que un navegador real
   nunca manda como `Origin`, así que las llamadas del frontend desplegado
   fallarían por CORS. Los 4 servicios de dominio no tienen dominio público
   (ver paso 4.3), así que su `CORS_ORIGIN` es más bien defensa en
   profundidad que algo que un navegador vaya a ejercitar.

   **idea-board-service**
   ```
   PORT=3001
   DATABASE_URL=mysql://${{idea-board-db.MYSQLUSER}}:${{idea-board-db.MYSQLPASSWORD}}@${{idea-board-db.MYSQLHOST}}:${{idea-board-db.MYSQLPORT}}/${{idea-board-db.MYSQLDATABASE}}
   CORS_ORIGIN=https://tu-usuario.github.io
   ```

   **structure-service**
   ```
   PORT=3003
   DATABASE_URL=mysql://${{structure-db.MYSQLUSER}}:${{structure-db.MYSQLPASSWORD}}@${{structure-db.MYSQLHOST}}:${{structure-db.MYSQLPORT}}/${{structure-db.MYSQLDATABASE}}
   CORS_ORIGIN=https://tu-usuario.github.io
   ```

   **jira-exporter-service**
   ```
   PORT=3004
   DATABASE_URL=mysql://${{jira-exporter-db.MYSQLUSER}}:${{jira-exporter-db.MYSQLPASSWORD}}@${{jira-exporter-db.MYSQLHOST}}:${{jira-exporter-db.MYSQLPORT}}/${{jira-exporter-db.MYSQLDATABASE}}
   STRUCTURE_SERVICE_URL=http://${{structure-service.RAILWAY_PRIVATE_DOMAIN}}
   CORS_ORIGIN=https://tu-usuario.github.io
   ```

   **requirement-refiner-service**
   ```
   PORT=3002
   RABBITMQ_URL=<la URL de tu RabbitMQ/CloudAMQP>
   ANTHROPIC_API_KEY=<tu API key de Anthropic>
   CORS_ORIGIN=https://tu-usuario.github.io
   ```

   **api-gateway**
   ```
   PORT=3000
   IDEA_BOARD_SERVICE_URL=http://${{idea-board-service.RAILWAY_PRIVATE_DOMAIN}}
   STRUCTURE_SERVICE_URL=http://${{structure-service.RAILWAY_PRIVATE_DOMAIN}}
   JIRA_EXPORTER_SERVICE_URL=http://${{jira-exporter-service.RAILWAY_PRIVATE_DOMAIN}}
   REQUIREMENT_REFINER_SERVICE_URL=http://${{requirement-refiner-service.RAILWAY_PRIVATE_DOMAIN}}
   RABBITMQ_URL=<la misma URL de RabbitMQ/CloudAMQP>
   DATABASE_URL=mysql://${{auth-db.MYSQLUSER}}:${{auth-db.MYSQLPASSWORD}}@${{auth-db.MYSQLHOST}}:${{auth-db.MYSQLPORT}}/${{auth-db.MYSQLDATABASE}}
   JWT_SECRET=<un valor random largo — no el default de dev>
   CORS_ORIGIN=https://tu-usuario.github.io
   ```
   `CORS_ORIGIN` en `api-gateway` es el que realmente importa: es el único
   servicio con dominio público, el único al que un navegador le pega
   directo.

5. Deploy. Railway construye la imagen con el `Dockerfile` del servicio y
   la levanta; el healthcheck en `/health` (definido en cada
   `railway.json`) determina cuándo el deploy pasa a estado "Active".

## 5. Verificar

Con `api-gateway` público, confirmar que ve a los otros 4:

```bash
curl https://<tu-api-gateway>.up.railway.app/health/services
```

Debería devolver los 4 servicios de dominio en `"status": "up"`.

## 6. Apuntar el frontend

En el secret de GitHub Actions `VITE_API_URL` (ver `README.md` →
"Despliegue en GitHub Pages"), poner la URL pública de `api-gateway`
(`https://<tu-api-gateway>.up.railway.app`) y volver a correr el workflow
de deploy (push a `main`, o `workflow_dispatch`).

## Notas

- **Costo**: 4 MySQL + RabbitMQ + 5 servicios es más que el free tier
  de Railway suele cubrir sin tarjeta cargada — confirmá el plan antes de
  desplegar todo junto.
- **`prisma db push`**: los 4 servicios con base de datos sincronizan el
  esquema directo desde `schema.prisma` con Prisma ORM (ver
  `ARCHITECTURE.md`), sin historial de migraciones. Sirve para el alcance
  de este PTI; para un uso más allá de la entrega, migrar a
  `prisma migrate deploy` (ver la nota en el `README.md` de cada servicio)
  antes de desplegar en Railway. En Railway esto puede correrse como parte
  del **Deploy Command** del servicio, o manualmente una vez por `railway
  run` contra cada base antes del primer deploy.
