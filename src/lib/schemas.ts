import { z } from "zod";

export const bathtubFeaturesSchema = z.object({
  features: z.array(z.string()).min(1, "Please select at least one feature"),
});

export type BathtubFeaturesForm = z.infer<typeof bathtubFeaturesSchema>;

