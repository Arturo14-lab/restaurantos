# RestaurantOS — Blueprint técnico y funcional v1

## 1. Visión del producto

RestaurantOS será una plataforma SaaS multiempresa para centralizar la gestión diaria de restaurantes y grupos de restauración. Debe funcionar para un único local y crecer hasta cadenas con cientos de restaurantes sin cambiar su arquitectura.

Principio principal: el equipo de RestaurantOS mantiene el producto; cada cliente configura y opera su negocio desde la aplicación, sin acceder al código ni a Supabase.

## 2. Tipos de usuario

### Administración de la plataforma

- **Superadministrador:** gestiona toda la plataforma, clientes, planes, límites, módulos e incidencias.
- **Soporte:** consulta cuentas y auditoría con acceso controlado, temporal y registrado.
- **Finanzas de plataforma:** consulta suscripciones, facturas y cobros sin acceso operativo innecesario.

### Usuarios de cada cliente

- **Propietario:** control total de su empresa y todos sus restaurantes.
- **Gerente:** gestión completa de los restaurantes asignados.
- **Encargado:** personal, turnos y operaciones del local asignado.
- **Administración:** personal, compras, gastos, documentos e informes autorizados.
- **Empleado:** horario, fichajes, tareas y solicitudes propias.
- **Rol personalizado:** conjunto configurable de permisos.

Una persona puede pertenecer a varias empresas o restaurantes y tener un rol diferente en cada contexto.

## 3. Jerarquía multiempresa

```text
PLATAFORMA RESTAURANTOS
└── CLIENTE / ORGANIZACIÓN
    └── EMPRESA
        ├── RESTAURANTE A
        │   ├── departamentos
        │   ├── zonas
        │   └── empleados
        └── RESTAURANTE B
```

Toda tabla operativa tendrá un propietario claro:

- `organization_id` para el cliente SaaS.
- `company_id` para la sociedad o grupo empresarial.
- `restaurant_id` cuando el registro pertenezca a un local.

No se duplicarán datos compartidos entre locales. Proveedores, productos o empleados podrán asignarse a varios restaurantes mediante tablas de relación.

## 4. Áreas del producto

### A. Plataforma SaaS

- Clientes y organizaciones.
- Planes, suscripciones y periodos de prueba.
- Catálogo de módulos y límites por plan.
- Estado de cuentas y facturación.
- Soporte, suplantación segura y registro de acceso.
- Estado de servicios, trabajos y errores.

### B. Configuración del cliente

- Empresa, datos fiscales, marca y moneda.
- Restaurantes, horarios comerciales, zonas y almacenes.
- Usuarios, invitaciones, roles y permisos.
- Departamentos, puestos y categorías.
- Integraciones y reglas del negocio.
- Preferencias de notificación.

### C. Personal

- Empleados y contratos.
- Asignación a uno o varios restaurantes.
- Disponibilidad y restricciones.
- Horarios y plantillas.
- Fichajes y correcciones.
- Vacaciones, ausencias y cambios de turno.
- Documentos, vencimientos y costes laborales.

### D. Operaciones

- Tareas y recurrencias.
- Listas de apertura y cierre.
- Incidencias y prioridades.
- Equipos y mantenimiento preventivo.
- Registro diario del restaurante.

### E. Compras

- Proveedores y contactos.
- Pedidos, albaranes, tickets y facturas.
- Líneas de compra e impuestos.
- Historial y comparación de precios.
- Bandeja de documentos pendientes de revisar.

### F. Productos e inventario

- Catálogo central de productos.
- Presentaciones, unidades y conversiones.
- Productos por proveedor.
- Almacenes, ubicaciones y stock.
- Inventarios, movimientos, transferencias y mermas.
- Stock mínimo y pedidos sugeridos.

### G. Recetas y rentabilidad

- Recetas, versiones e ingredientes.
- Escandallos y costes indirectos.
- Carta, precios de venta y alérgenos.
- Food cost teórico y real.
- Gastos fijos y variables.
- Coste laboral y resultado operativo.

### H. Informes y alertas

- Panel diario, semanal y mensual.
- Indicadores por empresa, restaurante y periodo.
- Centro unificado de acciones pendientes.
- Alertas configurables y notificaciones.
- Exportación controlada por permisos.

