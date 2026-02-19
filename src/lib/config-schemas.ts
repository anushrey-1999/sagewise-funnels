import { z } from "zod";

// Shared
const inputTypeSchema = z.enum([
  "checkbox",
  "text",
  "radio",
  "select",
  "dropdown",
  "textarea",
  "email",
  "tel",
  "number",
]);

const redirectRuleSchema = z
  .object({
    whenValues: z.array(z.string()).default([]),
    to: z.string().min(1),
  })
  .passthrough();

const redirectOnAnswerSchema = z
  .object({
    rules: z.array(redirectRuleSchema).default([]),
    defaultTo: z.string().optional(),
  })
  .passthrough();

const formFieldSchema = z
  .object({
    id: z.string().min(1),
    type: inputTypeSchema,
    label: z.string().optional(),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    autoForward: z.boolean().optional(),
    redirectOnAnswer: redirectOnAnswerSchema.optional(),
    redirectImmediately: z.boolean().optional(),
    validation: z
      .object({
        pattern: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        message: z.string().optional(),
      })
      .passthrough()
      .optional(),
    options: z.array(z.object({ value: z.string(), label: z.string() }).passthrough()).optional(),
  })
  .passthrough();

const skipConditionSchema = z
  .object({
    checkStepId: z.string().min(1),
    checkFieldId: z.string().min(1),
    whenValues: z.array(z.string()).default([]),
  })
  .passthrough();

const formStepSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    description: z.string().optional().default(""),
    fields: z.array(formFieldSchema).min(1),
    skipIf: z.union([skipConditionSchema, z.array(skipConditionSchema)]).optional(),
  })
  .passthrough();

export const funnelConfigSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    subtitle: z.string(),
    metaDescription: z.string().optional(),
    onLoadScript: z.string().optional(),
    firstStepButton: z
      .object({
        text: z.string().optional(),
        bgColor: z.string().optional(),
        hoverBgColor: z.string().optional(),
        textColor: z.string().optional(),
      })
      .passthrough()
      .optional(),
    navbar: z
      .object({
        tagline: z.string().optional(),
        phone: z.string().optional(),
      })
      .passthrough()
      .optional(),
    postFormInfoBar: z
      .object({
        items: z.array(z.object({ icon: z.string(), text: z.string() }).passthrough()),
      })
      .passthrough()
      .optional(),
    providerLogos: z
      .object({
        heading: z.string().optional(),
        logos: z.array(
          z
            .object({
              src: z.string(),
              alt: z.string(),
              width: z.number(),
              height: z.number(),
            })
            .passthrough()
        ),
      })
      .passthrough()
      .optional(),
    belowLogosImage: z
      .object({
        src: z.string(),
        alt: z.string().optional(),
        width: z.number(),
        height: z.number(),
      })
      .passthrough()
      .optional(),
    postContent: z.unknown().optional(),
    steps: z.array(formStepSchema).min(1),
    finalStep: z
      .object({
        buttonText: z.string().optional(),
        disclaimerText: z.string().optional(),
        loaderText: z.string().optional(),
        redirectTo: z.string().optional(),
        onSubmitScript: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

// Adwall
const adwallCardSchema = z
  .object({
    heading: z.string(),
    description: z.string(),
    features: z.array(z.string()).default([]),
    buttonLink: z.string(),
    buttonText: z.string(),
    ratingsNumber: z.string().optional().default(""),
    ratingsCount: z.number().optional().default(5),
    logo: z.string().optional().default(""),
    logoWidth: z.string().optional().default(""),
    logoHeight: z.string().optional().default(""),
    logoText: z.string().optional(),
    creditCardImage: z.string().optional().default(""),
    badgeText: z.string().optional().default(""),
    badgeIcon: z.string().optional().default(""),
    advertiserName: z.string().optional().default(""),
    isDifferentBorder: z.boolean().optional(),
    phoneNumber: z.string().optional(),
    impressionScript: z.string().optional(),
  })
  .passthrough();

export const adwallConfigSchema = z
  .object({
    id: z.string().min(1),
    funnelId: z.string().min(1),
    adwallType: z.string().min(1),
    title: z.string(),
    subtitle: z.string(),
    updatedAt: z.string(),
    navbar: z
      .object({
        tagline: z.string().optional(),
        phone: z.string().optional(),
      })
      .passthrough()
      .optional(),
    cards: z.array(adwallCardSchema).min(1),
    disclaimers: z.string().optional(),
    metadata: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .passthrough()
      .optional(),
    trackingParams: z
      .object({
        affiliateIdParam: z.string().optional(),
        transactionIdParam: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const configUpsertSchema = z.object({
  draft: z.unknown(),
});

