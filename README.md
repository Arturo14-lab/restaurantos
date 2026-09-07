# RestaurantOS

Primera versión de una aplicación SaaS para gestionar personal y horarios de restaurantes.

## 1. Probar la aplicación

```bash
npm install
npm run dev
```

Sin configuración adicional se abre en **modo demostración**. Usa los datos que ya aparecen en el formulario y pulsa **Entrar**.

## 2. Conectar Supabase

1. En Supabase abre **Project Settings → API**.
2. Copia `.env.example` como un archivo nuevo llamado `.env.local`.
3. Sustituye los dos valores de ejemplo:
   - `VITE_SUPABASE_URL`: URL del proyecto.
   - `VITE_SUPABASE_ANON_KEY`: clave pública `anon` o `publishable`.
4. No uses nunca la clave `service_role` en una aplicación web.
5. Reinicia la aplicación con `npm run dev`.

El acceso utilizará entonces Supabase Auth. Crea un usuario desde **Authentication → Users** para poder entrar.

## 3. Subir a GitHub

1. Crea un repositorio vacío llamado `restaurantos` en GitHub.
2. En esta carpeta ejecuta:

```bash
git init
git add .
git commit -m "Primera versión de RestaurantOS"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/restaurantos.git
git push -u origin main
```

El archivo con las claves locales queda excluido automáticamente.

## 4. Desplegar gratis en Cloudflare Pages

1. En Cloudflare abre **Workers & Pages → Create → Pages → Connect to Git**.
2. Selecciona el repositorio `restaurantos`.
3. Usa estos ajustes:
   - Framework: **Vite**
   - Comando de construcción: `npm run build`
   - Carpeta de salida: `dist`
4. En **Environment variables** añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Pulsa **Save and Deploy**.

El archivo `public/_redirects` permite abrir directamente cualquiera de las pantallas de la app sin obtener un error 404.

## Estado de esta primera versión

- Login real cuando se añaden las variables de Supabase.
- Dashboard, empleados, horarios y app del empleado.
- Datos visuales de demostración coherentes con la semana del 7 al 13 de septiembre de 2026.
- Diseño responsive para ordenador y móvil.
- Preparada para conectar las consultas reales de las tablas en el siguiente paso.