### I. Portal del empleado

- Próximo turno y horario personal.
- Entrada, pausa y salida.
- Solicitudes y cambios de turno.
- Tareas y avisos.
- Documentos y datos personales autorizados.

## 5. Administración sin código

El propietario podrá realizar desde RestaurantOS:

1. Crear la empresa y sus restaurantes.
2. Elegir módulos y completar el asistente de configuración.
3. Crear departamentos, puestos, zonas, almacenes y categorías.
4. Añadir empleados sin crearles una cuenta.
5. Invitar empleados o gestores cuando necesiten acceso.
6. Asignar roles y permisos por empresa o restaurante.
7. Configurar horarios, reglas, plantillas y aprobaciones.
8. Importar datos mediante plantillas controladas.
9. Activar integraciones disponibles.
10. Consultar auditoría, uso y límites de su plan.

Los ajustes se almacenarán en tablas de configuración. No habrá valores específicos de un cliente escritos dentro del código.

## 6. Permisos

Se usará un modelo RBAC con capacidades, contexto y alcance:

```text
USUARIO
  → MEMBRESÍA DE EMPRESA
    → ROL
      → PERMISOS
        → ALCANCE: empresa / restaurantes asignados / registros propios
```

Ejemplos de capacidades:

- `employees.read`, `employees.manage`, `employees.costs.read`
- `schedules.read`, `schedules.manage`, `schedules.publish`
- `time_entries.own`, `time_entries.review`
- `purchases.read`, `purchases.manage`, `purchases.approve`
- `inventory.count`, `inventory.adjust`
- `reports.profitability.read`
- `settings.users.manage`

Las políticas RLS de Supabase serán la última barrera de seguridad. Ocultar un botón en la interfaz nunca será suficiente.

## 7. Dominios de datos

Las tablas se organizarán por dominios lógicos, aunque compartan la misma base PostgreSQL:

| Dominio | Entidades principales |
|---|---|
| Plataforma | organizations, plans, subscriptions, modules, entitlements |
| Identidad | profiles, invitations, company_members, roles, permissions |
| Estructura | companies, restaurants, departments, positions, locations |
| Personal | employees, contracts, availability, documents, assignments |
| Tiempo | schedule_periods, shifts, time_entries, leave_requests |
| Operaciones | tasks, checklists, incidents, equipment, maintenance |
| Compras | suppliers, purchase_orders, receipts, invoices, purchase_lines |
| Catálogo | products, units, conversions, supplier_products, categories |
| Inventario | warehouses, stock_levels, stock_movements, counts, waste |
| Recetas | recipes, recipe_versions, ingredients, menu_items, allergens |
| Finanzas | expenses, sales_summaries, labor_costs, profitability_snapshots |
| Sistema | notifications, audit_log, files, integrations, background_jobs |

## 8. Reglas estructurales de la base de datos

- Identificadores UUID.
- Fechas de creación y modificación en todos los registros relevantes.
- Borrado lógico para información empresarial que necesite histórico.
- Estados controlados mediante restricciones o catálogos.
- Importes monetarios en decimal y moneda explícita.
- Cantidades con unidad y conversiones controladas.
- Zona horaria por restaurante y almacenamiento temporal consistente.
- Índices para empresa, restaurante, fechas, estados y relaciones frecuentes.
- Restricciones únicas dentro del contexto correcto.
- Auditoría para acciones sensibles.
- Migraciones versionadas y repetibles; no cambios manuales aislados.

## 9. Flujos con estados definidos

Los procesos importantes usarán máquinas de estados explícitas:

```text
HORARIO: borrador → publicado → cerrado
VACACIONES: borrador → pendiente → aprobada/rechazada → cancelada
COMPRA: borrador → enviada → recibida → conciliada → cancelada
FACTURA: recibida → pendiente → aprobada → pagada → anulada
INCIDENCIA: nueva → asignada → en curso → resuelta → cerrada
INVENTARIO: borrador → contando → revisado → cerrado
```

Cada transición comprobará permisos y guardará quién la realizó y cuándo.

## 10. Arquitectura de la aplicación

