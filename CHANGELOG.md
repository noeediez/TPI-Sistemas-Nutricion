# Changelog — Dip & Crunch

## [1.0.0] - 2026-06-16
### Agregado
- Tests E2E con Playwright (17 casos de prueba)
- GitHub Actions CI con 3 jobs automáticos (backend, build, E2E)

## [0.9.0] - 2026-06-13
### Agregado
- Tests unitarios con Vitest (RespuestaBuilder, RespuestaRepository, DashboardFacade, PreguntaFactory)

## [0.8.0] - 2026-06-11
### Agregado
- Chat con IA (Claude API) en panel admin
- Historial de conversaciones guardado en Supabase
- Contactos y envío de informes por mail con Resend
- API frontend↔backend conectando patrones Builder, Repository y Facade

## [0.7.0] - 2026-06-09
### Corregido
- Gráficos de intención de consumo, alternativa cárnica y reemplazo de aderezos en panel admin

## [0.6.0] - 2026-06-07
### Agregado
- Google Analytics
- Microsoft Clarity

## [0.5.0] - 2026-06-05
### Agregado
- Cola offline con IndexedDB
- Sincronización automática al recuperar conexión
- Anti-duplicado con client_uuid

## [0.4.0] - 2026-06-04
### Corregido
- Diseño responsive en mobile

## [0.3.0] - 2026-06-03
### Agregado
- Diseño responsive inicial para todas las páginas

## [0.2.0] - 2026-06-02
### Agregado
- Patrón Singleton para SupabaseClient
- Patrón Facade para DashboardFacade
- Panel de administración con gráficos
- Login de administrador

## [0.1.0] - 2026-05-30
### Agregado
- Estructura base del proyecto (frontend/backend)
- Encuesta sensorial completa con 5 pasos
- Envío de respuestas a Supabase
- Deploy en Vercel