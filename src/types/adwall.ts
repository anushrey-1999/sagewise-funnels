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
  logoText?: string; // Optional text to display below the logo
  creditCardImage: string;
  badgeText: string;
  badgeIcon: string;
  advertiserName: string;
  isDifferentBorder?: boolean;
  phoneNumber?: string; // Optional phone number to display below CTA
  /**
   * Raw third-party impression snippet to inject when this card is viewed.
   * Must be a string containing one or more <script> tags (kept as-provided).
   */
  impressionScript?: string;
}

export interface AdwallConfig {
  id: string;
  funnelId: string;
  adwallType: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  navbar?: {
    tagline?: string; // e.g., "Speak to a licensed agent:"
    phone?: string; // display value, e.g., "1-833-906-2737"
  };
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
