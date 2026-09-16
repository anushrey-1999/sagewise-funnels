import { FormData } from "@/types/form";

export interface InterstitialCopy {
  header: string;
  statusLines: string[];
}

type MortgageInterstitialVariant = "HELOC" | "REFI" | "PURCHASE" | "SUB580";

/**
 * Copy follows the Sept 2026 Interstitial → AdWall Production Spec.
 * Below 580 is a credit-profile override that softens the curation language without
 * naming the credit band, and without changing the destination adwall.
 */
const VARIANT_COPY: Record<MortgageInterstitialVariant, InterstitialCopy> = {
  HELOC: {
    header: "Curating your HELOC matches…",
    statusLines: [
      "Verifying your profile",
      "Analyzing available HELOC options…",
      "Curating available matches…",
    ],
  },
  REFI: {
    header: "Curating your refinance matches…",
    statusLines: [
      "Verifying your profile",
      "Analyzing available refinance options…",
      "Curating available matches…",
    ],
  },
  PURCHASE: {
    header: "Curating your purchase matches…",
    statusLines: [
      "Verifying your profile",
      "Analyzing available purchase options…",
      "Curating available matches…",
    ],
  },
  SUB580: {
    header: "Curating available options for you…",
    statusLines: [
      "Verifying your profile",
      "Checking options that may fit…",
      "Curating available options…",
    ],
  },
};

const LOAN_TYPE_VARIANTS: Record<string, MortgageInterstitialVariant> = {
  "home-equity-heloc": "HELOC",
  refinance: "REFI",
  purchase: "PURCHASE",
};

const SUB_580_CREDIT_VALUE = "bad";

function readAnswer(data: FormData, stepId: string, fieldId: string): string | null {
  const value = data[stepId]?.[fieldId];
  return typeof value === "string" && value ? value : null;
}

function deriveVariant(data: FormData): MortgageInterstitialVariant {
  if (readAnswer(data, "credit-score", "creditScore") === SUB_580_CREDIT_VALUE) {
    return "SUB580";
  }

  const loanType = readAnswer(data, "loan-type", "loanType");
  return (loanType && LOAN_TYPE_VARIANTS[loanType]) || "HELOC";
}

export function resolveMortgageInterstitialCopy(data: FormData): InterstitialCopy {
  return VARIANT_COPY[deriveVariant(data)];
}
