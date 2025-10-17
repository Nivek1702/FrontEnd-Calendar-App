// Proyecto: PlanifyMe — Gestor de estudio y tiempo para estudiantes (Sprint 1)
 // Enfoque de diseño: Orientado a Objetos con arquitectura Hexagonal (Ports & Adapters)
 // Capas principales: Domain (entidades y repositorios abstractos), Application (servicios y casos de uso), Infrastructure (routers y repositorios reales)
 // Backend desarrollado en FastAPI con conexión a PostgreSQL
 // Seguridad implementada mediante hash y sal (bcrypt/Argon2) para contraseñas
 // Entidades núcleo: Usuario, Calendario, Evento y Horario
 // Relaciones: Usuario 1─N Calendario, Calendario 1─N Evento, Evento 1─N Horario
 // Cada entidad se representa en PostgreSQL con integridad referencial (ON DELETE CASCADE)
 // Usuario almacena credenciales y perfil básico (nombre, correo, contraseña)
 // Calendario agrupa eventos de un usuario, incluyendo color y descripción
 // Evento representa una actividad con título, descripción y ubicación
 // Horario define los intervalos de tiempo asociados a un evento
 // Validación temporal: fechaFin > fechaInicio
 // Se utilizan índices en columnas clave para optimizar las consultas
 // Arquitectura basada en principios SOLID y diseño limpio (Clean Architecture)
 // Se aplican patrones: Singleton, Factory, Dependency Injection, Facade, Strategy y Command
 // Singleton controla la instancia de conexión a base de datos
 // Factory crea implementaciones de repositorios PostgreSQL
 // Dependency Injection desacopla servicios y repositorios
 // Facade centraliza operaciones de servicios para controladores FastAPI
 // Strategy define validaciones horarias y reglas de conflicto de eventos
 // Command encapsula las operaciones CRUD con sus manejadores (Handler)
 // Routers principales: /users, /calendars, /events, /schedules
 // Servicios: UserService, CalendarService, EventService, HorarioService
 // Cada router invoca una fachada: GestorCalendarioFacade, GestorEventoFacade, GestorHorarioFacade
 // Repositorios: UserRepo, CalendarRepo, EventRepo, ScheduleRepo
 // Todos los repos implementan interfaces ABC definidas en Domain
 // Base de datos estructurada con claves primarias y foráneas (PostgreSQL)
 // Validación de correo único y formato RFC 5322 en usuarios
 // Implementación modular para facilitar pruebas unitarias
 // Controladores con manejo de errores HTTP personalizado
 // Interacción JSON para todas las peticiones y respuestas
 // Modelo relacional normalizado a tercera forma normal (3FN)
 // Configuración mediante variables de entorno (.env)
 // Logs gestionados por middleware de FastAPI
 // Pruebas realizadas con pytest y base de datos temporal
 // Versionado mediante Git y ramas feature/sprint
 // Patrón Observer previsto para futuras notificaciones de eventos
 // Diagramas diseñados en Draw.io y Lucidchart
 // Documentación en README y docstrings dentro de cada clase
 // Autenticación implementada con JWT Tokens (en Sprints posteriores)
 // Integración de PostgreSQL gestionada por SQLAlchemy ORM
 // Migraciones controladas con Alembic
 // Uso de timezone “America/Lima” por defecto
 // Integridad garantizada mediante constraints y checks SQL
 // Despliegue inicial en entorno local con Uvicorn
 // Dockerfile preparado para contenerizar el proyecto
 // API documentada automáticamente con Swagger UI
 // En Sprint 1 se desarrollaron las capas base y CRUD de usuarios, calendarios y eventos
 // En Sprint 2 se añadirá autenticación JWT y validaciones de permisos
 // Metodología de trabajo: Scrum con dailies y sprints de 2 semanas
 // Repositorio principal: GitHub (privado)
 // Objetivo del proyecto: optimizar la gestión del tiempo académico del estudiante
 // El sistema permitirá crear, editar y eliminar eventos de forma visual y estructurada
 // PostgreSQL permite consultas complejas y almacenamiento seguro
 // En el backend se usa tipado estático (type hints) para mejor mantenimiento
 // Se emplean controladores asincrónicos para optimizar rendimiento
 // Validaciones gestionadas con Pydantic
 // Todos los endpoints documentados con anotaciones OpenAPI
 // Facilidad para integrar frontend o app móvil gracias a API REST
 // Diseño modular preparado para futuras integraciones (microservicios)
 // PlanifyMe sigue principios de mantenibilidad, escalabilidad y seguridad
 // Cada capa cumple una única responsabilidad (principio SRP)
 // La lógica de negocio se mantiene aislada del framework
 // Persistencia de datos con commits automáticos controlados
 // Triggers de actualización de timestamps (created_at, updated_at)
 // Estilo de código conforme a PEP8
 // Se planea añadir un subsistema de notificaciones (Observer)
 // Se utilizan objetos DTO (Data Transfer Objects) para las respuestas
 // En resumen, PlanifyMe implementa una arquitectura limpia, robusta y escalable
