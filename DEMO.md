# Demo de tolerancia a fallos

Guía paso a paso, reproducible, para mostrar en la entrega que ClarityHub
sigue funcionando (al menos parcialmente) cuando un servicio individual se
cae — el requisito no negociable de la cátedra (ver el brief, sección 3).

Todo lo descripto acá fue efectivamente ejecutado y verificado durante el
desarrollo (con los 5 servicios + RabbitMQ + MySQL corriendo juntos, y
el frontend real en un navegador vía Playwright) — no es un guión teórico.

## Preparación

```bash
cp .env.example .env
# Editar .env y completar ANTHROPIC_API_KEY con una key real de Anthropic
docker compose up --build
```

Esperar a que todos los servicios reporten "healthy"/arrancados. Abrir el
frontend (`npm run dev` en otra terminal, o servirlo aparte) apuntando a
`VITE_API_URL=http://localhost:3000`. El resto de la app está detrás de
login (`api-gateway` exige un JWT en toda ruta salvo `/auth/*` y
`/health*`) — crear una cuenta desde la pantalla inicial o, para probar
por `curl`:

```bash
REG=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo-password"}')
echo "$REG" | python3 -m json.tool
TOKEN=$(echo "$REG" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
```

Un usuario puede tener varios proyectos (ver "Aislamiento por proyecto" en
`ARCHITECTURE.md`); creá uno para la demo y guardá su id:

```bash
PROJ=$(curl -s -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Demo"}')
echo "$PROJ" | python3 -m json.tool
PROJECT_ID=$(echo "$PROJ" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
```

Los datos de cada proyecto están aislados (`projectId` en cada fila, en
las tres bases) — los curls de `/exports` en la Demo 2 le pegan directo a
jira-exporter-service (puerto 3004), no al gateway, así que no llevan
`Authorization`, pero como cualquier ruta de dominio sí necesitan el
header `X-Project-Id: $PROJECT_ID` para saber de qué proyecto es cada
fila. Si usás el frontend en vez de `curl`, el mismo proyecto se elige o
se crea desde la pantalla que aparece después de loguearse.

Verificar que todo está arriba:

```bash
curl -s http://localhost:3000/health/services | python3 -m json.tool
```

Debería mostrar los 4 servicios de dominio en `"status": "up"`.

## Demo 1 — Apagar el servicio de IA (el caso que pide la cátedra)

Este es el escenario central: **requirement-refiner-service es el único
servicio que depende de un proveedor externo (Claude)**, y es el que el
brief pide poder apagar sin romper el resto del sistema.

1. **Apagar el servicio de IA:**
   ```bash
   docker compose stop requirement-refiner-service
   ```

2. **Mostrar que el gateway lo detecta:**
   ```bash
   curl -s http://localhost:3000/health/services | python3 -m json.tool
   ```
   `requirement-refiner-service` debería aparecer en `"status": "down"`;
   los otros tres, en `"up"`.

3. **En el frontend, intentar una acción de IA** (ej. "Analyze Context" en
   Brainstorming, o "Verify Risks" en NFR Analysis). Debería aparecer un
   alert de error limpio ("Failed to generate summary...") — sin crashear
   la app ni dejarla en un estado roto.

4. **Mostrar que todo lo demás sigue funcionando con normalidad**, en el
   mismo frontend, sin recargar la página:
   - Agregar una idea manualmente (Brainstorming) → se persiste.
   - Agregar un NFR manualmente (NFR Analysis) → se persiste.
   - Crear una épica manualmente y agregarle una tarea (Backlog Definition)
     → se persiste, incluso con edición de campos.
   - Marcarla como "Ready" y exportarla a CSV (Data Export) → el archivo
     se descarga correctamente.

   Ninguno de estos pasos toca requirement-refiner-service ni RabbitMQ —
   por eso siguen andando con el servicio de IA apagado.

5. **Revivir el servicio de IA:**
   ```bash
   docker compose start requirement-refiner-service
   ```
   Repetir el paso 3 — ahora debería funcionar normalmente (asumiendo una
   `ANTHROPIC_API_KEY` válida en `.env`).

## Demo 2 — Fallo y reintento en la exportación a Jira (bonus)

Muestra el otro mecanismo de resiliencia explícito del brief: "si el Jira
Exporter falla, el backlog ya estructurado no debe perderse".

1. Con al menos una épica en estado `Ready`, apagar structure-service:
   ```bash
   docker compose stop structure-service
   ```

2. Intentar exportar a CSV desde el frontend (Data Export). Debería
   fallar con un mensaje de error claro (jira-exporter-service no pudo
   alcanzar a structure-service).

3. Verificar que el intento fallido quedó registrado, no perdido:
   ```bash
   curl -s http://localhost:3004/exports -H "X-Project-Id: $PROJECT_ID" | python3 -m json.tool
   ```
   El job más reciente debería tener `"status": "failed"` con un
   `errorMessage` describiendo el problema — y **sin** haber perdido el
   backlog (las épicas siguen en la base de datos de structure-service,
   que ni se tocó).

4. Revivir structure-service:
   ```bash
   docker compose start structure-service
   ```

5. Reintentar el mismo job (reemplazar `<id>` por el id del paso 3):
   ```bash
   curl -s -X POST http://localhost:3004/exports/<id>/retry -H "X-Project-Id: $PROJECT_ID" | python3 -m json.tool
   ```
   Debería volver `"status": "completed"` con el CSV generado — mismo job,
   sin haber tenido que reconstruir nada.

## Qué NO se cae en ningún escenario

- **idea-board-service** nunca depende de otro servicio para funcionar —
  es intencional, es el servicio que el brief pide que sobreviva a
  cualquier caída del resto del sistema.
- **api-gateway** en sí mismo nunca se cae por la caída de un servicio
  downstream: cada proxy y la llamada a IA tienen su propio timeout
  (`ProxyService`/`RefinerClientService`), así que un servicio lento o
  caído se traduce en un error HTTP limpio (502/503/504) para esa ruta
  puntual, nunca en que el gateway completo deje de responder.
