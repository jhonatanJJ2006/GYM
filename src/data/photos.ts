import type { PoseId } from "./poses.ts";

export type Photo = {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};

const CC_BY = "https://creativecommons.org/licenses/by/2.0/";
const CC_BY_4 = "https://creativecommons.org/licenses/by/4.0/";
const CC_BY_SA_2 = "https://creativecommons.org/licenses/by-sa/2.0/";
const CC_BY_SA_3 = "https://creativecommons.org/licenses/by-sa/3.0/";
const CC_BY_SA_4 = "https://creativecommons.org/licenses/by-sa/4.0/";
const PD = "https://creativecommons.org/publicdomain/mark/1.0/";
const PEXELS = "https://www.pexels.com/license/";

function shot(
  file: string,
  alt: string,
  author: string,
  license: string,
  licenseUrl: string,
  commons: string,
  sourceUrl?: string,
): Photo {
  const page = commons.replace(/ /g, "_");
  return {
    src: `/photos/${file}`,
    alt,
    author,
    license,
    licenseUrl,
    source: sourceUrl ?? `https://commons.wikimedia.org/wiki/File:${page}`,
  };
}

const meals = {
  porridge: shot(
    "meals/porridge.jpg",
    "Tazón de avena",
    "Keypunch",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "Bowl of porridge with spoon.jpg",
  ),
  eggs: shot(
    "meals/eggs.jpg",
    "Huevos revueltos",
    "OmegaFallon",
    "CC BY 4.0",
    CC_BY_4,
    "Scrambled eggs with basil.jpg",
  ),
  avocadoEggs: shot(
    "meals/avocado-eggs.jpg",
    "Tostada con aguacate y huevo",
    "Asramsey",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Fresh Avocado Toast with Egg.jpg",
  ),
  chickenRice: shot(
    "meals/chicken-rice.jpg",
    "Arroz con pollo y tomate",
    "Petar Milošević",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Parboiled rice with chicken, peppers, cucurbita, peas and tomato.jpg",
  ),
  chickenPasta: shot(
    "meals/chicken-pasta.jpg",
    "Pollo con pasta y brócoli",
    "FitTasteTic",
    "CC BY-SA 2.0",
    CC_BY_SA_2,
    "Chicken with pasta and mushroom ragout and Broccoli.jpg",
  ),
  plantainChicken: shot(
    "meals/plantain-chicken.jpg",
    "Pollo con verde, fréjol y arroz",
    "Endee n",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Fried rice, baked beans with fried plantains and chicken.jpg",
  ),
  plantainEggs: shot(
    "meals/plantain-eggs.jpg",
    "Verde con huevo",
    "Edithobayaa1",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Beans, fried plantain with egg.jpg",
  ),
  tunaSandwich: shot(
    "meals/tuna-sandwich.jpg",
    "Sándwich de atún",
    "Le living and co",
    "CC BY 2.0",
    CC_BY,
    "Tuna sandwich.jpg",
  ),
  tunaRice: shot(
    "meals/tuna-rice.jpg",
    "Arroz con atún",
    "pelican",
    "CC BY-SA 2.0",
    CC_BY_SA_2,
    "Spicy tuna rice bowl (35032450572).jpg",
  ),
  yogurt: shot(
    "meals/yogurt.jpg",
    "Tazón de yogur con fruta",
    "Jumbocombo0811",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Yogurt fruit bowl.jpg",
  ),
  beefRice: shot(
    "meals/beef-rice.jpg",
    "Arroz con carne molida",
    "Alpha",
    "CC BY-SA 2.0",
    CC_BY_SA_2,
    "Mince Beef Fried Rice - Nam Loong Seafood Restaurant AUD8 (4730288622).jpg",
  ),
  chickenPotato: shot(
    "meals/chicken-potato.jpg",
    "Pollo con papa",
    "HaJunkiyada",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Liat Portal for Foodie Disorder - Homemade Grilled Chicken with Baked Potatoes and Israeli Salad.jpg",
  ),
  sweetPotato: shot(
    "meals/sweet-potato.jpg",
    "Camote horneado",
    "Ella Olsson",
    "CC BY 2.0",
    CC_BY,
    "Baked Cinnamon Sweet Potatoes (30863441397).jpg",
  ),
  corn: shot(
    "meals/corn.jpg",
    "Choclo cocido",
    "NeoBatfreak",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Air fried corn-on-the-cob (United States).jpg",
  ),
  lentilsRice: shot(
    "meals/lentils-rice.jpg",
    "Arroz con lenteja",
    "Joey Doll",
    "CC BY 2.0",
    CC_BY,
    "Lentils and rice (29307658418).jpg",
  ),
  cheeseApple: shot(
    "meals/cheese-apple.jpg",
    "Pan con queso y manzana",
    "Kitchen Life of a Navy Wife",
    "CC BY 2.0",
    CC_BY,
    "Rosemary Apple Butter Grilled Cheese Sandwich.jpg",
  ),
  boiledEgg: shot(
    "meals/boiled-egg.jpg",
    "Huevo duro",
    "Marc-Lautenbacher",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Hard boiled egg on breakfast table.jpg",
  ),
  bananaToast: shot(
    "meals/banana-toast.jpg",
    "Pan con plátano",
    "Navin75",
    "CC BY-SA 2.0",
    CC_BY_SA_2,
    "Bananas Foster French Toast (15288002250).jpg",
  ),
};

