export type Navigation = {
  href: string;
  label: string;
};

const navigation: Navigation[] = [
  {
    href: "/inspeksjoner",
    label: "Inspeksjoner",
  },
  {
    href: "/kart",
    label: "Kart",
  },
  {
    href: "/debug",
    label: "Debug",
  },
];

export default navigation;