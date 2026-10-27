import React, { useState } from 'react';

export type Language = 'es' | 'en';

interface LandingViewProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onStartAuth: (mode: 'login' | 'register', selectedPlan?: string) => void;
  isAuthenticated?: boolean;
  onContinueToApp?: () => void;
}

const COPY = {
  es: {
    nav: {
      whatIs: '¿Qué es ClarityHub?',
      workflow: 'Cómo funciona',
      architecture: 'Arquitectura',
      pricing: 'Pricing',
      faq: 'FAQ',
      signIn: 'Iniciar sesión',
      startFree: 'Empezar gratis',
      goToApp: 'Ir al Workspace',
    },
    hero: {
      badge: 'Ingeniería de Requerimientos Potenciada por IA',
      titleLine1: 'De ideas dispersas a un',
      titleHighlight: 'Backlog técnico listo para Jira',
      titleLine2: 'en cuestión de minutos.',
      subtitle:
        'ClarityHub es la plataforma inteligente para Product Managers, Arquitectos y equipos de Ingeniería que transforma notas de reuniones, documentos y sesiones de brainstorming en Requerimientos No Funcionales (NFRs), historias de usuario estimadas en Fibonacci, subtareas técnicas y tableros Kanban listos para producción.',
      ctaPrimary: 'Comenzar gratis ahora',
      ctaSecondary: 'Explorar planes y precios',
      ctaContinue: 'Abrir mi Workspace',
      metrics: [
        { value: '10x', label: 'Más rápido del descubrimiento al backlog' },
        { value: '5 Etapas', label: 'Flujo end-to-end guiado por IA' },
        { value: '100%', label: 'Compatible con importación nativa en Jira' },
        { value: '5 Microservicios', label: 'Arquitectura distribuida tolerante a fallos' },
      ],
    },
    preview: {
      headerTag: 'Vista interactiva del flujo en vivo',
      tabs: [
        {
          id: 'brainstorm',
          step: '01',
          name: 'Brainstorming & Docs',
          badge: 'Ingesta Multimodal',
          title: 'Captura ideas libres y documentos de contexto',
          desc: 'Sube briefings en Word (.docx), matrices en Excel (.xlsx), PDFs, audios o imágenes junto con ideas sueltas. Nuestro motor con Anthropic Claude sintetiza objetivos, módulos, épicas y preguntas críticas en un Resumen Ejecutivo estructurado.',
          inputLabel: 'Entradas del equipo',
          inputItems: [
            '📄 Brief_Facturacion_B2B.docx (Adjunto procesado)',
            '💡 "Necesitamos cobros recurrentes con reintentos inteligentes y portal de autoservicio"',
            '💡 "Autenticación multi-tenant con SSO SAML 2.0 y control de roles RBAC"',
            '📊 Matriz_Comisiones_2026.xlsx (Adjunto procesado)',
          ],
          outputLabel: 'Resumen Ejecutivo generado por IA',
          outputTitle: '# EXECUTIVE SUMMARY — Plataforma SaaS B2B',
          outputBullets: [
            'Módulo 1: Identidad Multi-Tenant, SSO SAML 2.0 & RBAC granular',
            'Módulo 2: Motor de Suscripciones, Facturación PDF/XML y Timbrado Fiscal',
            'Módulo 3: Pasarela de Pagos PCI-DSS con Smart Retries & Webhooks',
            'Riesgo detectado: Condiciones de carrera en webhooks de pago duplicados',
          ],
        },
        {
          id: 'nfr',
          step: '02',
          name: 'Análisis de NFRs',
          badge: 'Calidad & Cumplimiento',
          title: 'Requerimientos No Funcionales sin puntos ciegos',
          desc: 'Antes de escribir una sola línea de código, ClarityHub extrae y valida restricciones técnicas de Seguridad, Rendimiento, Escalabilidad y Disponibilidad, detectando conflictos arquitectónicos.',
          inputLabel: 'Categorías auditadas automáticamente',
          inputItems: [
            '🔒 Seguridad: Encriptación TLS 1.3 / AES-256, rotación JWT y Audit Logs inmutables',
            '⚡ Rendimiento: Latencia p95 < 250ms en lecturas y procesamiento por lotes de 50k facturas',
            '📈 Escalabilidad: Colas RabbitMQ para desacoplar timbrado fiscal y pasarelas',
            '🛡️ Disponibilidad: SLA 99.9%, Circuit Breaker, RPO < 1h y RTO < 4h',
          ],
          outputLabel: 'Validación de Arquitectura IA',
          outputTitle: '# NFR COMPLIANCE & CONFLICT REPORT',
          outputBullets: [
            'Cobertura técnica verificada en 4 pilares críticos de arquitectura',
            'Alerta: Alinear el timeout del API Gateway con la latencia del timbrado externo',
            'Recomendación: Implementar idempotencia por clave única en recepción de Webhooks',
            'Trazabilidad: Cada NFR se vincula automáticamente con las tarjetas del backlog',
          ],
        },
        {
          id: 'backlog',
          step: '03',
          name: 'Backlog & Estimación',
          badge: 'Fibonacci & Subtareas',
          title: 'Historias de usuario completas con subtareas por rol',
          desc: 'Convierte el resumen y los NFRs en tarjetas técnicas con descripción detallada, criterios de aceptación, Story Points en escala Fibonacci y desglose de subtareas (Backend, Frontend, Testing, DevOps, Docs).',
          inputLabel: 'Estructura de Tarjeta Generada',
          inputItems: [
            '📌 Historia: Motor de Cobros Recurrentes con Smart Retries (13 SP · Prioridad Alta)',
            '⚙️ [Backend] Implementar worker RMQ y manejo idempotente de webhooks (5 SP)',
            '🎨 [Frontend] Panel de configuración de reglas de reintento y alertas (3 SP)',
            '🧪 [Testing] Suite E2E de concurrencia y simulación de fallos de pasarela (3 SP)',
          ],
          outputLabel: 'Especificación Lista para Desarrollo',
          outputTitle: 'Criterios de Aceptación & Control de Concurrencia',
          outputBullets: [
            'Cálculo automático de Story Points totales sumando subtareas técnicas',
            'Priorización inteligente basada en complejidad (Low ≤ 5, Medium 6–13, High > 13)',
            'Edición colaborativa con control de concurrencia optimista (versionado)',
            'Refinamiento individual con IA por tarjeta con un solo clic',
          ],
        },
        {
          id: 'kanban',
          step: '04',
          name: 'Tablero Kanban & Export Jira',
          badge: 'Ejecución & CSV Nativo',
          title: 'Gestiona el flujo en Kanban o exporta a Jira en 1 clic',
          desc: 'Mueve historias y subtareas a través de Backlog, To Do, In Progress, Testing y Done con arrastrar y soltar, o descarga un archivo CSV optimizado para importar en Jira manteniendo relaciones Padre-Hijo.',
          inputLabel: 'Flujo Kanban Interactivo',
          inputItems: [
            '📋 BACKLOG → TO DO → IN PROGRESS → TESTING → DONE',
            '🔄 Sincronización automática entre el estado de subtareas y la historia principal',
            '🔍 Filtros rápidos por prioridad, etiquetas técnicas, épicas y búsqueda en vivo',
            '📦 Marcado automático de historias "Ready" listas para exportación',
          ],
          outputLabel: 'Exportador Nativo para Jira',
          outputTitle: 'jira_backlog_export.csv (Mapeo Padre-Hijo)',
          outputBullets: [
            'Columnas personalizables: Summary, Description, Issue Type, Priority, Story Points, Parent ID',
            'Subtareas exportadas como issues vinculadas automáticamente a su Story padre',
            'Soporte para delimitadores coma (,) y punto y coma (;)',
            'Historial de exportaciones con reintentos seguros ante fallos de red',
          ],
        },
      ],
    },
    whatIs: {
      eyebrow: '¿QUÉ ES CLARITYHUB?',
      title: 'El puente definitivo entre la visión de producto y la ejecución técnica',
      subtitle:
        'En la mayoría de los equipos de software, el 40% del retraso en los sprints nace de requerimientos ambiguos, NFRs olvidados y tareas mal estimadas. ClarityHub estandariza la ingeniería de requerimientos de principio a fin.',
      problemTitle: 'El caos tradicional antes del Sprint',
      problems: [
        'Reuniones eternas donde las ideas quedan dispersas en notas de texto, Word y hojas de Excel desconectadas.',
        'Requerimientos No Funcionales (seguridad, concurrencia, SLA) que se descubren tarde en producción.',
        'Historias de usuario sin criterios de aceptación claros ni desglose técnico por especialidad.',
        'Horas perdidas cargando manualmente decenas de tickets y subtareas en Jira.',
      ],
      solutionTitle: 'El estándar con ClarityHub',
      solutions: [
        'Un único hub por proyecto que ingiere texto libre y documentos para sintetizar la visión ejecutiva al instante.',
        'Matriz dedicada de NFRs asistida por IA que blinda la arquitectura desde el día uno.',
        'Generación automática de historias, criterios de aceptación y subtareas tipadas con estimación Fibonacci.',
        'Tablero Kanban integrado y exportación CSV estructurada lista para importar en Jira en segundos.',
      ],
      cards: [
        {
          tag: '01 · Descubrimiento',
          title: 'Brainstorming Multimodal',
          description:
            'Combina ideas rápidas del equipo con archivos adjuntos (Word, Excel, PDF, audio, imágenes) para que ningún detalle del cliente se pierda.',
        },
        {
          tag: '02 · Blindaje Técnico',
          title: 'Ingeniería de NFRs',
          description:
            'Define y analiza métricas de Seguridad, Rendimiento, Escalabilidad y Disponibilidad antes de comprometer fechas de entrega.',
        },
        {
          tag: '03 · Estructuración',
          title: 'Backlog & Estimación IA',
          description:
            'Genera tarjetas listas para sprint con Story Points en Fibonacci y subtareas para Backend, Frontend, Testing, DevOps y Documentación.',
        },
        {
          tag: '04 · Entrega Continua',
          title: 'Kanban & Jira Exporter',
          description:
            'Opera directamente en el tablero Kanban interactivo de ClarityHub o migra todo tu árbol de épicas, historias y subtareas a Jira.',
        },
      ],
    },
    architecture: {
      eyebrow: 'ARQUITECTURA DISTRIBUIDA EMPRESARIAL',
      title: 'Construido sobre microservicios desacoplados y tolerantes a fallos',
      subtitle:
        'A diferencia de los wrappers monolíticos de IA, ClarityHub opera sobre 5 microservicios NestJS independientes con aislamiento de base de datos por servicio (Database-per-Service) y colas de mensajería RabbitMQ.',
      services: [
        {
          name: 'api-gateway',
          port: 'Puerto 3000 · MySQL (auth)',
          role: 'Único punto de entrada, autenticación JWT, aislamiento multi-proyecto (X-Project-Id), descubrimiento de servicios (/health/services) y traducción HTTP ↔ RabbitMQ.',
        },
        {
          name: 'idea-board-service',
          port: 'Puerto 3001 · MySQL (idea_board)',
          role: 'Persistencia independiente de ideas y archivos adjuntos. Sigue operando al 100% incluso si el proveedor externo de IA experimenta latencia.',
        },
        {
          name: 'requirement-refiner-service',
          port: 'Puerto 3002 · RabbitMQ + Claude',
          role: 'Motor de IA aislado detrás de RabbitMQ conectado a Anthropic Claude. Procesa resúmenes, NFRs y tarjetas de forma asíncrona y segura.',
        },
        {
          name: 'structure-service',
          port: 'Puerto 3003 · MySQL (structure)',
          role: 'Custodia la jerarquía del backlog (tarjetas, subtareas tipadas y NFRs) con control de concurrencia optimista y validación estricta.',
        },
        {
          name: 'jira-exporter-service',
          port: 'Puerto 3004 · MySQL (jira_exporter)',
          role: 'Genera exportaciones CSV compatibles con Jira, registra auditoría de intentos y permite reintentar exportaciones sin pérdida de datos.',
        },
      ],
      highlights: [
        'Contratos formales OpenAPI 3.0 / Swagger en cada servicio',
        'Aislamiento estricto por proyecto y usuario autenticado',
        'Degradación elegante: ningún fallo parcial tumba la plataforma',
      ],
    },
    pricing: {
      eyebrow: 'PLANES Y PRECIOS TRANSPARENTES',
      title: 'Escala tu ingeniería de requerimientos al ritmo de tu equipo',
      subtitle:
        'Comienza gratis para estructurar tus primeros proyectos o desbloquea todo el poder multimodal e ilimitado de ClarityHub para tu organización.',
      monthly: 'Facturación Mensual',
      annual: 'Facturación Anual',
      saveBadge: 'Ahorra 20%',
      perUserMonth: '/ usuario / mes',
      foreverFree: 'Gratis para siempre',
      billedAnnually: 'Facturado anualmente',
      billedMonthly: 'Facturado mensualmente',
      mostPopular: 'MÁS POPULAR',
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          tagline: 'Ideal para desarrolladores individuales, estudiantes y pruebas de concepto.',
          priceMonthly: 0,
          priceAnnual: 0,
          cta: 'Comenzar gratis',
          popular: false,
          features: [
            'Hasta 2 proyectos activos simultáneos',
            'Sesiones de Brainstorming ilimitadas',
            'Carga de documentos base (TXT, PDF e imágenes)',
            '15 análisis de IA al mes con Anthropic Claude',
            'Generación de historias y estimación Fibonacci',
            'Tablero Kanban interactivo con Drag & Drop',
            'Exportación estándar CSV para Jira',
          ],
        },
        {
          id: 'pro',
          name: 'Pro Team',
          tagline: 'Para Product Managers, Tech Leads y equipos ágiles que entregan software en serio.',
          priceMonthly: 29,
          priceAnnual: 23,
          cta: 'Probar Pro Team gratis',
          popular: true,
          features: [
            'Proyectos ilimitados con aislamiento X-Project-Id',
            'Análisis y refinamiento con IA ilimitados (vía RabbitMQ)',
            'Ingesta multimodal completa: Word (.docx), Excel (.xlsx), PDF, Audio e Imágenes',
            'Matriz avanzada de NFRs (Seguridad, Performance, Escalabilidad, SLA)',
            'Desglose automático de subtareas (Backend, Frontend, Testing, DevOps, Docs)',
            'Control de concurrencia optimista para edición en equipo',
            'Exportación avanzada a Jira con mapeo Padre-Hijo y reintentos automáticos',
          ],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          tagline: 'Para organizaciones de ingeniería, bancos y consultoras de software B2B.',
          priceMonthly: 89,
          priceAnnual: 71,
          cta: 'Crear cuenta Enterprise',
          popular: false,
          features: [
            'Todo lo incluido en el plan Pro Team',
            'Despliegue Single-Tenant / Docker dedicado (4 bases MySQL aisladas)',
            'Acceso completo a especificaciones OpenAPI 3.0 / Swagger por microservicio',
            'Política de Cero Retención de Datos en llamadas a IA (Zero Data Retention)',
            'Monitoreo de salud activo en tiempo real (/health/services)',
            'SLA garantizado del 99.9% y aislamiento de fallos por servicio',
            'Soporte de ingeniería prioritario 24/7 y onboarding técnico',
          ],
        },
      ],
      comparisonTitle: 'Comparativa detallada de funcionalidades',
      comparisonHeaders: ['Capacidad', 'Starter', 'Pro Team', 'Enterprise'],
      comparisonRows: [
        ['Proyectos activos', 'Hasta 2', 'Ilimitados', 'Ilimitados + Single-Tenant'],
        ['Consultas al motor IA (Claude)', '15 / mes', 'Ilimitadas', 'Ilimitadas (Cola dedicada)'],
        ['Formatos de archivos adjuntos', 'PDF, TXT, Imágenes', 'Word, Excel, PDF, Audio, Imágenes', 'Todos + Conectores API'],
        ['Análisis de NFRs y conflictos', 'Básico', 'Avanzado (4 pilares + riesgos)', 'Personalizable por normativa'],
        ['Subtareas técnicas y Fibonacci', 'Incluido', 'Incluido + Refinamiento por tarjeta', 'Incluido + Plantillas propias'],
        ['Exportación CSV para Jira', 'Estándar', 'Mapeo Padre-Hijo + Historial y Reintentos', 'API REST + Webhooks + CSV'],
        ['Arquitectura y SLA', 'Cloud compartido', 'Microservicios aislados', 'SLA 99.9% + DB por servicio dedicada'],
      ],
    },
    faq: {
      eyebrow: 'PREGUNTAS FRECUENTES',
      title: 'Todo lo que necesitas saber sobre ClarityHub',
      items: [
        {
          q: '¿Cómo funciona la exportación a Jira y cómo mantiene las subtareas?',
          a: 'El microservicio jira-exporter-service genera un archivo CSV estructurado con las columnas exactas que Jira espera (Summary, Description, Issue Type, Priority, Story Points, Labels y Parent ID). Cada subtarea (Backend, Frontend, Testing, DevOps, Docs) se exporta como un "Sub-task" referenciando automáticamente a su historia padre.',
        },
        {
          q: '¿Qué pasa si el proveedor de IA tarda o no está disponible?',
          a: 'Gracias a nuestra arquitectura distribuida, el servicio requirement-refiner-service está desacoplado detrás de RabbitMQ. Tus ideas, adjuntos, NFRs, tarjetas, tablero Kanban y exportaciones siguen funcionando en sus propios microservicios y bases de datos MySQL sin interrupciones.',
        },
        {
          q: '¿Qué tipos de archivos puedo subir en la etapa de Brainstorming?',
          a: 'Puedes adjuntar documentos Word (.doc, .docx), hojas de cálculo Excel (.xls, .xlsx), archivos PDF, texto plano, imágenes y grabaciones de audio. ClarityHub extrae el contexto relevante y lo combina con las ideas escritas por tu equipo.',
        },
        {
          q: '¿Puedo gestionar múltiples proyectos al mismo tiempo?',
          a: 'Sí. Cada cuenta puede crear y alternar entre múltiples proyectos. El API Gateway garantiza a nivel de contrato (cabecera X-Project-Id y validación de propiedad) que las ideas, NFRs y tarjetas de cada proyecto estén completamente aisladas.',
        },
      ],
    },
    ctaBanner: {
      title: 'Transforma tu próximo proyecto desde la primera idea hasta Jira',
      subtitle:
        'Crea tu cuenta en menos de 30 segundos y experimenta el flujo completo de ingeniería de requerimientos asistida por IA.',
      primary: 'Crear cuenta gratis',
      secondary: 'Ya tengo cuenta · Iniciar sesión',
    },
    footer: {
      description:
        'Plataforma de Ingeniería de Requerimientos, Análisis de NFRs, Gestión de Backlog y Exportación a Jira potenciada por IA sobre arquitectura de microservicios.',
      rights: '© 2026 ClarityHub — Sapa, Matías & Jaramillo, Juan. Todos los derechos reservados.',
    },
  },
  en: {
    nav: {
      whatIs: 'What is ClarityHub?',
      workflow: 'How it Works',
      architecture: 'Architecture',
      pricing: 'Pricing',
      faq: 'FAQ',
      signIn: 'Sign in',
      startFree: 'Get started free',
      goToApp: 'Go to Workspace',
    },
    hero: {
      badge: 'AI-Powered Requirements Engineering Platform',
      titleLine1: 'From scattered raw ideas to a',
      titleHighlight: 'Jira-ready technical backlog',
      titleLine2: 'in minutes, not weeks.',
      subtitle:
        'ClarityHub is the intelligent platform for Product Managers, Software Architects, and Engineering teams that transforms meeting notes, documents, and brainstorming sessions into Non-Functional Requirements (NFRs), Fibonacci-estimated user stories, typed subtasks, and production-ready Kanban workflows.',
      ctaPrimary: 'Start for free now',
      ctaSecondary: 'Explore plans & pricing',
      ctaContinue: 'Open my Workspace',
      metrics: [
        { value: '10x', label: 'Faster from discovery to sprint backlog' },
        { value: '5 Stages', label: 'AI-guided end-to-end workflow' },
        { value: '100%', label: 'Native Jira CSV parent-child compatibility' },
        { value: '5 Microservices', label: 'Fault-tolerant distributed architecture' },
      ],
    },
    preview: {
      headerTag: 'Interactive live workflow preview',
      tabs: [
        {
          id: 'brainstorm',
          step: '01',
          name: 'Brainstorming & Docs',
          badge: 'Multimodal Ingestion',
          title: 'Capture free-form ideas & context documents',
          desc: 'Upload Word briefings (.docx), Excel sheets (.xlsx), PDFs, audio files, or images alongside raw team ideas. Our Anthropic Claude engine synthesizes project goals, epics, modules, and critical questions into an Executive Summary.',
          inputLabel: 'Team Context Inputs',
          inputItems: [
            '📄 B2B_Billing_Brief.docx (Processed attachment)',
            '💡 "We need recurring billing with smart retries and a customer self-service portal"',
            '💡 "Multi-tenant authentication with SAML 2.0 SSO and granular RBAC permissions"',
            '📊 Pricing_Matrix_2026.xlsx (Processed attachment)',
          ],
          outputLabel: 'AI-Generated Executive Summary',
          outputTitle: '# EXECUTIVE SUMMARY — B2B SaaS Platform',
          outputBullets: [
            'Module 1: Multi-Tenant Identity, SAML 2.0 SSO & Granular RBAC',
            'Module 2: Subscription Engine, PDF/XML Invoicing & Tax Compliance',
            'Module 3: PCI-DSS Payment Gateway with Smart Retries & Webhooks',
            'Identified Risk: Race conditions on duplicate payment webhook deliveries',
          ],
        },
        {
          id: 'nfr',
          step: '02',
          name: 'NFR Analysis',
          badge: 'Quality & Compliance',
          title: 'Non-Functional Requirements with zero blind spots',
          desc: 'Before writing a single line of code, ClarityHub extracts and validates Security, Performance, Scalability, and Availability constraints while surfacing architectural conflicts.',
          inputLabel: 'Automatically Audited Pillars',
          inputItems: [
            '🔒 Security: TLS 1.3 / AES-256 encryption, strict JWT rotation & immutable Audit Logs',
            '⚡ Performance: p95 latency < 250ms on reads & 50k concurrent monthly batch invoices',
            '📈 Scalability: RabbitMQ message queues decoupling tax stamping and webhooks',
            '🛡️ Availability: 99.9% SLA, Circuit Breaker pattern, RPO < 1h and RTO < 4h',
          ],
          outputLabel: 'AI Architecture Validation',
          outputTitle: '# NFR COMPLIANCE & CONFLICT REPORT',
          outputBullets: [
            'Technical coverage verified across 4 critical architectural pillars',
            'Warning: Align API Gateway timeout with external tax server latency spikes',
            'Recommendation: Enforce idempotency keys on incoming payment webhooks',
            'Traceability: Every NFR automatically informs downstream backlog card generation',
          ],
        },
        {
          id: 'backlog',
          step: '03',
          name: 'Backlog & Estimation',
          badge: 'Fibonacci & Subtasks',
          title: 'Complete user stories with role-specific subtasks',
          desc: 'Turn your summary and NFRs into structured cards featuring technical descriptions, acceptance criteria, Fibonacci Story Points, and subtasks broken down by role (Backend, Frontend, Testing, DevOps, Docs).',
          inputLabel: 'Generated Card Structure',
          inputItems: [
            '📌 Story: Recurring Billing Engine with Smart Retries (13 SP · High Priority)',
            '⚙️ [Backend] Implement RMQ worker and idempotent webhook processor (5 SP)',
            '🎨 [Frontend] Retry policy configuration dashboard & failure alerts (3 SP)',
            '🧪 [Testing] E2E concurrency suite & gateway outage simulation (3 SP)',
          ],
          outputLabel: 'Sprint-Ready Specification',
          outputTitle: 'Acceptance Criteria & Optimistic Concurrency',
          outputBullets: [
            'Automatic total Story Points calculation across technical subtasks',
            'Smart priority mapping based on effort (Low ≤ 5, Medium 6–13, High > 13)',
            'Collaborative editing protected by optimistic concurrency control (versioning)',
            '1-click per-card AI refinement to expand specifications on demand',
          ],
        },
        {
          id: 'kanban',
          step: '04',
          name: 'Kanban Board & Jira Export',
          badge: 'Execution & Native CSV',
          title: 'Run sprints in Kanban or export to Jira in 1 click',
          desc: 'Drag and drop stories and subtasks across Backlog, To Do, In Progress, Testing, and Done, or download a Jira-optimized CSV preserving Parent-Child relationships.',
          inputLabel: 'Interactive Kanban Workflow',
          inputItems: [
            '📋 BACKLOG → TO DO → IN PROGRESS → TESTING → DONE',
            '🔄 Automatic progress sync between subtasks and parent user stories',
            '🔍 Instant filtering by priority, technical labels, epics, and live search',
            '📦 One-click "Ready" status marking for export-ready stories',
          ],
          outputLabel: 'Native Jira Exporter',
          outputTitle: 'jira_backlog_export.csv (Parent-Child Mapped)',
          outputBullets: [
            'Customizable columns: Summary, Description, Issue Type, Priority, Story Points, Parent ID',
            'Subtasks exported as linked Jira Sub-task issues under their parent Story',
            'Supports both comma (,) and semicolon (;) delimiters',
            'Persistent export history with safe retries if a downstream service is busy',
          ],
        },
      ],
    },
    whatIs: {
      eyebrow: 'WHAT IS CLARITYHUB?',
      title: 'The definitive bridge between product vision and technical execution',
      subtitle:
        'In most software teams, 40% of sprint delays stem from ambiguous requirements, overlooked NFRs, and poorly estimated tasks. ClarityHub standardizes requirements engineering end to end.',
      problemTitle: 'Traditional pre-sprint chaos',
      problems: [
        'Endless meetings where ideas stay scattered across chat threads, Word docs, and disconnected spreadsheets.',
        'Non-Functional Requirements (security, concurrency, SLAs) discovered too late in production.',
        'User stories lacking clear acceptance criteria or technical breakdown by engineering discipline.',
        'Hours wasted manually creating and linking dozens of stories and subtasks in Jira.',
      ],
      solutionTitle: 'The ClarityHub standard',
      solutions: [
        'A unified workspace per project that ingests free-form ideas and documents into an instant Executive Summary.',
        'Dedicated AI-assisted NFR matrix that hardens your architecture from day one.',
        'Automated generation of user stories, acceptance criteria, and typed subtasks with Fibonacci estimation.',
        'Built-in interactive Kanban board and structured CSV export ready for Jira import in seconds.',
      ],
      cards: [
        {
          tag: '01 · Discovery',
          title: 'Multimodal Brainstorming',
          description:
            'Combine rapid team ideation with file attachments (Word, Excel, PDF, audio, images) so no stakeholder requirement slips through the cracks.',
        },
        {
          tag: '02 · Technical Hardening',
          title: 'NFR Engineering',
          description:
            'Define and analyze Security, Performance, Scalability, and Availability constraints before committing to delivery dates.',
        },
        {
          tag: '03 · Structuring',
          title: 'AI Backlog & Estimation',
          description:
            'Generate sprint-ready cards with Fibonacci Story Points and role-based subtasks for Backend, Frontend, Testing, DevOps, and Docs.',
        },
        {
          tag: '04 · Delivery',
          title: 'Kanban & Jira Exporter',
          description:
            'Manage execution directly on ClarityHub’s interactive Kanban board or export your entire hierarchy of stories and subtasks into Jira.',
        },
      ],
    },
    architecture: {
      eyebrow: 'ENTERPRISE DISTRIBUTED ARCHITECTURE',
      title: 'Built on decoupled, fault-tolerant microservices',
      subtitle:
        'Unlike monolithic AI wrappers, ClarityHub runs on 5 independent NestJS microservices with Database-per-Service isolation and RabbitMQ asynchronous messaging.',
      services: [
        {
          name: 'api-gateway',
          port: 'Port 3000 · MySQL (auth)',
          role: 'Single entry point, JWT authentication, multi-project isolation (X-Project-Id), live service discovery (/health/services), and HTTP ↔ RabbitMQ translation.',
        },
        {
          name: 'idea-board-service',
          port: 'Port 3001 · MySQL (idea_board)',
          role: 'Independent persistence for ideas and file attachments. Continues operating at 100% even if external AI providers experience latency.',
        },
        {
          name: 'requirement-refiner-service',
          port: 'Port 3002 · RabbitMQ + Claude',
          role: 'Isolated AI engine behind RabbitMQ powered by Anthropic Claude. Asynchronously processes summaries, NFRs, and backlog cards.',
        },
        {
          name: 'structure-service',
          port: 'Port 3003 · MySQL (structure)',
          role: 'Manages the backlog hierarchy (cards, typed subtasks, and NFRs) with optimistic concurrency control and strict contract validation.',
        },
        {
          name: 'jira-exporter-service',
          port: 'Port 3004 · MySQL (jira_exporter)',
          role: 'Generates Jira-compatible CSV exports, logs audit history of export attempts, and supports safe retries without data loss.',
        },
      ],
      highlights: [
        'Formal OpenAPI 3.0 / Swagger contracts on every service',
        'Strict per-project and per-user data isolation',
        'Graceful degradation: no partial outage brings down the platform',
      ],
    },
    pricing: {
      eyebrow: 'TRANSPARENT PLANS & PRICING',
      title: 'Scale your requirements engineering at your team’s pace',
      subtitle:
        'Start for free to structure your first projects or unlock unlimited multimodal AI power and enterprise resilience for your organization.',
      monthly: 'Monthly Billing',
      annual: 'Annual Billing',
      saveBadge: 'Save 20%',
      perUserMonth: '/ user / month',
      foreverFree: 'Free forever',
      billedAnnually: 'Billed annually',
      billedMonthly: 'Billed monthly',
      mostPopular: 'MOST POPULAR',
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          tagline: 'Ideal for solo developers, students, and early proof-of-concept projects.',
          priceMonthly: 0,
          priceAnnual: 0,
          cta: 'Start for free',
          popular: false,
          features: [
            'Up to 2 active projects simultaneously',
            'Unlimited Brainstorming sessions',
            'Core document uploads (TXT, PDF & images)',
            '15 AI analysis runs per month with Anthropic Claude',
            'User story generation & Fibonacci estimation',
            'Interactive Drag & Drop Kanban board',
            'Standard CSV export for Jira',
          ],
        },
        {
          id: 'pro',
          name: 'Pro Team',
          tagline: 'For Product Managers, Tech Leads, and agile squads shipping production software.',
          priceMonthly: 29,
          priceAnnual: 23,
          cta: 'Start Pro Team trial',
          popular: true,
          features: [
            'Unlimited projects with X-Project-Id isolation',
            'Unlimited AI analysis & card refinement (via RabbitMQ)',
            'Full multimodal ingestion: Word (.docx), Excel (.xlsx), PDF, Audio & Images',
            'Advanced NFR matrix (Security, Performance, Scalability, SLA)',
            'Automated subtask breakdown (Backend, Frontend, Testing, DevOps, Docs)',
            'Optimistic concurrency control for collaborative editing',
            'Advanced Jira export with Parent-Child mapping & automatic retries',
          ],
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          tagline: 'For engineering organizations, financial institutions, and B2B software consultancies.',
          priceMonthly: 89,
          priceAnnual: 71,
          cta: 'Create Enterprise account',
          popular: false,
          features: [
            'Everything included in Pro Team',
            'Dedicated Single-Tenant / Docker deployment (4 isolated MySQL DBs)',
            'Full access to per-service OpenAPI 3.0 / Swagger specifications',
            'Zero Data Retention policy on external AI calls',
            'Real-time active service health discovery (/health/services)',
            'Guaranteed 99.9% SLA with per-service fault isolation',
            '24/7 priority engineering support & technical onboarding',
          ],
        },
      ],
      comparisonTitle: 'Detailed feature comparison',
      comparisonHeaders: ['Capability', 'Starter', 'Pro Team', 'Enterprise'],
      comparisonRows: [
        ['Active projects', 'Up to 2', 'Unlimited', 'Unlimited + Single-Tenant'],
        ['AI Engine requests (Claude)', '15 / month', 'Unlimited', 'Unlimited (Dedicated queue)'],
        ['Supported attachment formats', 'PDF, TXT, Images', 'Word, Excel, PDF, Audio, Images', 'All + Custom API Connectors'],
        ['NFR & conflict analysis', 'Basic', 'Advanced (4 pillars + risks)', 'Custom compliance rules'],
        ['Technical subtasks & Fibonacci', 'Included', 'Included + Per-card AI refinement', 'Included + Custom templates'],
        ['Jira CSV export', 'Standard', 'Parent-Child mapping + Retry history', 'REST API + Webhooks + CSV'],
        ['Architecture & SLA', 'Shared Cloud', 'Isolated Microservices', '99.9% SLA + Dedicated DBs per service'],
      ],
    },
    faq: {
      eyebrow: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Everything you need to know about ClarityHub',
      items: [
        {
          q: 'How does the Jira export work and how are subtasks linked?',
          a: 'The dedicated jira-exporter-service generates a structured CSV matching Jira’s native import schema (Summary, Description, Issue Type, Priority, Story Points, Labels, and Parent ID). Every technical subtask (Backend, Frontend, Testing, DevOps, Docs) is exported as a "Sub-task" automatically linked to its parent Story.',
        },
        {
          q: 'What happens if the external AI provider is slow or temporarily unavailable?',
          a: 'Because ClarityHub is built on a decoupled microservices architecture, requirement-refiner-service is isolated behind RabbitMQ. Your ideas, attachments, NFRs, backlog cards, Kanban board, and Jira exports continue operating seamlessly on their own services and MySQL databases.',
        },
        {
          q: 'What file types can I upload during Brainstorming?',
          a: 'You can attach Word documents (.doc, .docx), Excel spreadsheets (.xls, .xlsx), PDFs, plain text files, images, and audio recordings. ClarityHub extracts the relevant context and combines it with your team’s written ideas.',
        },
        {
          q: 'Can I manage multiple projects under the same account?',
          a: 'Yes. Every user can create and switch between multiple projects. The API Gateway enforces strict project ownership and scopes every request via the X-Project-Id contract header so data never leaks across projects.',
        },
      ],
    },
    ctaBanner: {
      title: 'Transform your next project from first idea to Jira sprint',
      subtitle:
        'Create your account in under 30 seconds and experience the complete AI-powered requirements engineering workflow.',
      primary: 'Create free account',
      secondary: 'Already have an account · Sign in',
    },
    footer: {
      description:
        'AI-Powered Requirements Engineering, NFR Analysis, Backlog Management, and Jira Export platform built on a distributed microservices architecture.',
      rights: '© 2026 ClarityHub — Sapa, Matías & Jaramillo, Juan. All rights reserved.',
    },
  },
};

