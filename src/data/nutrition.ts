export const PROFILE = {
  name: "Jhona",
  weightKg: 68,
  heightM: "1,72",
  heightCm: 172,
  bmi: 23,
  kcal: 2800,
  protein: 135,
  proteinPerKg: "2,0",
};

export const KCAL_INTRO =
  "Estimación transparente, no un estudio de laboratorio. No hay un porcentaje de grasa medido.";

export const KCAL_POINTS: { lead: string; text: string }[] = [
  {
    lead: "IMC.",
    text: "68 ÷ (1,72 × 1,72) = 68 ÷ 2,96 ≈ 23. Peso normal, margen para subir músculo despacio.",
  },
  {
    lead: "Gasto en reposo.",
    text: "Mifflin-St Jeor, asumiendo adulto joven varón de unos 22 años (Jhona; la edad no vino en los datos). BMR = 10×68 + 6,25×172 − 5×22 + 5 = 1650 kcal. Si no eres varón, resta unas 160 kcal a todo lo de abajo.",
  },
  {
    lead: "Actividad ×1,50.",
    text: "Entre ligero (1,375) y moderado (1,55): clases sentado, caminar al día, pesas 5 días y abdomen el fin de semana. Mantenimiento ≈ 1650 × 1,50 = 2475 kcal, redondeado a 2500.",
  },
  {
    lead: "Superávit +300 kcal.",
    text: "Dentro de +250 a +400 para un volumen limpio. Meta: 2800 kcal todos los días, también el finde: el músculo se construye en el descanso.",
  },
  {
    lead: "Proteína 135 g/día.",
    text: "2,0 g/kg; el rango útil es 1,6–2,2 g/kg, o sea 110–150 g. Los platos caen cerca de 130–140 g. Grasa ~65–80 g. El resto son carbohidratos, más altos en el pre y el post de los días de gym.",
  },
  {
    lead: "Ajuste.",
    text: "Si en dos semanas subes más de ~0,5 kg, baja unas 150 kcal (menos arroz o pan). Si no subes nada en tres semanas, suma 150 kcal.",
  },
];

export const DISCLAIMER =
  "No es consejo médico ni una dieta clínica. Si tienes una lesión, ajusta el ejercicio con quien te atiende. Las calorías son de tabla (huevo, arroz cocido, pollo crudo, etc.), redondeadas.";

export const SHOPPING_NOTE =
  "Para una persona. El arroz, la lenteja y el pollo conviene hacerlos el domingo en tanda. Para el post-entreno de lunes, jueves y viernes: tupper con tapa hermética, lonchera térmica con 1–2 ice packs o un termo de comida.";

export const SHOPPING: { item: string; amount: string }[] = [
  { item: "Huevos", amount: "18 unidades" },
  { item: "Pechuga de pollo", amount: "700 g cruda" },
  { item: "Carne molida magra", amount: "400 g" },
  { item: "Atún al agua", amount: "4 latas chicas (80 g escurridos c/u)" },
  { item: "Leche semidescremada", amount: "3 litros" },
  { item: "Yogur natural", amount: "1,2 kg" },
  { item: "Queso fresco", amount: "250 g" },
  { item: "Avena", amount: "500 g" },
  { item: "Arroz", amount: "1,2 kg en seco" },
  { item: "Lenteja y fréjol secos", amount: "400 g entre los dos" },
  { item: "Pan integral", amount: "2 fundas" },
  { item: "Tortillas de trigo medianas", amount: "1 paquete (2 por semana para el wrap del lunes)" },
  { item: "Lechuga, pimiento y cebolla", amount: "1 lechuga, 1 pimiento, 2 cebollas" },
  { item: "Plátano, manzana, naranja", amount: "10 / 5 / 4" },
  { item: "Verde, papa, camote, choclo", amount: "2 verdes, 1 kg papa, 2 camotes, 2 choclos" },
  { item: "Aguacate, tomate, brócoli", amount: "3 aguacates, 1 kg tomate, 1 brócoli" },
  { item: "Maní y miel", amount: "150 g maní, 1 frasco chico de miel" },
];
