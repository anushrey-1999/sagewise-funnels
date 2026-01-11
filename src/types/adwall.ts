export interface AdwallCard {
  heading: string;
  description: string;
  features: string[];
  buttonLink: string;
  buttonText: string;
  ratingsNumber: string;
  ratingsCount: number;
  logo: string;
  logoWidth: string;
  logoHeight: string;
  creditCardImage: string;
  badgeText: string;
  badgeIcon: string;
  advertiserName: string;
  isDifferentBorder?: boolean;
  phoneNumber?: string; // Optional phone number to display below CTA
}

export interface AdwallConfig {
  id: string;
  funnelId: string;
  adwallType: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  cards: AdwallCard[];
  disclaimers?: string;
  metadata?: {
    title?: string;
    description?: string;
  };
  trackingParams?: {
    affiliateIdParam?: string; // e.g., "s1", "s2"
    transactionIdParam?: string; // e.g., "sub5", "s2"
  };
}
