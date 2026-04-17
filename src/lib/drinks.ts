export interface DrinkCategory {
  label: string;
  emoji: string;
  items: string[];
}

export const DRINK_CATEGORIES: DrinkCategory[] = [
  {
    label: "Водка",
    emoji: "🫗",
    items: [
      "Absolut", "Grey Goose", "Belvedere", "Smirnoff", "Finlandia",
      "Parliament", "Crystal", "Nemiroff", "Хортица",
    ],
  },
  {
    label: "Виски",
    emoji: "🥃",
    items: [
      "Jack Daniel's", "Jameson", "Johnnie Walker Red", "Johnnie Walker Black",
      "Chivas Regal 12", "Glenfiddich 12", "Macallan 12", "Monkey Shoulder",
      "Jim Beam", "Bulleit Bourbon", "Maker's Mark", "Wild Turkey", "Laphroaig",
    ],
  },
  {
    label: "Ром",
    emoji: "🍹",
    items: [
      "Bacardi White", "Bacardi Gold", "Captain Morgan", "Havana Club 3",
      "Havana Club 7", "Diplomatico Reserva", "Malibu", "Myers's Dark",
    ],
  },
  {
    label: "Текила",
    emoji: "🌵",
    items: [
      "Jose Cuervo Gold", "Jose Cuervo Silver", "Patrón Silver",
      "Don Julio Blanco", "Olmeca Gold", "Sierra Silver", "1800 Silver", "Espolòn",
    ],
  },
  {
    label: "Джин",
    emoji: "🍸",
    items: [
      "Tanqueray", "Bombay Sapphire", "Hendrick's", "Gordon's",
      "Beefeater", "Monkey 47", "Roku", "The Botanist",
    ],
  },
  {
    label: "Коньяк / Бренди",
    emoji: "🍂",
    items: [
      "Hennessy VS", "Hennessy VSOP", "Rémy Martin VSOP", "Martell VS",
      "Courvoisier VS", "Ararat 3★", "Ararat 5★", "Kizlyar",
    ],
  },
  {
    label: "Игристое",
    emoji: "🍾",
    items: [
      "Prosecco", "Шампанское", "Cava", "Freixenet",
      "Moët & Chandon", "Veuve Clicquot", "Asti Martini",
    ],
  },
  {
    label: "Вино",
    emoji: "🍷",
    items: [
      "Красное сухое", "Красное полусладкое",
      "Белое сухое", "Белое полусладкое", "Розовое",
    ],
  },
  {
    label: "Пиво",
    emoji: "🍺",
    items: [
      "Corona", "Heineken", "Carlsberg", "Stella Artois",
      "Guinness", "Hoegaarden", "Балтика 7", "Жигулёвское", "Kozel",
    ],
  },
  {
    label: "Ликёры",
    emoji: "🍊",
    items: [
      "Aperol", "Campari", "Jägermeister", "Baileys",
      "Kahlúa", "Cointreau", "Amaretto Disaronno", "Sambuca", "Frangelico",
    ],
  },
  {
    label: "Вермут / Аперитив",
    emoji: "🫒",
    items: [
      "Martini Bianco", "Martini Rosso", "Martini Extra Dry",
      "Cinzano Bianco", "Noilly Prat",
    ],
  },
  {
    label: "Другое",
    emoji: "✨",
    items: ["Абсент", "Саке", "Сидр", "Лимончелло", "Кальвадос", "Граппа"],
  },
];

export const ALL_DRINKS = DRINK_CATEGORIES.flatMap((c) => c.items);
