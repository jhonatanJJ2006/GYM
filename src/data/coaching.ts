import type { PoseId } from "./poses.ts";

export type Coach = {
  pose: PoseId;
  weight: string;
  suggested: boolean;
  how: string;
};

const BODY = "Peso corporal, sin carga extra";

function load(pose: PoseId, weight: string, how: string, suggested = true): Coach {
  return { pose, weight, suggested, how };
}

function body(pose: PoseId, how: string): Coach {
  return { pose, weight: BODY, suggested: false, how };
}

const BY_NAME: Record<string, Coach> = {
  "Press banca con barra o mancuernas": load(
    "bench",
    "20 kg en la barra, o 12 kg por mancuerna",
    "Acostado, baja la barra al pecho y empújala hasta extender los codos.",
  ),
  "Press inclinado con mancuernas": load(
    "incline",
    "10 kg por mancuerna",
    "Banco a unos 30–45°. Empuja las mancuernas desde el pecho hacia arriba.",
  ),
  "Aperturas en polea o contractor": load(
    "fly",
    "8 kg por lado en la polea",
    "Brazos casi estirados, junta las manos por delante del pecho sin subir los hombros.",
  ),
  "Fondos en banco": body("dip", "Manos en el banco, baja doblando los codos y empuja hasta estirarlos."),
  "Extensión de tríceps en polea": load(
    "pushdown",
    "10 kg en la polea",
    "Codos pegados al cuerpo. Solo se mueve el antebrazo hacia abajo.",
  ),
  "Elevaciones laterales": load(
    "lateral",
    "4 kg por mancuerna",
    "Sube los brazos hasta la altura de los hombros, con una ligera flexión de codo.",
  ),
  "Sentadilla goblet o con barra": load(
    "squat",
    "16 kg en goblet, o la barra de 20 kg",
    "Baja la cadera atrás y abajo hasta que el muslo quede casi paralelo al suelo.",
  ),
  Prensa: load("press", "40 kg de carga, sin contar el carro", "Empuja la plataforma hasta casi estirar las rodillas, sin bloquearlas."),
  "Peso muerto rumano": load(
    "rdl",
    "30 kg en la barra, o 12 kg por mancuerna",
    "Rodillas blandas, cadera atrás y espalda recta. La carga baja rozando las piernas.",
  ),
  "Zancadas caminando": load("lunge", "8 kg por mancuerna", "Da un paso largo, baja la rodilla de atrás y sube empujando el pie de adelante."),
  "Curl femoral": load("leg-curl", "15 kg en la máquina", "Boca abajo, lleva los talones hacia el glúteo y baja despacio."),
  "Gemelos de pie": load("calf", "20 kg en la máquina, o el peso corporal si no hay máquina", "Sube sobre las puntas y baja el talón por debajo del nivel del pie."),
  "Jalón al pecho o dominadas asistidas": load(
    "pulldown",
    "30 kg en el jalón, o la asistencia que te deje 6–8 repeticiones limpias",
    "Tira la barra hacia la parte alta del pecho, llevando los codos hacia abajo.",
  ),
  "Remo con barra o mancuerna": load(
    "row",
    "30 kg en la barra, o 14 kg por mancuerna",
    "Tronco inclinado, tira la carga hacia la cadera y aprieta la escápula.",
  ),
  "Remo en polea sentado": load("cable-row", "25 kg en la polea", "Sentado, tira el agarre hacia el abdomen sin echar el torso atrás."),
  "Face pull": load("face", "8 kg en la cuerda", "Tira hacia la cara, con los codos altos y las manos a los lados de la frente."),
  "Curl de bíceps con barra": load("curl", "15 kg en la barra", "Codos quietos al lado del cuerpo. Sube la barra y baja en dos segundos."),
  "Curl martillo": load("hammer", "8 kg por mancuerna", "Igual que el curl, con las palmas mirándose. Codos no se van adelante."),
  "Press militar con mancuernas": load(
    "ohp",
    "8 kg por mancuerna",
    "De pie, empuja las mancuernas desde los hombros hasta arriba, sin arquear la espalda.",
  ),
  "Pájaros o elevaciones posteriores": load(
    "rear",
    "3 kg por mancuerna",
    "Tronco casi paralelo al suelo. Abre los brazos hacia los lados, apretando la espalda alta.",
  ),
  Pájaros: load("rear", "3 kg por mancuerna", "Tronco inclinado. Abre los brazos a los lados hasta sentir la espalda alta."),
  "Extensión de tríceps sobre la cabeza": load(
    "overhead",
    "8 kg en una mancuerna",
    "La mancuerna por detrás de la cabeza. Estira los codos sin abrirlos.",
  ),
  "Extensión en polea": load("pushdown", "10 kg en la polea", "Codos fijos. Empuja el agarre hacia abajo hasta estirar el brazo."),
  "Patada de tríceps": load("kickback", "4 kg por mancuerna", "Tronco inclinado, brazo pegado al costado. Estira el antebrazo hacia atrás."),
  "Curl con barra": load("curl", "15 kg en la barra", "Codos al lado del torso. Sube la barra y controla la bajada."),
  "Curl inclinado con mancuernas": load(
    "incline-curl",
    "6 kg por mancuerna",
    "Banco inclinado, brazos colgando detrás del torso. Dobla el codo sin adelantarlo.",
  ),
  "Sentadilla búlgara o zancada": load(
    "bulgarian",
    "8 kg por mancuerna",
    "Pie de atrás en el banco. Baja en la pierna de adelante hasta que el muslo quede paralelo.",
  ),
  "Hip thrust o puente con peso": load(
    "thrust",
    "30 kg en la barra sobre la cadera",
    "Hombros apoyados, empuja el suelo con los talones hasta alinear rodilla, cadera y hombro.",
  ),
  "Prensa, pies altos": load(
    "press-high",
    "40 kg de carga, sin contar el carro",
    "Pies altos en la plataforma para cargar más el femoral y el glúteo. No bloquees las rodillas.",
  ),
  "Gemelos sentado": load("calf-seat", "15 kg sobre las rodillas", "Sentado, sube las puntas y baja el talón despacio."),
  "Camina o bici suave": body("bike", "Camina o pedalea suave, sin perder el aire. Es entrada en calor, no un sprint."),
  Camina: body("walk", "Camina a paso largo y relajado durante los 8 minutos."),
  "Dead bug": body("deadbug", "Boca arriba, baja un brazo y la pierna contraria sin despegar la zona lumbar."),
  Plancha: body("plank", "Codos bajo los hombros, cuerpo en una línea. Aprieta abdomen y glúteo."),
  "Crunch en polea o en el suelo": load(
    "crunch",
    "peso corporal; si usas polea, 5 kg",
    "Acerca el pecho a la pelvis, sin tirar del cuello. El rango es corto.",
  ),
  "Pallof press": load("pallof", "6 kg en la polea", "De lado a la polea, empuja el agarre al frente y no dejes que te rote el torso."),
  "Elevación de piernas": body("leg-raise", "Boca arriba, sube las piernas juntas y bájalas sin arquear la espalda."),
  "Plancha lateral": body("side-plank", "Apóyate en un antebrazo. Cadera arriba, cuerpo recto de la cabeza a los pies."),
  "Paseo del granjero con mancuernas": load("farmer", "10 kg por mancuerna", "Camina erguido, hombros abajo y abdomen firme, sin balancear las mancuernas."),
  "Plancha con toque de hombro": body("plank-tap", "En plancha alta, toca el hombro contrario sin rotar la cadera."),
  "Bicho muerto con pausa": body("deadbug", "Igual que el dead bug: pausa un segundo abajo, con la lumbar pegada al suelo."),
  "Giros con disco ligero, sentado": load("twist", "disco de 2,5 kg", "Sentado, gira el disco de un lado al otro con el pecho alto. El movimiento sale del tronco."),
  "Escaladores lentos": body("climber", "En plancha, lleva una rodilla al pecho y vuelve despacio. No rebotes."),
  "Plancha lateral con cadera": body("side-hip", "En plancha lateral, baja la cadera hacia el suelo y súbela por encima de la línea del cuerpo."),
  "Ab wheel o desplome de rodillas": body("abwheel", "De rodillas, rueda hacia adelante solo hasta donde el abdomen aguante, y vuelve."),
  "Respiración acostado, costillas abajo": body("breathe", "Boca arriba, una mano en las costillas. Exhala y deja que bajen, sin empujar el cuello."),
};

