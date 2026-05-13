export interface RankingDimensionBucket {
  id: string;
  label: string;
  /** Optional: Map form field values to this bucket. If not specified, matches by bucket id */
  matchValues?: string[];
  /** For calculated/numeric dimensions: minimum value (inclusive) */
  min?: number;
  /** For calculated/numeric dimensions: maximum value (exclusive). Use null or undefined for "plus" ranges */
  max?: number;
}

export interface RankingDimension {
  id: string;
  label: string;
  /** The form field ID to read the value from. Defaults to dimension id if not specified. */
  fieldId?: string;
  /** How to derive the value: 'direct' (use field value), 'calculated' (run custom logic). Defaults to 'direct'. */
  valueType?: "direct" | "calculated";
  /** For calculated values: specify the calculation type */
  calculation?: {
    type: "mortgage-amount" | "custom";
    /** Fields needed for calculation */
    requiredFields?: string[];
  };
  buckets: RankingDimensionBucket[];
}

export interface RankingConfig {
  dimensions: RankingDimension[];
  lenders: Record<string, Record<string, number>>;
  rankingNumbers?: Record<string, string>;
}

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
  logoSubtext?: string; // Optional text to display below logoText (e.g. "Terms and conditions apply")
  creditCardImage: string;
  badgeText?: string;
  badgeIcon?: string;
  advertiserName: string;
  isHidden?: boolean;
  isDifferentBorder?: boolean;
  phoneNumber?: string; // Optional phone number to display below CTA
  /** Optional Trustpilot review count string, e.g. "18,267". Displayed above/below CTA. */
  trustpilotReviews?: string;
  /** Optional card stats shown between features and CTA */
  minCreditScore?: string;
  maxLoanAmount?: string;
  aprRange?: string;
  /**
   * Optional bottom callout box content rendered as HTML.
   * Controlled via the adwall JSON on a per-card basis.
   */
  bottomBoxHtml?: string;
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
  staticTitle?: string;
  staticSubtitle?: string;
  dynamicTitle?: string;
  dynamicSubtitle?: string;
  updatedAt: string;
  navbar?: {
    tagline?: string; // e.g., "Speak to a licensed agent:"
    phone?: string; // display value, e.g., "1-833-906-2737"
  };
  rankingConfig?: RankingConfig;
  cards: AdwallCard[];
  disclaimers?: string;
  metadata?: {
    title?: string;
    description?: string;
  };
  trackingParams?: {
    affiliateIdParam?: string; // e.g., "s1", "s2"
    transactionIdParam?: string; // e.g., "sub5", "s2"
    /** Fixed sub3 value appended to every card's CTA link for this adwall */
    sub3?: string;
  };
}
