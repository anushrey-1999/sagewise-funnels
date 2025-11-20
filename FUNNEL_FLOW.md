# Funnel Flow Architecture

## Overview

This application supports multiple funnels, each with their own set of questions. Users can come from external websites by clicking on funnel cards (e.g., Finance funnel, Insurance funnel, etc.).

## Flow

1. **User arrives from external website** → `/?funnel=finance`
2. **Homepage displays** → User sees homepage with "Get your quote" button
3. **User clicks button** → Redirects to `/form?funnel=finance`
4. **Form loads** → Funnel-specific questions are displayed based on the `funnel` query parameter
5. **User completes form** → All inputs are captured
6. **API call** → Form data is submitted to `/api/submit-form`
7. **Ads Wall** → User is redirected to `/ads-wall` with personalized ads

## File Structure

```
src/
├── lib/
│   ├── funnel-loader.ts          # Loads funnel configs based on ID
│   ├── funnel-configs/           # Folder for funnel JSON configs
│   │   ├── finance.json          # Finance funnel config
│   │   └── [funnel-name].json    # Add more funnels here
│   ├── api.ts                    # API client for form submission
│   └── form-config.example.json  # Default/example config
├── app/
│   ├── page.tsx                  # Homepage (always shows first)
│   ├── form/
│   │   └── page.tsx              # Form page (loads based on funnel param)
│   ├── ads-wall/
│   │   └── page.tsx              # Ads Wall page (shows after form submission)
│   └── api/
│       └── submit-form/
│           └── route.ts          # API endpoint for form submission
└── components/
    ├── Home.tsx                  # Homepage component
    ├── FormSection.tsx           # Form wrapper with API integration
    └── MultiStepForm.tsx        # Multi-step form component
```

## Adding a New Funnel

1. **Create funnel config JSON** in `src/lib/funnel-configs/[funnel-name].json`
   ```json
   {
     "id": "funnel-name",
     "title": "Funnel Title",
     "subtitle": "Funnel subtitle",
     "steps": [...],
     "finalStep": {...}
   }
   ```

2. **Import and register** in `src/lib/funnel-loader.ts`:
   ```typescript
   import newFunnelConfig from "./funnel-configs/funnel-name.json";
   
   const funnelConfigs: Record<string, FormConfig> = {
     // ... existing funnels
     "funnel-name": newFunnelConfig as FormConfig,
   };
   ```

3. **External websites** can link to: `https://yoursite.com/?funnel=funnel-name`

## URL Examples

- Homepage (no funnel): `https://yoursite.com/`
- Homepage with funnel: `https://yoursite.com/?funnel=finance`
- Form page: `https://yoursite.com/form?funnel=finance`
- Ads Wall: `https://yoursite.com/ads-wall?ads=[encoded-ads-data]`

## API Integration

The form submission API endpoint is at `/api/submit-form`. It expects:
```json
{
  "funnelId": "finance",
  "formData": {
    "step1": { "field1": "value1" },
    "step2": { "field2": "value2" }
  }
}
```

And returns:
```json
{
  "success": true,
  "data": {...},
  "adsWall": {
    "ads": [
      {
        "id": "1",
        "title": "Ad Title",
        "description": "Ad description",
        "image": "https://...",
        "link": "https://...",
        "provider": "Provider Name"
      }
    ]
  }
}
```

## Current Funnels

- `walk-in-bathtubs` - Default funnel (Walk-in Bathtubs)
- `finance` - Finance funnel (Personal Finance Solutions)

## Next Steps

1. Add more funnel configs as needed
2. Update API endpoint with actual backend integration
3. Customize Ads Wall page design
4. Add analytics/tracking for funnel sources

