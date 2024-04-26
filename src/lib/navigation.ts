export type Navigation = {
  href: string;
  label: string;
};

const navigation: Navigation[] = [
  {
    href: "/create",
    label: "Sett opp en Ad-hoc inspeksjon",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  // {
  //   href: "/generateContent",
  //   label: "Lag Data",
  // },
];

export default navigation;
