# ☁️ Guía de Configuración: Sincronización con Google Sheets API v4

Esta guía detalla los **3 pasos exactos** que debes seguir para conectar tu tienda de e-commerce con tu planilla de Google Sheets alojada en Google Drive, permitiendo la sincronización automática de cierre de caja (hoja *Presupuesto*) y sugerencia de precios (hoja *Delivery*).

---

## 📋 Los 3 Pasos de Configuración en Google Cloud y Drive

### Paso 1: Crear la Cuenta de Servicio y Habilitar la API en Google Cloud
1. Ingresa a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (ej. `Ventas-Productos-Congelados`) o selecciona uno existente.
3. En el menú lateral, dirígete a **APIs y servicios** > **Biblioteca**.
4. Busca **"Google Sheets API"** y haz clic en **Habilitar**.
5. Ve a **APIs y servicios** > **Credenciales**.
6. Haz clic en **+ Crear credenciales** > **Cuenta de servicio**:
   - Asigna un nombre (ej. `ecommerce-sheets-sync`).
   - Haz clic en **Crear y continuar** y luego en **Listo**.

---

### Paso 2: Generar la Clave Privada y Obtener el ID de la Planilla

#### A. Obtener la Clave Privada (JSON / Private Key)
1. En la lista de Cuentas de Servicio, haz clic sobre el correo electrónico de la cuenta recién creada (tiene la forma `nombre@tu-proyecto.iam.gserviceaccount.com`).
2. Entra a la pestaña **Claves** (Keys).
3. Haz clic en **Agregar clave** > **Crear clave nueva** > Selecciona **JSON** > **Crear**.
4. Se descargará automáticamente un archivo `.json` en tu computadora. Ábrelo con un editor de texto (Notepad, VS Code, etc.). Encontrarás dos valores clave:
   - `client_email`: El correo de la cuenta de servicio.
   - `private_key`: La clave privada criptográfica (comienza con `-----BEGIN PRIVATE KEY-----`).

> [!WARNING]
> **¿Te aparece un error o bloqueo al crear la clave? (`iam.disableServiceAccountKeyCreation`)**
> Esto ocurre porque Google Cloud tiene activada por defecto la política que prohíbe generar claves JSON estáticas. Para desbloquearlo en 1 minuto:
> 1. Activa la API de IAM si no lo está: Ve a **APIs y servicios** > **Biblioteca** > Busca **Identity and Access Management (IAM) API** > **Habilitar** (o por comando `gcloud services enable iam.googleapis.com`).
> 2. Ve a **IAM y administración** > **Políticas de la organización** (Organization Policies).
> 3. En la barra de filtro busca: `iam.disableServiceAccountKeyCreation` (*"Inhabilitar la creación de claves de cuentas de servicio"*).
> 4. Haz clic en los tres puntos ⋮ o sobre la política > **Editar política** / **Administrar política**.
> 5. Selecciona **Anular política superior / Anular política** y elige **Desactivada / Inactiva** (Off). Guarda los cambios.
> 6. Regresa a tu Cuenta de Servicio en **Claves** > **Agregar clave** > **JSON**, y ahora te permitirá descargarla sin restricciones.
>
> *(Si tu cuenta pertenece a un dominio empresarial o educativo donde no tienes permisos de administrador para cambiar políticas, puedes crear el proyecto en GCP usando una cuenta personal `@gmail.com` gratuita donde no aplican restricciones).*

#### B. Obtener el `GOOGLE_SHEET_ID`
1. Abre tu planilla de cálculo en tu navegador ([Google Sheets](https://sheets.google.com)).
2. Observa la URL en la barra de direcciones de tu navegador:
   ```text
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
                                         ▲────────────────────────────────────────▲
                                                     GOOGLE_SHEET_ID
   ```
3. Copia la cadena alfanumérica que se encuentra entre `/d/` y `/edit`. Ese es tu `GOOGLE_SHEET_ID`.

---

### Paso 3: Compartir la Planilla con la Cuenta de Servicio (¡Paso Crítico!)

Para que el backend pueda leer los precios y escribir las ventas del día, la Cuenta de Servicio debe tener acceso explícito a la planilla:

1. En tu planilla de Google Sheets, haz clic en el botón verde **Compartir** (Share) en la esquina superior derecha.
2. En el campo *"Agregar personas y grupos"*, pega el correo de tu Cuenta de Servicio:
   ```text
   ecommerce-sheets-sync@tu-proyecto.iam.gserviceaccount.com
   ```
3. En el selector de permisos a la derecha, selecciona el rol **Editor**.
4. Desmarca la casilla *"Notificar a los usuarios"* (las cuentas de servicio no tienen bandeja de entrada).
5. Haz clic en **Compartir** (o Enviar).

> [!IMPORTANT]
> Si omites este paso, las peticiones fallarán con el error `403 The caller does not have permission`. Otorgar el rol de **Editor** es indispensable para que el backend pueda escribir el cierre de caja en la hoja *Presupuesto*.

---

## ⚙️ Configuración de Variables en `Backend/.env`

Una vez completados los 3 pasos, abre el archivo `Backend/.env` y completa las variables correspondientes:

```env
# Google Sheets API v4
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SERVICE_ACCOUNT_EMAIL=ecommerce-sheets-sync@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Cron Schedules (Hora de Argentina)
EXCEL_CIERRE_CRON_SCHEDULE=59 23 * * *
EXCEL_PRECIOS_CRON_SCHEDULE=0 6 * * *
```

> [!TIP]
> En la variable `GOOGLE_PRIVATE_KEY`, mantén los saltos de línea como `\n` dentro de las comillas dobles. El servicio los interpreta y normaliza automáticamente tanto en entornos locales como en servicios Cloud (Render, Railway, Heroku, AWS, etc.).

---

## 🧪 Verificación de Funcionamiento

Puedes verificar la conexión en cualquier momento con los siguientes endpoints protegidos para administradores:

1. **Lectura de precios sugeridos:**
   - Dispara una petición `POST /products/sync-excel-prices` desde Postman o tu dashboard con el token JWT de admin.
   - El sistema leerá la columna **O** de la hoja *Delivery* y actualizará `suggestedPrice` en MongoDB.
2. **Cierre de caja manual:**
   - Dispara una petición `POST /products/sync-excel-sales` con tu token de admin.
   - El sistema agrupará las ventas del día e inyectará las cantidades en la columna **F** de la hoja *Presupuesto*.
