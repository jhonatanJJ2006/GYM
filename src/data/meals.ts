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
    total: "2815 kcal · 140 g proteína",
    items: [
      meal(
        "6:15",
        "Pre-entreno ligero",
        300,
        11,
        ["1 rebanada de pan integral", "10 g de miel (2 cucharaditas)", "1 plátano (120 g)", "200 ml de leche semidescremada"],
        [
          "En casa, 30–45 minutos antes del gym de las 7:00. Liviano para no entrenar pesado.",
          "Pan con la miel y el plátano en rodajas encima; el vaso de leche al lado.",
          "5 minutos, sin fuego. Saca de la refri el tupper del post-entreno y mételo a la lonchera con el ice pack.",
        ],
        "6:30",
      ),
      meal(
        "9:00",
        "Post-entreno · para llevar",
        850,
        46,
        [
          "2 tortillas de trigo medianas (unos 45 g c/u)",
          "120 g de pechuga de pollo cruda",
          "150 g de arroz cocido (de la tanda del domingo)",
          "30 g de queso fresco",
          "1 tomate pequeño y 2 hojas de lechuga",
          "1 cucharadita de aceite (5 ml)",
          "1 plátano (100 g), aparte",
        ],
        [
          "Wrap de pollo con arroz, para llevar. Se arma la noche anterior (domingo) en casa.",
          "Corta la pechuga en tiras, sal, comino y ajo. Sartén caliente con el aceite, 5–6 minutos hasta que por dentro no quede rosada. Deja enfriar 10 minutos.",
          "Calienta cada tortilla 20 s por lado en el sartén seco para que no se rompa al enrollar.",
          "Reparte el arroz, el pollo, el queso en tiras, el tomate en rodajas finas (sin jugo) y la lechuga. Dobla los bordes y enrolla apretado.",
          "Envuelve cada wrap en papel aluminio o film, al tupper con tapa y a la refri toda la noche.",
          "En la mañana: tupper a la lonchera con un ice pack; el plátano aparte. Se come frío o a temperatura ambiente. Sin ice pack no lo dejes más de 2 h fuera de la refri.",
          "Cómelo apenas sales del gym, 9:00–9:20, antes de la clase de las 10:00.",
        ],
        "9:20",
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
        "Merienda",
        340,
        14,
        ["200 g de yogur natural", "15 g de maní (un puñado chico)", "1 rebanada de pan integral", "1 manzana"],
        [
          "Al salir de Estadística (16:59).",
          "Pon el yogur en un tazón, el maní encima y el pan al lado. Parte la manzana.",
          "No se cocina. 5 minutos.",
        ],
      ),
      meal(
        "19:30",
        "Colación",
        155,
        8,
        ["200 ml de leche semidescremada", "1 naranja"],
        ["Vaso de leche y la naranja en gajos. 3 minutos. Ya no hay gym de tarde: es solo un puente a la cena."],
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
          "Queso en láminas y tomate. Unos 12 minutos. Deja armado el tupper de mañana si toca gym temprano.",
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
    total: "2775 kcal · 140 g proteína",
    items: [
      meal(
        "6:15",
        "Pre-entreno ligero",
        330,
        12,
        ["1 rebanada de pan integral", "20 g de queso fresco", "1 plátano (120 g)", "10 g de miel", "150 ml de leche semidescremada"],
        [
          "En casa, antes del gym de las 7:00.",
          "Pan con queso, el plátano con la miel y el vaso de leche.",
          "5 minutos. Saca de la refri el tupper del post-entreno y ponlo en la lonchera (ice pack) o pásalo al termo caliente.",
        ],
        "6:30",
      ),
      meal(
        "9:00",
        "Post-entreno · para llevar",
        720,
        44,
        [
          "120 g de pechuga de pollo cruda",
          "250 g de arroz cocido",
          "100 g de fréjol cocido",
          "1/2 pimiento y 1/4 de cebolla picados",
          "1 cucharadita de aceite (5 ml)",
          "1 naranja, aparte",
        ],
        [
          "Arroz con pollo y fréjol en tupper, para llevar. Se prepara la noche anterior (miércoles) en casa.",
          "Corta la pechuga en cubos chicos, sal, comino y ajo. Sofríe cebolla y pimiento en el aceite 3 minutos, suma el pollo y cocina 6 minutos, hasta que no quede rosado.",
          "Agrega el arroz y el fréjol de la tanda, mezcla 2 minutos a fuego medio. Deja enfriar destapado 15 minutos.",
          "Al tupper con tapa hermética y a la refri toda la noche.",
          "En la mañana: lonchera con ice pack y se come frío, o calienta en la mañana y pásalo a un termo de comida precalentado con agua hirviendo. La naranja va aparte.",
          "Cómelo 9:00–9:20, al salir del gym. A las 9:00 empieza la tutoría virtual de Sistemas Operativos: cómelo mientras la escuchas, con la cámara apagada.",
        ],
        "9:20",
      ),
      meal(
        "13:10",
        "Almuerzo",
        700,
        34,
        [
          "120 g de carne molida magra cruda",
          "220 g de verde cocido (1 verde chico)",
          "1 huevo",
          "1 tomate y 1/4 de cebolla",
          "50 g de aguacate",
          "1 cucharadita de aceite",
        ],
        [
          "Si el verde está crudo, córtalo en trozos y hiérvelo 12–15 minutos.",
          "Dora la carne con la cebolla en el aceite 6–8 minutos, sal y comino. Al final, el huevo revuelto en el mismo sartén, 2 minutos.",
          "Sirve con el verde, tomate y aguacate. Unos 20 minutos.",
        ],
      ),
      meal(
        "16:30",
        "Merienda",
        330,
        12,
        ["200 g de yogur", "30 g de avena", "1 plátano (100 g)"],
        [
          "Antes de las tutorías virtuales de 17:00 (Estadística) y 18:00 (Lógica).",
          "Yogur con avena y plátano picado. 4 minutos.",
        ],
      ),
      meal(
        "19:15",
        "Cena",
        515,
        27,
        ["80 g de atún al agua", "220 g de arroz cocido", "1 tomate", "50 g de aguacate", "1 cucharadita de aceite"],
        [
          "Al cerrar la tutoría de Lógica (18:59). Ya no hay gym de noche: el jueves entrenas a las 7:00.",
          "Calienta el arroz 2 minutos. Mezcla el atún, el tomate en cubos, el aguacate y el aceite.",
          "10 minutos.",
        ],
      ),
      meal(
        "21:15",
        "Colación",
        180,
        11,
        ["200 ml de leche semidescremada", "15 g de maní"],
        ["Vaso de leche y el maní. 2 minutos. Deja listo el tupper del viernes antes de dormir."],
      ),
    ],
  },
  5: {
    total: "2785 kcal · 140 g proteína",
    items: [
      meal(
        "6:15",
        "Pre-entreno ligero",
        310,
        10,
        ["150 g de yogur natural", "30 g de avena", "1 plátano (120 g)"],
        [
          "En casa, antes del gym de las 7:00.",
          "Yogur con la avena cruda y el plátano en rodajas. 3 minutos, sin fuego.",
          "Saca de la refri el tupper del post-entreno y la leche; a la lonchera con el ice pack.",
        ],
        "6:30",
      ),
      meal(
        "9:00",
        "Post-entreno · para llevar",
        770,
        55,
        [
          "4 rebanadas de pan integral",
          "80 g de atún al agua, escurrido (1 lata chica)",
          "2 huevos duros",
          "20 g de yogur natural (para unir)",
          "1 tomate pequeño y 2 hojas de lechuga",
          "1 plátano (120 g), aparte",
          "250 ml de leche semidescremada en botella o termo frío",
        ],
        [
          "Dos sanduches de atún con huevo, plátano y leche, para llevar. Se preparan la noche anterior (jueves) en casa.",
          "Hierve los 2 huevos 10 minutos, pásalos por agua fría y pélalos.",
          "Escurre bien el atún. Pica los huevos y mézclalos con el atún, el yogur, sal y pimienta.",
          "Arma 2 sanduches con el relleno, la lechuga y el tomate en rodajas finas secado con papel (para que el pan no se moje).",
          "Envuélvelos en film o aluminio, al tupper y a la refri. La leche en una botella cerrada, también en la refri.",
          "En la mañana: tupper y leche a la lonchera con ice pack (atún y huevo no deben pasar más de 2 h sin frío). El plátano aparte.",
          "Cómelo 9:00–9:20, al salir del gym, antes de Inteligencia de Negocios (10:00).",
        ],
        "9:20",
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
        "16:30",
        "Merienda",
        245,
        8,
        ["1 rebanada de pan integral", "30 g de queso fresco", "1 manzana"],
        ["Pan con queso y la manzana. 4 minutos, sin fuego."],
      ),
      meal(
        "19:00",
        "Colación",
        160,
        4,
        ["1 naranja", "1 rebanada de pan", "10 g de miel"],
        ["Pan con miel y la naranja. 3 minutos. El viernes ya no hay gym de tarde."],
      ),
      meal(
        "21:00",
        "Cena",
        600,
        20,
        ["220 g de arroz cocido", "150 g de lenteja cocida", "1 tomate", "50 g de aguacate", "1 cucharadita de aceite"],
        [
          "Calienta arroz y lenteja juntos 3 minutos con un chorrito de agua.",
          "Tomate en cubos, aguacate y el aceite encima.",
          "Unos 10 minutos.",
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