```text
src/
├── app/                 # arranque, rutas y proveedores globales
├── components/          # componentes visuales reutilizables
├── features/            # módulos funcionales independientes
│   ├── auth/
│   ├── dashboard/
│   ├── employees/
│   ├── schedules/
│   ├── operations/
│   ├── purchases/
│   ├── inventory/
│   ├── recipes/
│   ├── profitability/
│   └── settings/
├── layouts/             # gestión, empleado y plataforma
├── lib/                 # Supabase y utilidades compartidas
├── services/            # acceso a datos y operaciones de negocio
├── types/               # tipos del dominio y de la base de datos
└── styles/              # tokens y estilos globales
```

Cada módulo tendrá sus páginas, componentes, validaciones, consultas y pruebas. Las pantallas no consultarán Supabase directamente: usarán servicios del dominio.

## 11. Navegación principal

```text
Inicio
Centro de acciones

Personal
  Empleados
  Horarios
  Fichajes
  Vacaciones y ausencias

Operaciones
  Tareas
  Apertura y cierre
  Incidencias
  Mantenimiento

Compras
  Bandeja de documentos
  Compras y facturas
  Proveedores

Inventario
  Productos
  Stock
  Inventarios
  Movimientos
  Mermas

Rentabilidad
  Recetas y escandallos
  Gastos
  Informes

Documentos

Configuración
  Empresa
  Restaurantes
  Usuarios y permisos
  Catálogos
  Integraciones
  Plan y facturación
```

El menú se construirá desde los módulos y permisos activos para cada usuario.

## 12. Experiencias separadas

- **Gestión:** interfaz de escritorio adaptable, orientada a decisiones y operaciones complejas.
- **Empleado:** interfaz móvil simplificada para acciones rápidas.
- **Plataforma:** panel separado para el equipo de RestaurantOS.
- **Onboarding:** asistente guiado para que un nuevo cliente pueda empezar sin soporte técnico.

## 13. Requisitos transversales

- Diseño responsive y accesible.
- Español primero, preparado para internacionalización.
- Moneda y zona horaria configurables.
- Estados de carga, vacío, error y permisos insuficientes.
- Historial y auditoría visibles cuando sea útil.
- Notificaciones dentro de la aplicación; correo y otros canales después.
- Almacenamiento seguro de documentos con URLs temporales.
- Copias de seguridad gestionadas por la infraestructura.
- Registro de errores sin incluir datos sensibles.
- Exportaciones y eliminaciones respetando protección de datos.

## 14. Integraciones previstas

Se introducirán mediante adaptadores para no acoplar el producto a un proveedor:

- TPV y ventas.
- Contabilidad.
- Pagos y suscripciones.
- Correo y notificaciones.
- OCR de tickets y facturas.
- Importación bancaria.
- Proveedores y pedidos.

Las integraciones se activarán por organización y almacenarán credenciales exclusivamente en el servidor.

## 15. Orden de construcción

### Fase 1 — Fundación vendible

- Reorganización modular del frontend.
- Organizaciones, planes, módulos y permisos.
- Contexto de empresa y restaurante activo.
- Panel de configuración y onboarding.
- Auditoría básica y navegación basada en permisos.

### Fase 2 — Núcleo operativo

- Personal completo.
- Horarios, fichajes, vacaciones y cambios.
- Portal del empleado.
- Centro de acciones.

### Fase 3 — Operaciones del local

- Tareas y checklists.
- Incidencias y mantenimiento.
- Alertas y notificaciones.

### Fase 4 — Compras e inventario

- Proveedores, compras y documentos.
- Productos, stock, inventarios y mermas.

### Fase 5 — Rentabilidad

- Recetas y escandallos.
- Gastos y costes laborales.
- Informes y resultado operativo.

### Fase 6 — Comercialización

- Suscripciones y límites.
- Panel de plataforma.
- Onboarding autoservicio.
- Observabilidad, soporte y documentación.

## 16. Primera decisión de implementación

La siguiente entrega será la **Fundación vendible**:

1. Separar la aplicación actual en módulos.
2. Crear navegación completa con módulos visibles pero estados honestos.
3. Añadir contexto de empresa y restaurante.
4. Crear Configuración con empresa, restaurantes, usuarios y permisos.
5. Diseñar las migraciones para organizaciones, capacidades, planes y auditoría.

No se construirá un módulo avanzado sobre una base que todavía dependa de valores de demostración.