const WARMUPS: { test: (detail: string) => boolean; coach: Coach }[] = [
  {
    test: (detail) => detail.includes("bici"),
    coach: load("bike", "2 kg por mancuerna en las series ligeras del press", "Pedalea suave y luego haz dos series muy ligeras del primer press."),
  },
  {
    test: (detail) => detail.includes("sentadilla al aire"),
    coach: body("squat", "Sentadilla al aire, sin carga, y dos series ligeras del primer ejercicio."),
  },
  {
    test: (detail) => detail.includes("jalón"),
    coach: load("pulldown", "15 kg en el jalón, solo para entrar en calor", "Jalón ligero, rango completo, sin llegar al esfuerzo."),
  },
  {
    test: (detail) => detail.includes("muy ligeras"),
    coach: load("circles", "2 kg por mancuerna", "Círculos de hombro y un par de series vacías antes del press militar."),
  },
  {
    test: (detail) => detail.includes("bandas"),
    coach: load("band", "banda suave, o 2 kg por mancuerna", "Abre la banda por delante del pecho para despertar el hombro."),
  },
  {
    test: (detail) => detail.includes("puente"),
    coach: body("bridge", "Puente de glúteo en el suelo, apretando arriba un segundo."),
  },
];

export function coachFor(name: string, detail: string): Coach {
  if (name === "Calentamiento") {
    return WARMUPS.find((item) => item.test(detail))?.coach ?? body("circles", detail);
  }
  return (
    BY_NAME[name] ?? {
      pose: "circles",
      weight: BODY,
      suggested: false,
      how: detail,
    }
  );
}