const exercises: Record<PoseId, Photo> = {
  bench: shot("exercises/bench.jpg", "Press de banca con barra", "Lance Cpl. Ronald W. Stauffer", "Dominio público", PD, "Bench press 1.jpg"),
  incline: shot(
    "exercises/incline.jpg",
    "Press inclinado con mancuernas",
    "Jeffery J. Gabriel Jr., U.S. Navy",
    "Dominio público",
    PD,
    "US Navy 070227-N-0998G-003 Operations Specialist 3rd Class Greg Ivy, a native of Sacramento, Calif., incline presses two 30-pound dumbbells as Quartermaster Seaman Julian Marulanda, a native of Bridgeport, Conn., acts as spotte.jpg",
  ),
  fly: shot(
    "exercises/fly-cable.jpg",
    "Cruces en polea",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Chest flies with cable machine - cable crossover flies.jpg",
  ),
  dip: shot("exercises/dip.jpg", "Fondos en paralelas", "Cpl. Colby Brown", "Dominio público", PD, "Barbells, Dumbbells, Kettlebells, Oh My! 110823-M-ED643-008.jpg"),
  pushdown: shot(
    "exercises/pushdown.jpg",
    "Hombre en extensión de tríceps con cuerda",
    "foad shariyati",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/young-man-exercising-with-cable-machine-in-gym-30672398/",
  ),
  lateral: shot(
    "exercises/lateral.jpg",
    "Elevaciones laterales con mancuernas",
    "George Stepanek",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "DumbbellLateralRaise.JPG",
  ),
  squat: shot(
    "exercises/squat.jpg",
    "Sentadilla con barra",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Young attractive man athlete doing exercise with the barbell in the gym.jpg",
  ),
  press: shot(
    "exercises/press.jpg",
    "Hombre en prensa de piernas",
    "Abooyeah",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Marian-Leg-Press.jpg",
  ),
  "press-high": shot(
    "exercises/press.jpg",
    "Hombre en prensa de piernas",
    "Abooyeah",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Marian-Leg-Press.jpg",
  ),
  rdl: shot(
    "exercises/rdl.jpg",
    "Peso muerto con mancuernas, cadera atrás",
    "George Stepanek",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "DumbbellDeadlift.JPG",
  ),
  lunge: shot(
    "exercises/lunge.jpg",
    "Hombre en zancada con mancuernas",
    "marcuschanmedia",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/man-performing-dumbbell-lunges-in-gym-29825222/",
  ),
  bulgarian: shot(
    "exercises/lunge.jpg",
    "Hombre en zancada con mancuernas",
    "marcuschanmedia",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/man-performing-dumbbell-lunges-in-gym-29825222/",
  ),
  "leg-curl": shot(
    "exercises/leg-curl.jpg",
    "Hombre en curl femoral sentado",
    "Gustavo Gimenez",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/man-in-gray-shirt-and-orange-shorts-doing-leg-exercise-9152547/",
  ),
  calf: shot(
    "exercises/calf.jpg",
    "Gemelos de pie con mancuernas",
    "George Stepanek",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "DumbbellStandingCalfRaise.JPG",
  ),
  "calf-seat": shot(
    "exercises/calf-seat.jpg",
    "Gemelos sentado",
    "George Stepanek",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "SeatedCalfRaiseMachineExercise.JPG",
  ),
  pulldown: shot(
    "exercises/pulldown.jpg",
    "Jalón al pecho",
    "Abooyeah",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Amer-Lat-Pulldown.jpg",
  ),
  row: shot(
    "exercises/row.jpg",
    "Remo landmine",
    "Eric Astrauskas",
    "CC BY 2.0",
    CC_BY,
    "Landmine Bent-Over Rows.jpg",
  ),
  "cable-row": shot(
    "exercises/cable-row.jpg",
    "Hombre en remo sentado en polea",
    "Abooyeah",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Marian-Rows.jpg",
  ),
  face: shot(
    "exercises/row.jpg",
    "Remo landmine",
    "Eric Astrauskas",
    "CC BY 2.0",
    CC_BY,
    "Landmine Bent-Over Rows.jpg",
  ),
  curl: shot(
    "exercises/curl.jpg",
    "Curl de bíceps con barra",
    "Scoobytrash",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "StandingBarbellCurl.jpg",
  ),
  hammer: shot(
    "exercises/curl-one.jpg",
    "Curl de bíceps",
    "Scoobytrash",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "StandingBarbellCurl.jpg",
  ),
  ohp: shot(
    "exercises/ohp.jpg",
    "Press de hombro con mancuernas",
    "Cpl. Adam T. Leyendecker",
    "Dominio público",
    PD,
    "USMC-110825-M-SM240-085.jpg",
  ),
  rear: shot(
    "exercises/row.jpg",
    "Remo landmine",
    "Eric Astrauskas",
    "CC BY 2.0",
    CC_BY,
    "Landmine Bent-Over Rows.jpg",
  ),
  overhead: shot(
    "exercises/overhead-2.jpg",
    "Extensión de tríceps sobre la cabeza",
    "Tyler Read",
    "CC BY 2.0",
    CC_BY,
    "Girl double dumbbell tricep extension.jpg",
  ),
  kickback: shot(
    "exercises/overhead-2.jpg",
    "Extensión de tríceps",
    "Tyler Read",
    "CC BY 2.0",
    CC_BY,
    "Girl double dumbbell tricep extension.jpg",
  ),
  "incline-curl": shot(
    "exercises/curl-one.jpg",
    "Curl de bíceps",
    "Scoobytrash",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "StandingBarbellCurl.jpg",
  ),
  thrust: shot("exercises/bridge.jpg", "Puente de cadera", "Sasha Kargaltsev", "CC BY 2.0", CC_BY, "Bridge pose.jpg"),
  deadbug: shot(
    "exercises/deadbug.jpg",
    "Dead bug, brazo y pierna contrarios",
    "Jaykayfit",
    "CC BY-SA 3.0",
    CC_BY_SA_3,
    "Alternating upper and lower extremities.jpg",
  ),
  plank: shot(
    "exercises/plank.jpg",
    "Hombre en plancha sobre los antebrazos",
    "cottonbro studio",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/man-in-black-shorts-doing-planking-4047103/",
  ),
  "plank-tap": shot(
    "exercises/pushup.jpg",
    "Hombre en plancha alta",
    "Julia Larson",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/athletic-ethnic-sportsman-doing-push-ups-with-dumbbells-6456138/",
  ),
  crunch: shot("exercises/crunch.jpg", "Crunch en el suelo", "George Stepanek", "CC BY-SA 3.0", CC_BY_SA_3, "FloorCrunch.JPG"),
  pallof: shot(
    "exercises/fly-cable.jpg",
    "Hombre en cruces de polea",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Chest flies with cable machine - cable crossover flies.jpg",
  ),
  "leg-raise": shot(
    "exercises/leg-raise.jpg",
    "Elevación de piernas",
    "PTPioneer",
    "CC BY 2.0",
    CC_BY,
    "Abdominal exercise leg raise.jpg",
  ),
  "side-plank": shot("exercises/side-plank.jpg", "Plancha lateral", "Jaykayfit", "CC BY-SA 3.0", CC_BY_SA_3, "Side Plank.jpg"),
  "side-hip": shot(
    "exercises/side-plank-2.jpg",
    "Plancha lateral",
    "Tyler Read",
    "CC BY 2.0",
    CC_BY,
    "Girl exercising side plank.jpg",
  ),
  farmer: shot(
    "exercises/farmer2.jpg",
    "Paseo del granjero con mancuernas",
    "Lance Cpl. Mondo Lescaud",
    "Dominio público",
    PD,
    "USMC-111018-M-FY706-002.jpg",
  ),
  twist: shot(
    "exercises/twist.jpg",
    "Giro de tronco sentado",
    "Mr. Yoga",
    "CC BY-SA 4.0",
    CC_BY_SA_4,
    "Mr-yoga-svastika-legs-twist.jpg",
  ),
  climber: shot(
    "exercises/pushup.jpg",
    "Hombre en plancha alta",
    "Julia Larson",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/athletic-ethnic-sportsman-doing-push-ups-with-dumbbells-6456138/",
  ),
  abwheel: shot("exercises/abwheel.jpg", "Rueda abdominal", "Corn cheese", "CC BY-SA 4.0", CC_BY_SA_4, "Ab wheel.jpg"),
  breathe: shot("exercises/breathe.jpg", "Acostado, respirando", "Joseph RENGER", "CC BY-SA 3.0", CC_BY_SA_3, "Shavasana.jpg"),
  bike: shot(
    "exercises/bike.jpg",
    "Bicicleta estática",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Young attractive man practicing on exercise bike during cross training in a gym.jpg",
  ),
  walk: shot(
    "exercises/walk.jpg",
    "Hombre caminando en la caminadora",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Fit young man caucasian running on machine treadmill workout in gym.jpg",
  ),
  bridge: shot("exercises/bridge.jpg", "Puente de cadera", "Sasha Kargaltsev", "CC BY 2.0", CC_BY, "Bridge pose.jpg"),
  band: shot(
    "exercises/band.jpg",
    "Hombro con banda elástica",
    "Tyler Read",
    "CC BY 2.0",
    CC_BY,
    "Girl doing lateral raises with bands.jpg",
  ),
  circles: shot(
    "exercises/arms.jpg",
    "Brazos abiertos a la altura del hombro",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "The gym girl is stretching her arms.jpg",
  ),
};

