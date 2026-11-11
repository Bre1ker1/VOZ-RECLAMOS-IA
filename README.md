#  Voz Reclamos IA - Municipalidad de Godoy Cruz

> **Trabajo Integrador:** Solución Smart City impulsada por Inteligencia Artificial para la gestión, deduplicación y priorización comunitaria de reclamos urbanos.

---

##  Integrantes del Equipo
* **Brian Villalba**
* **Thomas Rodriguez**
* **Juan Ignacio Colucci**
* **Nicolas Fenoy**
* **Gustavo Balderrama**

---

##  1. Descripción del Proyecto
**Voz Reclamos IA** es un prototipo interactivo (MVP) diseñado para la **Municipalidad de Godoy Cruz, Mendoza**. La plataforma optimiza la atención al ciudadano al automatizar la clasificación de incidencias en la vía pública (baches, luminarias rotas, basurales) mediante visión por computadora y lenguaje natural.

###  Problema a Resolver
Los sistemas tradicionales de reclamos municipales sufren de:
- **Alta duplicación:** Múltiples vecinos reportan el mismo problema sin saberlo, saturando a las cuadrillas.
- **Falta de datos precisos:** Descripciones vagas y ubicaciones aproximadas.
- **Dificultad de priorización:** Falta de un criterio transparente basado en la comunidad para resolver primero las fallas más críticas.

---

##  2. Capacidades de Inteligencia Artificial
La solución integra capacidades multimodales alineadas a la **API de Google AI Studio (Gemini)**:

1. **Visión por Computadora (VisionAgent):** Analiza la fotografía capturada por el vecino, identifica el tipo de falla (ej. *Bache en Calzada*) y otorga un índice de confianza.
2. **Procesamiento de Lenguaje Natural (IncidentLLMAgent):** Redacta automáticamente la descripción formal de la incidencia y la asigna al área correspondiente (*Obras Públicas*, *Servicios Públicos*, etc.).
3. **Deduplicación Geoespacial (DeduplicationAgent):** Calcula un radio de **400 metros** en tiempo real. Si detecta reclamos del mismo tipo dentro del área, alerta al vecino para que pueda **apoyar la causa existente** en lugar de duplicar la carga de trabajo.

---

##  3. Características y Flujo Funcional
- **Autenticación Única (1 DNI = 1 Reclamo / Apoyo):** Garantiza la transparencia y evita el spam.
- **Búsqueda Externa:** Permite a cualquier vecino consultar e inspeccionar el estado y prioridad de reclamos ajenos mediante DNI o N° de Ticket.
- **Geofencing Estricto:** Mapa interactivo limitado al polígono de la Municipalidad de Godoy Cruz mediante **Leaflet / OpenStreetMap**.
- **Rank Dinámico y Persistencia:** El sistema registra los apoyos comunitarios y actualiza el Rank en tiempo real, almacenando el estado de forma inmutable en la base de datos local (`localStorage`).
- **Anonimización Visual:** Filtro de privacidad aplicado a rostros y patentes antes del registro público.

---

##  4. Estructura del Repositorio
```text
.
├── index.html     # Interfaz principal de la aplicación web (Dashboard, Formulario y Mapa)
├── styles.css     # Estilos responsivos, temas oscuros y componentes de UI
├── app.js         # Lógica cliente, geofencing, motor de deduplicación y gestión de storage
├── logo.png       # Identidad visual institucional de la aplicación
└── README.md      # Documentación técnica del proyecto integrador
💻 5. Instrucciones de Ejecución Local
No requiere instalación de dependencias ni servidores complejos. Podés ejecutarlo directamente en cualquier navegador web moderno:

Cloná este repositorio o descargá los archivos ZIP:

Bash


git clone [https://github.com/TU_USUARIO/voz-reclamos-ia.git](https://github.com/TU_USUARIO/voz-reclamos-ia.git)
Entrá en la carpeta del proyecto:

Bash


cd voz-reclamos-ia
Abrí el archivo index.html en tu navegador predeterminado (o usá la extensión Live Server en VS Code).

 6. Análisis Ético y Riesgos Mitigados
Sesgo de la IA: La descripción generada por la IA es 100% editable por el usuario antes del envío.

Privacidad de Terceros: Anonimización (Blur-filter) aplicada en imágenes para proteger identidades y vehículos.

Spam o Manipulación: Validación obligatoria mediante DNI para el voto o creación de reclamos.

Inclusión Social: Soporte de consulta rápida por ticket o DNI para asistir a vecinos con brecha digital.

Control Humano: La IA sugiere la prioridad y categorización, pero la validación y ejecución final permanece en manos de las autoridades municipales.
