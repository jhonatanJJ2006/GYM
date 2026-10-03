export type Meal = {
  time: string;
  /** Minuto en que cierra la ventana. Si no hay, la comida es un punto en el día. */
  end?: string;
  role: string;
  kcal: number;
  protein: number;
  ingredients: string[];
  steps: string[];
};

export type MealDay = {
  total: string;
  items: Meal[];
};

function meal(
  time: string,
  role: string,
  kcal: number,
  protein: number,
  ingredients: string[],
  steps: string[],
  end?: string,
): Meal {
  return { time, end, role, kcal, protein, ingredients, steps };
}

export function mealWhen(item: Meal): string {
  return item.end ? `${item.time}–${item.end}` : item.time;
}

export const MEALS: Record<number, MealDay> = {
  1: {
    total: "2780 kcal · 141 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno",
        590,
        30,
        ["2 huevos", "60 g de avena (unas 6 cucharadas)", "250 ml de leche semidescremada", "1 plátano (120 g)"],
        [
          "Echa la avena en la leche y caliéntala 3 minutos, moviendo, en una olla chica o al microondas en dos tandas de 90 s.",
          "En un sartén antiadherente, revuelve los 2 huevos a fuego medio 2–3 minutos. Una gota de aceite basta.",
          "Sirve el plátano al lado. Unos 12 minutos.",
        ],
      ),
      meal(
        "10:30",
        "Snack",
        340,
        14,
        ["200 g de yogur natural", "15 g de maní (un puñado chico)", "1 rebanada de pan integral", "1 manzana"],
        [
          "Parte la manzana.",
          "Pon el yogur en un tazón, el maní encima y el pan al lado.",
          "No se cocina. 5 minutos.",
        ],
      ),
      meal(
        "13:00",
        "Almuerzo",
        720,
        44,
        [
          "110 g de pechuga cruda",
          "320 g de arroz cocido (unos 110 g en seco, mejor del día anterior)",
          "100 g de lenteja cocida",
          "1 cucharadita de aceite (5 ml)",
          "1 tomate",
        ],
        [
          "Si el arroz y la lenteja ya están hechos, salta este paso. Si no, hierve la lenteja 20–25 min y el arroz 18 min; haz tanda el domingo.",
          "Corta la pechuga en tiras. Sartén caliente, el aceite, 4–5 minutos hasta que deje de verse rosada.",
          "Mezcla con arroz y lenteja, tomate en rodajas. Unos 15 minutos si los granos ya están listos.",
        ],
      ),
      meal(
        "17:10",
        "Pre-entreno",
        340,
        8,
        ["2 rebanadas de pan integral", "150 g de plátano", "15 g de miel (1 cucharada)"],
        [
          "Tuesta o come el pan.",
          "Machaca el plátano con la miel encima del pan, o cómelo al lado.",
          "5 minutos. Es el carbohidrato de antes del gym de las 18:00.",
        ],
      ),
      meal(
        "19:25",
        "Post-entreno",
        340,
        28,
        ["80 g de atún al agua, escurrido (1 lata chica)", "2 rebanadas de pan", "1 plátano (100 g)"],
        [
          "Escurre el atún.",
          "Ábrelo sobre el pan con tomate si te sobró del almuerzo.",
          "Come el plátano. 8 minutos. Proteína y carbohidrato justo después de entrenar.",
        ],
      ),
      meal(
        "21:00",
        "Cena",
        450,
        17,
        ["1 huevo", "30 g de queso fresco", "180 g de arroz cocido", "1 tomate", "1 cucharadita de aceite"],
        [
          "Haz el huevo estrellado o revuelto en el aceite, 3 minutos.",
          "Calienta el arroz con un chorrito de agua, 2 minutos.",
          "Queso en láminas y tomate. Unos 12 minutos.",
        ],
      ),
    ],
  },
  2: {
    total: "2900 kcal · 132 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno",
        565,
        28,
        ["2 huevos", "2 rebanadas de pan", "50 g de aguacate (un tercio)", "1 plátano", "200 ml de leche"],
        [
          "Hierve o fríe los huevos, 4 minutos.",
          "Tuesta el pan, pon el aguacate majado y el huevo encima.",
          "Leche y plátano al lado. Unos 12 minutos.",
        ],
      ),
      meal(
        "10:30",
        "Snack",
        270,
        9,
        ["30 g de queso fresco", "1 rebanada de pan", "1 manzana y media", "10 g de miel"],
        ["Pan con queso. Manzana en gajos con la miel.", "5 minutos, sin fuego."],
      ),
      meal(
        "13:00",
        "Almuerzo",
        790,
        43,
        [
          "100 g de carne molida magra ya cocida, o 120 g cruda",
          "300 g de papa cocida",
          "150 g de arroz cocido",
          "80 g de fréjol cocido",
          "1 cucharadita de aceite",
        ],
        [
          "Si la papa no está hecha, córtala y hiérvela 15 minutos. El fréjol, de la tanda del domingo.",
          "Dora la carne en el aceite 6–8 minutos, sal y comino.",
          "Sirve carne, papa, arroz y fréjol. Unos 20 minutos.",
        ],
      ),
      meal(
        "17:10",
        "Pre-entreno",
        360,
        5,
        ["250 g de camote cocido", "120 g de plátano", "10 g de miel"],
        [
          "Pincha el camote y al microondas 6–8 minutos, o usa el que asaste el domingo.",
          "Aplástalo con el tenedor, miel y plátano.",
          "Unos 10 minutos. Mucho carbohidrato, poca grasa.",
        ],
      ),
      meal(
        "19:25",
        "Post-entreno",
        480,
        20,
        ["200 g de yogur", "40 g de avena", "120 g de plátano", "200 ml de leche"],
        [
          "Mezcla yogur, leche, avena y plátano en un tazón o en una botella.",
          "Si quieres la avena blanda, 60 s al microondas.",
          "8 minutos.",
        ],
      ),
      meal(
        "21:00",
        "Cena",
        440,
        27,
        ["80 g de atún al agua", "220 g de arroz cocido", "1 tomate", "1 cucharadita de aceite"],
        ["Calienta el arroz 2 minutos.", "Mezcla el atún, el tomate en cubos y el aceite.", "10 minutos."],
      ),
    ],
  },
  3: {
    total: "2940 kcal · 141 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno",
        630,
        25,
        ["70 g de avena", "300 ml de leche", "15 g de maní", "120 g de plátano", "10 g de miel"],
        [
          "Cocina avena y leche 4 minutos, moviendo.",
          "Agrega miel, plátano en rodajas y maní.",
          "Unos 10 minutos. Sin huevo, para variar.",
        ],
      ),
      meal(
        "10:30",
        "Snack",
        290,
        13,
        ["1 huevo duro", "2 rebanadas de pan", "1 manzana"],
        [
          "Si no hay huevo duro, hiérvelo 9 minutos y pásalo por agua fría.",
          "Pan y manzana. Unos 12 minutos la primera vez; 3 si ya está cocido.",
        ],
      ),
      meal(
        "13:00",
        "Almuerzo",
        600,
        46,
        ["120 g de pechuga cruda", "280 g de pasta cocida", "120 g de brócoli", "1 cucharadita de aceite", "1 tomate"],
        [
          "Hierve la pasta 10 minutos. En los últimos 3, echa el brócoli en la misma olla.",
          "Mientras, dora el pollo en tiras con el aceite, 5 minutos.",
          "Mezcla todo con tomate. Unos 18 minutos.",
        ],
      ),
      meal(
        "17:10",
        "Pre-entreno",
        340,
        8,
        ["2 rebanadas de pan", "150 g de plátano", "15 g de miel"],
        ["Pan, plátano y miel. 5 minutos. Carbohidrato antes de las 18:00."],
      ),
      meal(
        "19:25",
        "Post-entreno",
        530,
        23,
        ["300 ml de leche", "50 g de avena", "120 g de plátano", "150 g de yogur"],
        ["Calienta leche y avena 2 minutos.", "Mezcla con yogur y plátano.", "10 minutos."],
      ),
      meal(
        "21:00",
        "Cena",
        550,
        26,
        ["1 huevo", "150 g de lenteja cocida", "200 g de arroz cocido", "1 tomate", "media cucharadita de aceite"],
        [
          "Calienta lenteja y arroz juntos 3 minutos, con un poco de agua.",
          "Huevo revuelto en el aceite, 2 minutos, encima.",
          "Tomate fresco. Unos 12 minutos.",
        ],
      ),
    ],
  },
  4: {
    total: "2900 kcal · 136 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno",
        530,
        29,
        ["2 huevos", "2 rebanadas de pan", "20 g de queso fresco", "120 g de plátano", "150 ml de leche"],
        ["Revuelve los huevos 3 minutos.", "Pan con queso, leche y plátano.", "Unos 12 minutos."],
      ),
      meal(
        "8:05",
        "Snack",
        330,
        12,
        ["200 g de yogur", "30 g de avena", "1 plátano (100 g)"],
        [
          "Entre la tutoría virtual de Ética (7:00) y la de Sistemas Operativos (9:00).",
          "Yogur con avena y plátano picado. 4 minutos.",
        ],
      ),
      meal(
        "13:10",
        "Almuerzo",
        760,
        41,
        [
          "110 g de pechuga cruda",
          "220 g de verde cocido (1 verde chico)",
          "100 g de fréjol cocido",
          "150 g de arroz cocido",
          "1 cucharadita de aceite",
        ],
        [
          "Si el verde está crudo, córtalo en trozos y hiérvelo 12–15 minutos.",
          "Dora el pollo en el aceite 5 minutos.",
          "Arma el plato con fréjol y arroz de la tanda. Unos 20 minutos.",
        ],
      ),
      meal(
        "19:00",
        "Pre-entreno",
        410,
        11,
        ["200 g de choclo (1 choclo mediano, ya cocido)", "1 rebanada de pan", "120 g de plátano", "10 g de miel"],
        [
          "No lo comas a las 17:10: de 17:00 a 17:59 es la tutoría virtual de Estadística y de 18:00 a 18:59 la de Lógica.",
          "Deja el choclo hecho en el almuerzo. A las 19:00, cuando cierra Lógica, cómelo con pan, plátano y miel.",
          "5 minutos. Entras al gym a las 19:15.",
        ],
      ),
      meal(
        "20:40",
        "Post-entreno",
        420,
        29,
        ["80 g de atún al agua", "2 rebanadas de pan", "2 naranjas", "80 g de plátano"],
        ["Al salir del gym (termina ~20:30). Atún sobre el pan y la fruta.", "8 minutos."],
      ),
      meal(
        "21:30",
        "Cena",
        460,
        14,
        ["1 huevo", "220 g de arroz cocido", "1 tomate", "50 g de aguacate"],
        [
          "Huevo al sartén 3 minutos.",
          "Arroz caliente, tomate y aguacate.",
          "12 minutos. Cena más liviana en proteína porque el atún ya cubrió el post.",
        ],
      ),
    ],
  },
  5: {
    total: "2920 kcal · 139 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno",
        590,
        30,
        ["2 huevos", "60 g de avena", "250 ml de leche", "120 g de plátano"],
        [
          "Avena con leche 3–4 minutos.",
          "Huevos revueltos al lado, 3 minutos.",
          "Plátano. Unos 12 minutos.",
        ],
      ),
      meal(
        "10:30",
        "Snack",
        340,
        15,
        ["200 ml de leche", "20 g de maní", "1 rebanada de pan", "1 manzana"],
        ["Vaso de leche, pan, maní y manzana. 5 minutos."],
      ),
      meal(
        "13:00",
        "Almuerzo",
        700,
        43,
        [
          "110 g de pechuga cruda",
          "300 g de arroz cocido",
          "100 g de fréjol cocido",
          "1 cucharadita de aceite",
          "1 tomate",
        ],
        [
          "Dora el pollo 5 minutos.",
          "Calienta arroz y fréjol.",
          "Tomate. 15 minutos con granos ya hechos.",
        ],
      ),
      meal(
        "17:10",
        "Pre-entreno",
        350,
        8,
        ["2 rebanadas de pan", "180 g de plátano", "10 g de miel"],
        ["Pan con miel y los plátanos. 5 minutos, antes de las 18:00."],
      ),
      meal(
        "19:25",
        "Post-entreno",
        405,
        14,
        ["200 g de yogur", "2 rebanadas de pan", "10 g de miel", "1 plátano"],
        [
          "Yogur con miel y plátano, pan al lado. 5 minutos. Si quieres más proteína este día, suma 1 huevo duro.",
        ],
      ),
      meal(
        "21:00",
        "Cena",
        530,
        29,
        ["80 g de atún", "250 g de papa cocida", "120 g de arroz cocido", "1 tomate", "1 cucharadita de aceite"],
        [
          "Hierve la papa en cubos 15 minutos si no está hecha.",
          "Mezcla atún, papa, arroz, tomate y aceite.",
          "Unos 18 minutos.",
        ],
      ),
    ],
  },
  6: {
    total: "2900 kcal · 133 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno · pre del abdomen",
        590,
        25,
        ["2 huevos", "180 g de verde cocido", "30 g de queso fresco", "1 rebanada de pan", "1 naranja"],
        [
          "Hierve el verde en trozos 12 minutos si está crudo.",
          "Huevos revueltos 3 minutos, queso al final para que se ablande.",
          "Pan y naranja. Come esto antes del abdomen de las 10:00. Unos 18 minutos.",
        ],
      ),
      meal(
        "11:15",
        "Post-entreno",
        320,
        15,
        ["200 g de yogur", "120 g de plátano", "15 g de maní", "1 rebanada de pan"],
        ["Justo después del abdomen: yogur, plátano, maní y pan.", "5 minutos."],
      ),
      meal(
        "13:30",
        "Almuerzo",
        700,
        36,
        ["2 huevos", "220 g de arroz cocido", "150 g de lenteja cocida", "50 g de aguacate", "1 tomate"],
        [
          "Calienta arroz y lenteja 3 minutos.",
          "Dos huevos fritos o estrellados, 4 minutos.",
          "Aguacate y tomate. Unos 15 minutos. Plato de casa, sin pollo.",
        ],
      ),
      meal(
        "17:00",
        "Merienda",
        350,
        12,
        ["2 rebanadas de pan", "30 g de queso fresco", "1 manzana y media", "10 g de miel"],
        ["Pan con queso, manzana y miel. 5 minutos. No hay gym de tarde."],
      ),
      meal(
        "19:30",
        "Colación",
        420,
        19,
        ["300 ml de leche", "40 g de avena", "15 g de miel", "1 plátano"],
        ["Avena con leche 3 minutos, miel y plátano. 8 minutos."],
      ),
      meal(
        "21:00",
        "Cena",
        520,
        31,
        ["100 g de pechuga cruda", "250 g de papa cocida", "100 g de arroz cocido", "1 tomate", "1 cucharadita de aceite"],
        [
          "Dora el pollo 5 minutos. Papa al microondas o hervida 12 minutos.",
          "Arroz de la tanda y tomate.",
          "Unos 20 minutos.",
        ],
      ),
    ],
  },
  0: {
    total: "2990 kcal · 138 g proteína",
    items: [
      meal(
        "5:30",
        "Desayuno · pre del abdomen",
        565,
        28,
        ["2 huevos", "2 rebanadas de pan", "50 g de aguacate", "1 plátano", "200 ml de leche"],
        ["Huevos 4 minutos, pan con aguacate.", "Leche y plátano.", "12 minutos, antes de las 10:00."],
      ),
      meal(
        "11:15",
        "Post-entreno",
        320,
        15,
        ["200 g de yogur", "20 g de maní", "1 rebanada de pan"],
        ["Después del abdomen. 4 minutos."],
      ),
      meal(
        "13:30",
        "Almuerzo",
        750,
        44,
        [
          "100 g de carne molida cocida",
          "280 g de arroz cocido",
          "100 g de fréjol cocido",
          "1 cucharadita de aceite",
          "1 tomate grande",
        ],
        [
          "Calienta la carne con el aceite 4 minutos. Si partes de carne cruda, usa 120 g y cocínala 8 minutos.",
          "Arroz, fréjol y tomate.",
          "15 minutos. Almuerzo más grande, estilo domingo.",
        ],
      ),
      meal(
        "17:00",
        "Merienda",
        390,
        8,
        ["150 g de plátano", "2 rebanadas de pan", "15 g de miel", "1 manzana"],
        ["Pan con miel, fruta. 5 minutos."],
      ),
      meal(
        "19:30",
        "Colación",
        390,
        16,
        ["250 ml de leche", "50 g de avena", "1 plátano"],
        ["Avena con leche 3 minutos y plátano. 8 minutos."],
      ),
      meal(
        "21:00",
        "Cena",
        560,
        27,
        [
          "1 huevo",
          "120 g de lenteja cocida",
          "200 g de arroz cocido",
          "20 g de queso fresco",
          "1 tomate",
          "media cucharadita de aceite",
        ],
        [
          "Calienta lenteja y arroz.",
          "Huevo revuelto, queso y tomate.",
          "12 minutos. Si te pasa de hambre el lunes, deja arroz extra ya hecho.",
        ],
      ),
    ],
  },
};

export const WEEKDAY_MEAL_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

for (const day of Object.values(MEALS)) {
  for (const item of day.items) {
    if (item.role.startsWith("Desayuno")) {
      item.time = "5:30";
      item.end = "6:00";
    }
  }
}