function has(text: string, pattern: RegExp) {
  return pattern.test(text);
}

export function mealPhoto(ingredients: readonly string[]): Photo {
  const text = ingredients.join(" ").toLowerCase();
  if (has(text, /verde/) && has(text, /pechuga|pollo/)) return meals.plantainChicken;
  if (has(text, /verde/) && has(text, /huevo/)) return meals.plantainEggs;
  if (has(text, /pasta/)) return meals.chickenPasta;
  if (has(text, /camote/)) return meals.sweetPotato;
  if (has(text, /choclo/)) return meals.corn;
  if (has(text, /lenteja/) && has(text, /arroz/)) return meals.lentilsRice;
  if (has(text, /aguacate/) && has(text, /huevo/)) return meals.avocadoEggs;
  if (has(text, /pechuga|pollo/) && has(text, /papa/)) return meals.chickenPotato;
  if (has(text, /pechuga|pollo/)) return meals.chickenRice;
  if (has(text, /carne/)) return meals.beefRice;
  if (has(text, /atún/) && has(text, /arroz/)) return meals.tunaRice;
  if (has(text, /atún/)) return meals.tunaSandwich;
  if (has(text, /huevo duro/)) return meals.boiledEgg;
  if (has(text, /queso/) && has(text, /manzana/)) return meals.cheeseApple;
  if (has(text, /manzana/) && has(text, /pan/)) return meals.cheeseApple;
  if (has(text, /yogur/)) return meals.yogurt;
  if (has(text, /plátano/) && has(text, /pan|miel/)) return meals.bananaToast;
  if (has(text, /huevo/)) return meals.eggs;
  return meals.porridge;
}

