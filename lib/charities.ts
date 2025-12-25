export interface Charity {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  category: string;
  description: string;
  impact: string;
  website: string;
  stripeAccountId?: string; // For Stripe Connect (to be added when available)
}

export const CHARITIES: Charity[] = [
  {
    id: "doctors-without-borders",
    name: "Doctors Without Borders",
    displayName: "Doctors Without Borders (MSF)",
    icon: "🏥",
    category: "Health",
    description: "Providing emergency medical care to people affected by conflict, epidemics, disasters, and exclusion from healthcare worldwide.",
    impact: "Your donation helps provide medical care to people in crisis",
    website: "https://www.doctorswithoutborders.org",
    // stripeAccountId: "" // To be added when Stripe Connect is set up
  },
  {
    id: "unicef",
    name: "UNICEF",
    displayName: "UNICEF",
    icon: "👶",
    category: "Children & Poverty",
    description: "Working in over 190 countries to save children's lives, defend their rights, and help them fulfill their potential from early childhood through adolescence.",
    impact: "Your donation helps provide food, education, and protection to children in need",
    website: "https://www.unicef.org",
    // stripeAccountId: "" // To be added when Stripe Connect is set up
  },
  {
    id: "best-friends-animal-society",
    name: "Best Friends Animal Society",
    displayName: "Best Friends Animal Society",
    icon: "🐾",
    category: "Animal Welfare",
    description: "Leading animal welfare organization working to end the killing of dogs and cats in America's shelters through adoption programs, spay/neuter, and education.",
    impact: "Your donation helps rescue and care for homeless pets",
    website: "https://bestfriends.org",
    // stripeAccountId: "" // To be added when Stripe Connect is set up
  },
];

export function getCharityById(id: string): Charity | undefined {
  return CHARITIES.find(charity => charity.id === id);
}

export function getCharityDisplayName(id: string): string {
  const charity = getCharityById(id);
  return charity?.displayName || id;
}
