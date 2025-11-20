import { FormData } from "@/types/form";

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  adsWall?: {
    ads: Array<{
      id: string;
      title: string;
      description: string;
      image?: string;
      link: string;
      provider: string;
    }>;
  };
}

/**
 * Submit form data to API
 * @param funnelId - The ID of the funnel
 * @param formData - The form data to submit
 * @returns Promise with API response
 */
export async function submitFormData(
  funnelId: string,
  formData: FormData
): Promise<ApiResponse> {
  try {
    // TODO: Replace with actual API endpoint
    const response = await fetch("/api/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        funnelId,
        formData,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

