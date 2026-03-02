# 🎧 Proyecto Redes Sonido

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![CoreUI](https://img.shields.io/badge/CoreUI-5.x-321FDB?logo=coreui&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

Dashboard web para monitoreo de variables ambientales y de sonido en tiempo real, construido sobre CoreUI + React + Vite.

Este proyecto permite visualizar lecturas de **temperatura**, **humedad** y **nivel de sonido (dB)** por ubicación, además de consultar históricos por distintos rangos de tiempo para facilitar análisis y toma de decisiones.

---

## 👥 Créditos

Proyecto desarrollado por:

- **Alfredo Barranco**
- **Bernardo Bojalil**
- **David Bojalil**
- **Fernando Hernandez**

---

## Liga al Repositorio y Vercel

Vercel: https://proyectoredessonido.vercel.app/#/dashboard

Repositorio: https://github.com/DavidBo9/proyectoredessonido

---

## 📚 Tabla de contenido

- [Descripción general](#-descripción-general)
- [Características principales](#-características-principales)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Uso en desarrollo](#-uso-en-desarrollo)
- [Scripts disponibles](#-scripts-disponibles)
- [Configuración y API](#-configuración-y-api)
- [Build y despliegue](#-build-y-despliegue)
- [Buenas prácticas recomendadas](#-buenas-prácticas-recomendadas)
- [Créditos](#-créditos)
- [Licencia](#-licencia)

---

## 🧩 Descripción general

**Proyecto Redes Sonido** es una plataforma de visualización enfocada en monitoreo de laboratorios y espacios técnicos.

Desde una interfaz de administración moderna, se muestran:

- Lecturas actuales por zona.
- Estados visuales para métricas críticas.
- Tendencias históricas de datos.
- Navegación por módulos usando layout administrativo responsivo.

La base visual parte de CoreUI, pero la lógica de negocio de monitoreo está integrada en el módulo de dashboard.

---

## ✨ Características principales

- 📍 **Monitoreo por ubicación** (ej. Esports, Lab de Mecatrónica, Lab de IA, Innovation Lab).
- 🌡️ **Variables ambientales** en tiempo real (temperatura y humedad).
- 🔊 **Medición de sonido** (decibeles) para control de niveles acústicos.
- 📈 **Históricos por rango de tiempo** (Hour, Day, Month, Year).
- ⚡ **Interfaz rápida y responsiva** gracias a Vite + React.
- 🧱 **Arquitectura modular** con componentes reutilizables (CoreUI).

---

## 🛠 Tecnologías utilizadas

### Frontend
- **React 19**
- **React Router 7**
- **Redux 5**
- **Axios**
- **Chart.js / @coreui/react-chartjs**

### UI/Estilos
- **CoreUI React 5**
- **Sass**
- **Simplebar**

### Tooling
- **Vite 6**
- **ESLint + Prettier**

---

## 🗂 Estructura del proyecto

```text
proyectoredessonido/
├── public/
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── layout/
│   ├── scss/
│   ├── views/
│   │   ├── dashboard/
│   │   ├── pages/
│   │   └── ...
│   ├── _nav.js
│   ├── App.js
│   ├── routes.js
│   └── store.js
├── index.html
├── package.json
└── vite.config.mjs
```

---

## ✅ Requisitos previos

Asegúrate de tener instalado:

- **Node.js 18+** (recomendado LTS)
- **npm 9+**

Verificar versiones:

```bash
node -v
npm -v
```

---

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

2. Entra al proyecto:

```bash
cd proyectoredessonido
```

3. Instala dependencias:

```bash
npm install
```

---

## 🚀 Uso en desarrollo

Inicia el servidor local:

```bash
npm start
```

Por defecto, Vite levanta la aplicación en:

- `http://localhost:5173`

---

## 📜 Scripts disponibles

- `npm start` → Inicia entorno de desarrollo con recarga en caliente.
- `npm run build` → Genera build de producción en `dist/`.
- `npm run serve` → Previsualiza localmente el build generado.
- `npm run lint` → Ejecuta validaciones de estilo/código con ESLint.

---

## 🔌 Configuración y API

El dashboard consulta datos remotos mediante peticiones HTTP (Axios) para lecturas en tiempo real e históricos.

### Recomendación para producción

Mover endpoints a variables de entorno (`.env`) para evitar URLs hardcodeadas en componentes:

```env
VITE_API_BASE_URL=https://tu-api.com
```

Y consumir con:

```js
import.meta.env.VITE_API_BASE_URL
```

Esto facilita cambios entre ambientes (`dev`, `staging`, `prod`).

---

## 🏗 Build y despliegue

1. Compilar:

```bash
npm run build
```

2. Verificar build local:

```bash
npm run serve
```

3. Desplegar la carpeta `dist/` en tu hosting preferido (Vercel, Netlify, Nginx, etc.).

---

## 🧠 Buenas prácticas recomendadas

- Mantener componentes pequeños y reutilizables.
- Separar lógica de API en servicios dedicados.
- Centralizar constantes (ubicaciones, rangos de tiempo, keys).
- Evitar duplicación de lógica para transformación de históricos.
- Añadir manejo de errores y estados de carga consistentes en toda la app.


---

## 📄 Licencia

Este proyecto se distribuye bajo licencia **MIT**.

Base de interfaz construida sobre **CoreUI Free React Admin Template** (MIT).
