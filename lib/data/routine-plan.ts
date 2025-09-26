export type RoutineExercise = {
  id: string;
  name: string;
  sets: number;
  repRange: string;
  rest: string;
  tip: string;
  tags: string[];
  description: string;
  technique: string[];
  image?: string;
  video?: string;
};

export type RoutineDay = {
  id: string;
  name: string;
  focus: string;
  intensity: "Bajo" | "Moderado" | "Intenso";
  estimatedDuration: string;
  notes: string;
  warmup: string[];
  finisher?: string[];
  legacyNames?: string[];
  exercises: RoutineExercise[];
};

export type RoutinePlan = {
  name: string;
  goal: string;
  level: string;
  durationWeeks: number;
  frequency: string;
  equipment: string[];
  days: RoutineDay[];
};

export const routinePlan: RoutinePlan = {
  name: "Push Pull Legs 4 dias",
  goal: "Hipertrofia y fuerza intermedia",
  level: "Intermedio",
  durationWeeks: 8,
  frequency: "4 dias",
  equipment: ["Barra", "Mancuernas", "Polea"],
  days: [
    {
      id: "push_a",
      name: "Dia 1 - Push",
      focus: "Pecho, hombro y triceps",
      intensity: "Intenso",
      estimatedDuration: "70-80 min",
      notes: "Enfocate en los basicos compuestos al inicio y termina con aislamientos controlados.",
      warmup: [
        "Remo ligero 5 min",
        "Movilidad hombros",
        "Series de aproximacion en press banca",
      ],
      finisher: ["Flexiones tempo 2x max", "Face pull con goma"],
      legacyNames: ["Dia 1 - Empuje", "Dia 1 - Empuje (Pecho, Hombros, Triceps)"],
      exercises: [
        {
          id: "press_banca",
          name: "Press banca plano",
          sets: 4,
          repRange: "6-8",
          rest: "2-3 min",
          tip: "Mantiene escapulas retraidas y un tempo controlado.",
          tags: ["Compuesto", "Barra"],
          description: "Ejercicio base para desarrollar el pectoral y empuje horizontal.",
          technique: [
            "Alinea pies y crea arco leve en la espalda",
            "Baja la barra al torso sin rebotar",
            "Empuja en linea vertical con control",
          ],
          image: "https://images.unsplash.com/photo-1517832606294-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/press-banca-demo.mp4",
        },
        {
          id: "press_inclinado",
          name: "Press inclinado mancuernas",
          sets: 3,
          repRange: "8-10",
          rest: "90 s",
          tip: "Controla el descenso y junta las mancuernas arriba sin golpear.",
          tags: ["Pecho superior", "Mancuernas"],
          description: "Variante inclinada para enfatizar la parte alta del pecho.",
          technique: [
            "Banco a 30 grados",
            "Codos apuntando a 45 grados",
            "Mantiene tension continua",
          ],
          image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/press-inclinado.mp4",
        },
        {
          id: "press_militar",
          name: "Press militar alterno",
          sets: 4,
          repRange: "6-8",
          rest: "2-3 min",
          tip: "Bloquea gluteos y abdomen para proteger la zona lumbar.",
          tags: ["Hombro", "Barra"],
          description: "Movimiento vertical para deltoides anteriores y laterales.",
          technique: [
            "Agarre un poco mas ancho que los hombros",
            "Empuja en linea recta evitando arco exagerado",
            "Baja hasta la barbilla",
          ],
          image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/press-militar.mp4",
        },
        {
          id: "elevaciones_laterales",
          name: "Elevaciones laterales",
          sets: 3,
          repRange: "12-15",
          rest: "60-90 s",
          tip: "Eleva hasta la linea del hombro sin balanceos.",
          tags: ["Aislamiento", "Mancuernas"],
          description: "Aislamiento para deltoides laterales.",
          technique: [
            "Codos levemente flexionados",
            "Pausa corta arriba",
            "Controla la bajada",
          ],
          image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/elevaciones-laterales.mp4",
        },
        {
          id: "fondos_paralelas",
          name: "Fondos en paralelas",
          sets: 3,
          repRange: "8-12",
          rest: "90 s",
          tip: "Inclina el torso levemente para activar mas pecho.",
          tags: ["Compuesto", "Peso corporal"],
          description: "Ejercicio multiarticular para triceps y pecho.",
          technique: [
            "Mantiene codos cerca del cuerpo",
            "Baja hasta 90 grados en codo",
            "Empuja fuerte al subir",
          ],
          image: "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "triceps_cuerda",
          name: "Extension triceps cuerda",
          sets: 3,
          repRange: "12-15",
          rest: "60 s",
          tip: "Separa la cuerda al final del recorrido para mayor contraccion.",
          tags: ["Triceps", "Polea"],
          description: "Aislamiento enfocado en la cabeza larga del triceps.",
          technique: [
            "Codos pegados al torso",
            "Sin mover el hombro",
            "Controla el retorno",
          ],
        },
      ],
    },
    {
      id: "pull_a",
      name: "Dia 2 - Pull",
      focus: "Espalda, biceps y trapecio",
      intensity: "Intenso",
      estimatedDuration: "70-80 min",
      notes: "Prioriza la tecnica y control en cada tiron.",
      warmup: [
        "Assault bike 5 min",
        "Movilidad dorsal",
        "Series progresivas de dominadas",
      ],
      legacyNames: ["Dia 2 - Tiron", "Dia 2 - Tiron (Espalda, Biceps, Trapecio)"],
      exercises: [
        {
          id: "dominadas",
          name: "Dominadas lastradas",
          sets: 4,
          repRange: "6-8",
          rest: "2-3 min",
          tip: "Barbilla sobre la barra en cada repeticion.",
          tags: ["Compuesto", "Peso corporal"],
          description: "Movimiento calistenico clave para dorsales.",
          technique: [
            "Activa el core antes de tirar",
            "Lleva el pecho hacia la barra",
            "Desciende controlado",
          ],
          image: "https://images.unsplash.com/photo-1546484959-f1e94ff3cba6?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/dominadas.mp4",
        },
        {
          id: "remo_barra",
          name: "Remo con barra",
          sets: 4,
          repRange: "8-10",
          rest: "2-3 min",
          tip: "Tronco inclinado y barra pegada al abdomen.",
          tags: ["Espalda media", "Barra"],
          description: "Ejercicio pesado para dorsal medio y romboides.",
          technique: [
            "Columna neutra",
            "Tira con codos pegados",
            "Pausa sutil arriba",
          ],
        },
        {
          id: "remo_mancuerna",
          name: "Remo mancuerna unilateral",
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "Tira hacia la cadera para activar dorsal.",
          tags: ["Espalda", "Mancuernas"],
          description: "Remo unilateral para corregir desbalances.",
          technique: [
            "Apoya mano y rodilla contraria",
            "Mantiene torso estable",
            "Contrae en cada rep",
          ],
        },
        {
          id: "facepull",
          name: "Face pull",
          sets: 3,
          repRange: "12-15",
          rest: "60-90 s",
          tip: "Codos altos a la altura de los hombros.",
          tags: ["Deltoide trasero", "Polea"],
          description: "Trabajo especifico para posterior de hombro.",
          technique: [
            "Agarra cuerda con pulgares hacia ti",
            "Divide la cuerda al tirar",
            "Mantiene tension continua",
          ],
        },
        {
          id: "curl_barra",
          name: "Curl biceps barra",
          sets: 3,
          repRange: "8-10",
          rest: "90 s",
          tip: "Evita balanceos y controla el tempo.",
          tags: ["Biceps", "Barra"],
          description: "Clasico para masa del biceps.",
          technique: [
            "Codos pegados",
            "Sube en 1 seg, baja en 2 seg",
            "Aplica squeeze arriba",
          ],
        },
        {
          id: "curl_inclinado",
          name: "Curl inclinado",
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "Deja caer los brazos verticales para mayor estiramiento.",
          tags: ["Biceps", "Mancuernas"],
          description: "Variante que enfatiza la cabeza larga del biceps.",
          technique: [
            "Usa banco a 45 grados",
            "Gira las palmas al subir",
            "Controla la bajada",
          ],
        },
      ],
    },
    {
      id: "legs_a",
      name: "Dia 3 - Pierna anterior",
      focus: "Cuadriceps y core",
      intensity: "Moderado",
      estimatedDuration: "65-75 min",
      notes: "Tempos controlados y trabajo de core entre series.",
      warmup: [
        "Bici 5 min",
        "Movilidad cadera",
        "Air squats 2x15",
      ],
      legacyNames: ["Dia 3 - Pierna anterior", "Dia 3 - Empuje (Piernas anterior + Core)"],
      exercises: [
        {
          id: "sentadilla",
          name: "Sentadilla trasera",
          sets: 4,
          repRange: "6-8",
          rest: "2-3 min",
          tip: "Profundidad al paralelo manteniendo columna neutra.",
          tags: ["Compuesto", "Barra"],
          description: "Pilar de fuerza para todo el tren inferior.",
          technique: [
            "Apoya la barra sobre trapecios",
            "Rodillas alineadas con puntas",
            "Empuja el suelo al subir",
          ],
          image: "https://images.unsplash.com/photo-1596306498424-5a26f2520f4d?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/sentadilla.mp4",
        },
        {
          id: "prensa",
          name: "Prensa inclinada",
          sets: 4,
          repRange: "8-10",
          rest: "2 min",
          tip: "Evita bloquear rodillas al extender.",
          tags: ["Cuadriceps", "Maquina"],
          description: "Movimiento guiado para acumular volumen en cuadriceps.",
          technique: [
            "Pies a la anchura de hombros",
            "Profundiza sin despegar la espalda",
            "Controla el movimiento",
          ],
        },
        {
          id: "zancadas",
          name: "Zancadas caminando",
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "Paso largo con torso vertical.",
          tags: ["Pierna", "Mancuernas"],
          description: "Ejercicio unilateral para estabilidad y fuerza.",
          technique: [
            "Rodilla delantera sobre el tobillo",
            "Empuja con el talon",
            "Activa el core",
          ],
        },
        {
          id: "peso_muerto_rumano",
          name: "Peso muerto rumano",
          sets: 3,
          repRange: "8-10",
          rest: "2 min",
          tip: "Barra pegada al cuerpo con flexion minima de rodilla.",
          tags: ["Isquios", "Barra"],
          description: "Variante para enfatizar isquios y gluteos.",
          technique: [
            "Bisagra de cadera",
            "Espalda neutra",
            "Pausa breve abajo",
          ],
        },
        {
          id: "gemelos",
          name: "Elevacion gemelos",
          sets: 4,
          repRange: "12-15",
          rest: "60-90 s",
          tip: "Pausa arriba y abajo para controlar la tension.",
          tags: ["Gemelos", "Maquina"],
          description: "Trabajo especifico para soleo y gastrocnemio.",
          technique: [
            "Sube sobre el metatarso",
            "Mantiene rodillas extendidas",
            "Controla el ritmo",
          ],
        },
        {
          id: "core_combo",
          name: "Plancha y rueda",
          sets: 3,
          repRange: "30-45 s / 8-12",
          rest: "60 s",
          tip: "Control respiracion y evita arquear la zona lumbar.",
          tags: ["Core", "Superset"],
          description: "Superset que mezcla estabilidad y movimiento para el core.",
          technique: [
            "Plancha con hombros alineados",
            "Rueda manteniendo pelvis neutra",
          ],
        },
      ],
    },
    {
      id: "legs_pull",
      name: "Dia 4 - Pierna posterior",
      focus: "Isquios, espalda y core",
      intensity: "Intenso",
      estimatedDuration: "70-80 min",
      notes: "Controla la tecnica en peso muerto y equilibra volumen de traccion.",
      warmup: [
        "Cinta inclinada 5 min",
        "Good mornings ligeros",
        "Bird dog x lado",
      ],
      finisher: ["Crunch en polea", "Pallof press"],
      legacyNames: ["Dia 4 - Pierna posterior", "Dia 4 - Tiron (Piernas posterior + Espalda + Core)"],
      exercises: [
        {
          id: "peso_muerto_conv",
          name: "Peso muerto convencional",
          sets: 4,
          repRange: "5-6",
          rest: "3 min",
          tip: "Mantiene barra pegada y espalda neutra.",
          tags: ["Compuesto", "Barra"],
          description: "Levantamiento basico para fuerza global y cadena posterior.",
          technique: [
            "Posicion de pies a anchura de caderas",
            "Piernas y espalda empujan coordinadas",
            "Cierra el movimiento con gluteos",
          ],
          image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=800&q=80",
          video: "https://storage.googleapis.com/fitness-app-demos/peso-muerto.mp4",
        },
        {
          id: "dominada_supina",
          name: "Dominada supina",
          sets: 4,
          repRange: "8-10",
          rest: "2-3 min",
          tip: "Cierra codos y aprieta dorsales arriba.",
          tags: ["Espalda", "Peso corporal"],
          description: "Version de agarre supino para trabajar biceps y dorsales.",
          technique: [
            "Agarre al ancho de hombros",
            "Tira con dorsales",
            "Controla el descenso",
          ],
        },
        {
          id: "remo_polea",
          name: "Remo en polea",
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "Tira hacia el ombligo y contrae escapulas.",
          tags: ["Espalda", "Polea"],
          description: "Movimiento guiado para volumen en dorsales.",
          technique: [
            "Mantiene torso estable",
            "No encorvar hombros",
            "Recorrido completo",
          ],
        },
        {
          id: "curl_femoral",
          name: "Curl femoral",
          sets: 4,
          repRange: "10-12",
          rest: "90 s",
          tip: "Controla la bajada y pausa 1 segundo arriba.",
          tags: ["Isquios", "Maquina"],
          description: "Aislamiento directo para femorales.",
          technique: [
            "Rodillas alineadas con eje de la maquina",
            "Apoya cadera firmemente",
            "Evita arquear la espalda",
          ],
        },
        {
          id: "curl_martillo",
          name: "Curl martillo",
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "Agarre neutro y codos fijos.",
          tags: ["Biceps", "Mancuernas"],
          description: "Trabaja braquial y antebrazo.",
          technique: [
            "Controla el tempo",
            "Evita balanceos",
            "Sujeta firme las mancuernas",
          ],
        },
        {
          id: "core_polea",
          name: "Crunch polea",
          sets: 3,
          repRange: "12-15",
          rest: "60 s",
          tip: "Flexiona desde el torso manteniendo cadera estable.",
          tags: ["Core", "Polea"],
          description: "Movimiento guiado para recto abdominal.",
          technique: [
            "Rodillas apoyadas",
            "Tira de la cuerda hacia rodillas",
            "Pausa al final",
          ],
        },
      ],
    },
  ],
};

