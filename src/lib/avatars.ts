export interface DefaultAvatar {
  id: string;
  url: string;
  label: string;
}

const dv = (style: string, seed: string) =>
  `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=200`;

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  // Avataaars — мультяшные
  { id: "aa-1",  url: dv("avataaars", "Lily"),    label: "Lily"    },
  { id: "aa-2",  url: dv("avataaars", "James"),   label: "James"   },
  { id: "aa-3",  url: dv("avataaars", "Sophia"),  label: "Sophia"  },
  { id: "aa-4",  url: dv("avataaars", "Omar"),    label: "Omar"    },
  { id: "aa-5",  url: dv("avataaars", "Mia"),     label: "Mia"     },
  { id: "aa-6",  url: dv("avataaars", "Liam"),    label: "Liam"    },

  // Lorelei — минималистичные портреты
  { id: "lo-1",  url: dv("lorelei", "Anna"),      label: "Anna"    },
  { id: "lo-2",  url: dv("lorelei", "Maria"),     label: "Maria"   },
  { id: "lo-3",  url: dv("lorelei", "Sara"),      label: "Sara"    },
  { id: "lo-4",  url: dv("lorelei", "Nova"),      label: "Nova"    },

  // Pixel-art — пиксельные
  { id: "px-1",  url: dv("pixel-art", "Hero"),    label: "Hero"    },
  { id: "px-2",  url: dv("pixel-art", "Star"),    label: "Star"    },
  { id: "px-3",  url: dv("pixel-art", "Moon"),    label: "Moon"    },
  { id: "px-4",  url: dv("pixel-art", "Wave"),    label: "Wave"    },

  // Bottts — роботы
  { id: "bt-1",  url: dv("bottts", "Alpha"),      label: "Alpha"   },
  { id: "bt-2",  url: dv("bottts", "Beta"),       label: "Beta"    },
  { id: "bt-3",  url: dv("bottts", "Gamma"),      label: "Gamma"   },
  { id: "bt-4",  url: dv("bottts", "Delta"),      label: "Delta"   },

  // Micah — иллюстрированные
  { id: "mc-1",  url: dv("micah", "Rose"),        label: "Rose"    },
  { id: "mc-2",  url: dv("micah", "Leo"),         label: "Leo"     },
];
