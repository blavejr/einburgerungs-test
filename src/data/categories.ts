import type { CategoryId } from "@/types";

export interface Category {
  de: string;
  en: string;
  group: string;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  rights: { de: "Grundrechte & Verfassung", en: "Basic rights & constitution", group: "Demokratie" },
  state: { de: "Staat, Regierung & Parteien", en: "State, government & parties", group: "Demokratie" },
  elections: { de: "Wahlen", en: "Elections", group: "Demokratie" },
  law: { de: "Recht, Gerichte & Behörden", en: "Law, courts & authorities", group: "Demokratie" },
  social: { de: "Sozialstaat, Arbeit & Wirtschaft", en: "Welfare, work & economy", group: "Demokratie" },
  jewish: { de: "Jüdisches Leben, Israel & Antisemitismus", en: "Jewish life, Israel & antisemitism", group: "Verantwortung" },
  ns: { de: "Nationalsozialismus & Weltkrieg", en: "Nazi era & WWII", group: "Geschichte" },
  ddr: { de: "Teilung, DDR & Wiedervereinigung", en: "Division, GDR & reunification", group: "Geschichte" },
  eu: { de: "Deutschland & Europa", en: "Germany & Europe", group: "Geschichte" },
  family: { de: "Familie, Schule & Alltag", en: "Family, school & daily life", group: "Gesellschaft" },
  culture: { de: "Religion, Kultur & Migration", en: "Religion, culture & migration", group: "Gesellschaft" },
  bayern: { de: "Bayern (Landesfragen)", en: "Bavaria (state questions)", group: "Bundesland" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as CategoryId[];