export const LandingView: React.FC<LandingViewProps> = ({
  lang,
  onChangeLang,
  onStartAuth,
  isAuthenticated,
  onContinueToApp,
}) => {
  const t = COPY[lang];
  const [activeTab, setActiveTab] = useState<string>('brainstorm');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const currentPreview = t.preview.tabs.find((tab) => tab.id === activeTab) || t.preview.tabs[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-clarity-500/30 overflow-x-hidden relative">
      {/* Ambient Background Glows & Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-48 -top-48 h-[38rem] w-[38rem] rounded-full bg-clarity-900/25 blur-[160px] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-56 -right-40 h-[42rem] w-[42rem] rounded-full bg-clarity-600/15 blur-[170px] z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at top, #000 35%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, #000 35%, transparent 80%)',
        }}
      />

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 focus:outline-none"
            >
              <img
                src={`${import.meta.env.BASE_URL}clarity_logo.png`}
                alt="ClarityHub"
                className="h-9 w-auto object-contain drop-shadow"
              />
            </a>
            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-clarity-500/30 bg-clarity-900/30 px-2.5 py-0.5 text-[11px] font-medium text-clarity-300">
              <span className="h-1.5 w-1.5 rounded-full bg-clarity-400 animate-pulse" />
              v1.0 Distributed
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
            <button onClick={() => scrollToSection('what-is')} className="hover:text-white transition-colors">
              {t.nav.whatIs}
            </button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-white transition-colors">
              {t.nav.workflow}
            </button>
            <button onClick={() => scrollToSection('architecture')} className="hover:text-white transition-colors">
              {t.nav.architecture}
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">
              {t.nav.pricing}
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">
              {t.nav.faq}
            </button>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* ES / EN Switcher */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChangeLang('es')}
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  lang === 'es' ? 'bg-clarity-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-clarity-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {isAuthenticated && onContinueToApp ? (
              <button
                onClick={onContinueToApp}
                className="rounded-xl bg-clarity-600 hover:bg-clarity-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-clarity-950/50 transition-all"
              >
                {t.nav.goToApp} →
              </button>
            ) : (
              <>
                <button
                  onClick={() => onStartAuth('login')}
                  className="hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition-colors"
                >
                  {t.nav.signIn}
                </button>
                <button
                  onClick={() => onStartAuth('register')}
                  className="rounded-xl bg-clarity-600 hover:bg-clarity-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-clarity-950/50 transition-all"
                >
                  {t.nav.startFree}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="top" className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-clarity-500/30 bg-clarity-900/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-clarity-300 shadow-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {t.hero.badge}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
              {t.hero.titleLine1}{' '}
              <span className="bg-gradient-to-r from-clarity-300 via-clarity-400 to-indigo-400 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>{' '}
              {t.hero.titleLine2}
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg lg:text-xl text-gray-400 font-light leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && onContinueToApp ? (
                <button
                  onClick={onContinueToApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-clarity-600 hover:bg-clarity-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-clarity-900/50 transition-all hover:scale-[1.01]"
                >
                  {t.hero.ctaContinue} →
                </button>
              ) : (
                <button
                  onClick={() => onStartAuth('register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-clarity-600 hover:bg-clarity-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-clarity-900/50 transition-all hover:scale-[1.01]"
                >
                  {t.hero.ctaPrimary}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => scrollToSection('pricing')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-4 text-base font-medium text-gray-200 transition-all"
              >
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {t.hero.metrics.map((m, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-gray-900/40 p-5 text-center backdrop-blur-md"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{m.value}</div>
                <div className="mt-1 text-xs sm:text-sm text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Interactive 5-Stage Pipeline Showcase */}
          <div id="workflow" className="mt-16 scroll-mt-24 rounded-3xl border border-white/10 bg-gray-900/50 p-4 sm:p-8 shadow-glass backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="ml-2 text-xs font-mono uppercase tracking-widest text-clarity-300">
                  {t.preview.headerTag}
                </span>
              </div>

              {/* Stage Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {t.preview.tabs.map((tab) => {
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                        active
                          ? 'bg-clarity-600 text-white shadow-lg shadow-clarity-950/60'
                          : 'bg-black/40 text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-white/5'
                      }`}
                    >
                      <span className="font-mono text-[11px] opacity-75">{tab.step}</span>
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab Body */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5 space-y-5">
                <span className="inline-block rounded-lg border border-clarity-500/30 bg-clarity-900/40 px-3 py-1 text-xs font-semibold text-clarity-300">
                  {currentPreview.step} · {currentPreview.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {currentPreview.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light">
                  {currentPreview.desc}
                </p>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {currentPreview.inputLabel}
                  </div>
                  {currentPreview.inputItems.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/5 bg-gray-900/70 px-3.5 py-2.5 text-xs sm:text-sm text-gray-200 font-light"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-clarity-500/30 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-clarity-950/40 p-6 sm:p-8 shadow-glow">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-clarity-300">
                    {currentPreview.outputLabel}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300">
                    Claude Opus · Verified Contract
                  </span>
                </div>
                <div className="font-mono text-sm sm:text-base font-semibold text-white mb-4">
                  {currentPreview.outputTitle}
                </div>
                <ul className="space-y-3">
                  {currentPreview.outputBullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs sm:text-sm text-gray-200"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clarity-600/40 border border-clarity-400/40 text-clarity-300 text-xs">
                        ✓
                      </span>
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT IS CLARITYHUB SECTION */}
        <section id="what-is" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-clarity-400">
              {t.whatIs.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.whatIs.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-400 font-light leading-relaxed">
              {t.whatIs.subtitle}
            </p>
          </div>

          {/* Problem vs Solution Comparison */}
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Traditional Chaos */}
            <div className="rounded-3xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 font-bold">
                  ✕
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-red-200">{t.whatIs.problemTitle}</h3>
              </div>
              <ul className="space-y-4">
                {t.whatIs.problems.map((prob, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-300 font-light">
                    <span className="mt-1 text-red-400 shrink-0">•</span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ClarityHub Standard */}
            <div className="rounded-3xl border border-clarity-500/30 bg-clarity-900/15 p-6 sm:p-8 shadow-glow">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-clarity-600 text-white font-bold">
                  ✓
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">{t.whatIs.solutionTitle}</h3>
              </div>
              <ul className="space-y-4">
                {t.whatIs.solutions.map((sol, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-100 font-light">
                    <span className="mt-1 text-clarity-400 shrink-0">✓</span>
                    <span>{sol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4 Core Pillar Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.whatIs.cards.map((card, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-gray-900/40 p-6 transition-all hover:border-clarity-500/40 hover:bg-gray-900/70"
              >
                <span className="font-mono text-xs font-semibold text-clarity-400">{card.tag}</span>
                <h4 className="mt-3 text-lg font-bold text-white group-hover:text-clarity-300 transition-colors">
                  {card.title}
                </h4>
                <p className="mt-2 text-sm text-gray-400 font-light leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* DISTRIBUTED ARCHITECTURE SECTION */}
        <section id="architecture" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/60 to-black/60 p-6 sm:p-12 backdrop-blur-xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-clarity-400">
                {t.architecture.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t.architecture.title}
              </h2>
              <p className="mt-4 text-base text-gray-400 font-light leading-relaxed">
                {t.architecture.subtitle}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {t.architecture.services.map((srv, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/50 p-5 hover:border-clarity-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                      <span className="font-mono text-[11px] text-clarity-300 truncate">{srv.port}</span>
                    </div>
                    <h4 className="mt-3 font-mono text-sm font-bold text-white break-all">{srv.name}</h4>
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed font-light">{srv.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/10">
              {t.architecture.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-gray-300"
                >
                  <span className="text-clarity-400">●</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-clarity-400">
              {t.pricing.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-400 font-light leading-relaxed">
              {t.pricing.subtitle}
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-gray-900/70 p-1.5">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-clarity-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t.pricing.monthly}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-clarity-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>{t.pricing.annual}</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  {t.pricing.saveBadge}
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
            {t.pricing.plans.map((plan) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                    plan.popular
                      ? 'border-2 border-clarity-500 bg-gradient-to-b from-clarity-950/60 via-gray-900/80 to-gray-900/90 shadow-glow lg:-translate-y-2'
                      : 'border border-white/10 bg-gray-900/40 hover:border-white/20'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-clarity-500 to-indigo-500 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
                      {t.pricing.mostPopular}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      {plan.id === 'enterprise' && (
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-gray-300">
                          SLA 99.9%
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-400 font-light min-h-[40px]">{plan.tagline}</p>

                    <div className="mt-6 flex items-baseline gap-1 border-b border-white/10 pb-6">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        {price === 0 ? `USD · ${t.pricing.foreverFree}` : `USD ${t.pricing.perUserMonth}`}
                      </span>
                    </div>
                    {price > 0 && (
                      <p className="mt-2 text-xs text-clarity-300">
                        {billingCycle === 'annual' ? t.pricing.billedAnnually : t.pricing.billedMonthly}
                      </p>
                    )}

                    <ul className="mt-6 space-y-3.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-200 font-light">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clarity-600/30 text-clarity-300 text-xs">
                            ✓
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() =>
                      isAuthenticated && onContinueToApp
                        ? onContinueToApp()
                        : onStartAuth('register', plan.name)
                    }
                    className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-clarity-600 hover:bg-clarity-500 text-white shadow-lg shadow-clarity-900/50'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-md">
            <div className="border-b border-white/10 px-6 py-5">
              <h3 className="text-lg font-bold text-white">{t.pricing.comparisonTitle}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                    {t.pricing.comparisonHeaders.map((header, i) => (
                      <th key={i} className={`px-6 py-4 font-semibold ${i === 2 ? 'text-clarity-300' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {t.pricing.comparisonRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-200">{row[0]}</td>
                      <td className="px-6 py-4 text-gray-400 font-light">{row[1]}</td>
                      <td className="px-6 py-4 text-clarity-200 font-medium bg-clarity-950/20">{row[2]}</td>
                      <td className="px-6 py-4 text-gray-300 font-light">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-clarity-400">{t.faq.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.faq.title}</h2>
          </div>

          <div className="mt-12 space-y-4">
            {t.faq.items.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-gray-900/40 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className="shrink-0 text-clarity-400 text-xl font-light">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm sm:text-base text-gray-400 font-light leading-relaxed border-t border-white/5 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-clarity-500/40 bg-gradient-to-r from-clarity-950 via-clarity-900/60 to-indigo-950 p-8 sm:p-14 text-center shadow-glow">
            <h2 className="mx-auto max-w-2xl text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.ctaBanner.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-gray-300 font-light">
              {t.ctaBanner.subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated && onContinueToApp ? (
                <button
                  onClick={onContinueToApp}
                  className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-clarity-950 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  {t.hero.ctaContinue} →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onStartAuth('register')}
                    className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-clarity-950 shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    {t.ctaBanner.primary}
                  </button>
                  <button
                    onClick={() => onStartAuth('login')}
                    className="w-full sm:w-auto rounded-xl border border-white/20 bg-black/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-black/50 transition-colors"
                  >
                    {t.ctaBanner.secondary}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2 max-w-md text-center sm:text-left">
            <img
              src={`${import.meta.env.BASE_URL}clarity_logo.png`}
              alt="ClarityHub"
              className="h-8 w-auto object-contain"
            />
            <p className="text-xs text-gray-500 font-light">{t.footer.description}</p>
          </div>
          <p className="text-xs text-gray-500">{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
};
