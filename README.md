# Athlos Fit 🏋️‍♂️

**Athlos Fit** es una aplicación de seguimiento de ejercicios moderna y minimalista, diseñada para atletas que buscan claridad en sus métricas y progresos. Construida con **Next.js 15**, **Capacitor** y **Firebase**, ofrece una experiencia nativa fluida tanto en web como en móvil (Android/iOS).

## 🚀 Características Principales

### 📱 Experiencia de Usuario (UX)
*   **Dashboard Unificado**: Resumen visual de tu estado físico (Foto de perfil, Peso, Altura, IMC) en una cabecera integrada y moderna.
*   **Diseño Responsive**: Interfaz adaptada perfectamente a Desktop, Tablet y Móvil.
*   **Modo Oscuro/Claro**: Elementos visuales con glassmorphism y paletas de colores cuidadas (Azul/Amarillo).

### 📊 Seguimiento y Progreso
*   **Gráficas de Volumen**: Visualiza cuántas series efectivas realizas cada semana para gestionar tu fatiga y sobrecarga progresiva.
*   **Historial de Fuerza (1RM)**: Estimaciones automáticas de tu repetición máxima en ejercicios clave.
*   **Composición Corporal**: Gráficas de peso y % de grasa corporal a lo largo del tiempo.
*   **Gestión de Rutinas**: Crea rutinas personalizadas o utiliza plantillas predefinidas (Push/Pull/Legs, Arnold Split, etc.).

### 🔐 Seguridad y Datos
*   **Autenticación Robusta**: Inicio de sesión seguro con Google o Email/Contraseña.
*   **Datos en la Nube**: Tu progreso se sincroniza en tiempo real con Firebase Firestore.
*   **Privacidad**: Reglas de seguridad estrictas; solo tú puedes acceder a tus datos.

---

## 🛠️ Stack Tecnológico

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS + Framer Motion (Animaciones)
*   **Base de Datos**: Firebase Firestore
*   **Autenticación**: Firebase Auth
*   **Gráficos**: Recharts
*   **Estado**: Zustand
*   **Móvil**: Capacitor (iOS & Android)
*   **Testing**: Vitest + React Testing Library

---

## ⚙️ Configuración del Proyecto

### 1. Requisitos Previos
*   Node.js 18+
*   Cuenta de Firebase activa

### 2. Instalación
```bash
git clone <repo-url>
cd fitness-app
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env.local` en la raíz con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
# Abre http://localhost:3000
```

---

## 🧪 Testing

El proyecto cuenta con una suite de tests robusta testeando flujos críticos como la autenticación y la integridad de los datos.

```bash
# Ejecutar todos los tests
npm run test  # o npx vitest run

# Ejecutar tests con interfaz gráfica
npx vitest ui
```

---

## 📱 Compilación Móvil (Capacitor)

Para generar las versiones nativas:

**Android:**
```bash
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

**iOS:**
```bash
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

---

## 📂 Estructura del Proyecto

*   `app/`: Rutas y páginas (Next.js App Router).
*   `components/`: Componentes UI reutilizables (Botones, Gráficos, Tarjetas).
*   `lib/`: Lógica de negocio, hooks de Firebase y utilidades.
*   `styles/`: Archivos CSS globales.

---

## 🔒 Reglas de Firestore Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function authed() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }

    match /users/{uid}/{document=**} {
      allow read, write: if authed() && isOwner(uid);
    }
  }
}
```