const BY_NAME: Record<string, Photo> = {
  "Extensión de cuádriceps": shot(
    "exercises/leg-ext.jpg",
    "Extensión de cuádriceps en máquina",
    "Nenad Stojkovic",
    "CC BY 2.0",
    CC_BY,
    "Young attractive man doing leg with machine in gym. Back view closeup.jpg",
  ),
  "Sentadilla hack": shot(
    "exercises/hack.jpg",
    "Sentadilla hack en máquina",
    "brett jordan",
    "CC BY 2.0",
    CC_BY,
    "David Jobson & Ziggy Chima; machine hack squat.jpg",
  ),
  "Press de pecho en máquina": shot(
    "exercises/chest-press.jpg",
    "Hombre en press de pecho en máquina",
    "Pexels",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/muscular-man-exercising-with-shoulder-press-machine-in-gym-3837293/",
  ),
  "Aperturas en pec deck": shot(
    "exercises/pec-deck.jpg",
    "Hombre en aperturas en pec deck",
    "Pexels",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/man-training-at-gym-on-chest-fly-machine-14616295/",
  ),
  "Elevación de piernas en silla romana": shot(
    "exercises/roman-chair.jpg",
    "Hombre en silla romana",
    "Julia Larson",
    "Licencia Pexels",
    PEXELS,
    "",
    "https://www.pexels.com/photo/black-sportsman-doing-abs-exercises-on-machine-6455947/",
  ),
};

export function exercisePhoto(pose: PoseId, name?: string): Photo {
  if (name && BY_NAME[name]) return BY_NAME[name];
  return exercises[pose];
}

export function photoCredit(photo: Photo): string {
  return `${photo.author} · ${photo.license}`;
}

export const ALL_PHOTOS: Photo[] = [...Object.values(meals), ...Object.values(exercises), ...Object.values(BY_NAME)];
