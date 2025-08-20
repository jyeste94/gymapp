# Fitness App (Next.js 15 + Firebase)

Stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Firebase (Auth/Firestore/Storage) + react-hook-form + zod + Recharts + Zustand + date-fns.

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Configurar Firebase
1. Crea un proyecto en https://console.firebase.google.com
2. Habilita **Authentication** (Email/Password y Google)
3. Crea **Firestore** en modo producción
4. (Opcional) Habilita **Storage**
5. Copia el config web en `.env.local`

### `.env.local` ejemplo
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Reglas Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function authed() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    match /users/{uid}/{document=**} {
      allow read, write: if authed() && isOwner(uid);
    }
    match /users/{uid}/meta/{doc} {
      allow read, write: if authed() && isOwner(uid);
    }
  }
}
```

## Despliegue
- **Vercel** recomendado. Añade las mismas ENV.