export function describeReps(detail: string): string {
  const hold = detail.match(/^(\d+)×(\d+(?:–\d+)?)\s*s(.*)$/);
  if (hold) {
    const note = hold[3].replace(/^[,·]\s*/, "").trim();
    return `${hold[1]} series · ${hold[2]} segundos${note ? ` · ${note}` : ""}`;
  }
  const sets = detail.match(/^(\d+)×(\d+(?:–\d+)?)(.*)$/);
  if (sets) {
    let tail = sets[3].trim().replace(/^·\s*/, "");
    let where = "";
    const per = tail.match(/^(por [^·,]+)/);
    if (per) {
      where = ` ${per[1]}`;
      tail = tail.slice(per[0].length).replace(/^[,·]\s*/, "").trim();
    }
    const namedRest = tail.match(/descanso\s+[\d–]+\s*(?:min|s)/);
    const shortRest = tail.match(/^[\d–]+\s*(?:min|s)$/);
    const rest = namedRest?.[0] ?? (shortRest ? `descanso ${shortRest[0]}` : "");
    const extra = rest ? "" : tail;
    return [`${sets[1]} series · ${sets[2]} repeticiones${where}`, rest, extra].filter(Boolean).join(" · ");
  }
  const meters = detail.match(/^(\d+)×(\d+)\s*m$/);
  if (meters) return `${meters[1]} series · ${meters[2]} metros`;
  const minutes = detail.match(/^(\d+)\s*min$/);
  if (minutes) return `${minutes[1]} minutos`;
  return detail;
}
