# Generic Adwall Ranking System

The ranking system allows any funnel to dynamically sort adwall cards based on user responses to funnel questions.

## Overview

The system is now **completely generic** and works with any funnel type, not just mortgage. Rankings are configured in the Admin Panel's **Metrics tab** for each adwall.

## How It Works

### 1. Define Ranking Dimensions

Dimensions are the criteria used for ranking (e.g., credit score, loan amount, age, income). Each dimension:

- Has an **ID** and **label**
- Maps to a **form field** that users fill out
- Contains **buckets** that group values (e.g., "Excellent", "Good", "Fair")
- Can be **direct** (reads form value as-is) or **calculated** (derives value from multiple fields)

### 2. Configure Rankings

For each lender and each combination of dimension buckets, assign a rank number:

```
Lender          | Excellent × $50K-$150K | Excellent × $150K-$300K | ...
----------------|------------------------|-------------------------|-----
Quicken Loans   | 13                     | 13                      | ...
Figure          | 2                      | 2                       | ...
```

Lower numbers = higher priority (appear first).

### 3. Runtime Flow

1. User completes funnel form
2. System extracts values for each dimension from form data
3. Values are mapped to bucket IDs
4. Bucket IDs are passed as URL params: `?rankCreditScore=excellent&rankLoanAmount=150-300`
5. Adwall template reads these params and sorts cards using the ranking matrix

## Data Structure

### RankingConfig

```typescript
{
  dimensions: [
    {
      id: "creditScore",
      label: "Credit Score",
      fieldId: "creditScore",           // Optional: defaults to dimension id
      valueType: "direct",               // "direct" or "calculated"
      buckets: [
        {
          id: "excellent",
          label: "Excellent (740+)",
          matchValues: ["excellent"]     // Maps form values to bucket
        },
        { id: "good", label: "Good (680-739)", matchValues: ["good"] },
        { id: "fair", label: "Fair (620-679)", matchValues: ["fair", "poor", "bad"] }
      ]
    },
    {
      id: "loanAmount",
      label: "Loan Amount",
      fieldId: "loanAmount",
      valueType: "calculated",
      calculation: {
        type: "mortgage-amount",         // Predefined calculation
        requiredFields: ["homeValue", "mortgageBalance", "purchasePrice", "downPayment"]
      },
      buckets: [
        { id: "50-150", label: "$50K–$150K" },
        { id: "150-300", label: "$150K–$300K" },
        { id: "300-500", label: "$300K–$500K" },
        { id: "500-plus", label: "$500K+" }
      ]
    }
  ],
  lenders: {
    "Quicken Loans": {
      "excellent:50-150": 13,
      "excellent:150-300": 13,
      "good:50-150": 5,
      // ... all combinations
    },
    "Figure": {
      "excellent:50-150": 2,
      // ...
    }
  }
}
```

## Adding Rankings to a New Funnel

### Step 1: Define Dimensions in Admin Panel

1. Go to Admin Panel → Select your adwall → **Metrics tab**
2. Click **"Configure Dimensions"** tab
3. Click **"Add Dimension"** to create each ranking criterion
4. For each dimension:
   - Set **ID** (e.g., "age", "income") - used in URLs as `rankAge`, `rankIncome`
   - Set **Label** (e.g., "Driver Age") - shown in admin UI
   - Set **Form Field ID** - which funnel question to read from (leave empty to use dimension ID)
   - Choose **Value Type**:
     - **Direct**: Read value directly from form field
     - **Calculated**: Derive value using custom logic
   - Define **Buckets**: The value ranges (e.g., "18-25", "26-40", "41+")
     - **Bucket ID**: Used in combination keys (e.g., "18-25")
     - **Bucket Label**: Shown in admin UI table (e.g., "Age 18-25")

### Step 2: Configure Lender Rankings

1. Click **"Load Defaults"** (if available) or **"Add Lender"**
2. Enter lender names
3. Fill in rank numbers for each dimension combination
4. Or use **"Import CSV"** / **"Import from Adwall"**

### Step 3: Update Funnel Form Submission

In `src/components/FormSection.tsx`, add logic to build ranking params for your funnel:

```typescript
// For non-mortgage funnels, add similar logic:
const myFunnelRankingParams = 
  config.id === "my-funnel" ? buildMyFunnelRankingParams(formData, destinationPath) : null;

if (myFunnelRankingParams) {
  params.rankAge = myFunnelRankingParams.rankAge;
  params.rankIncome = myFunnelRankingParams.rankIncome;
}
```

Or better: Create a generic param builder that reads the adwall config!

### Step 4: Map Form Values to Buckets

**Direct Mapping (String Values):**
If your form field returns "excellent", "good", "fair":
- Use `matchValues` in buckets to map these to bucket IDs

**Calculated Values (Numbers):**
If dimension is numeric (like loan amount):
- Bucket IDs like `"50-150"`, `"300-500"`, `"500-plus"` are auto-parsed
- Numeric form values are matched to ranges

**Custom Calculations:**
Add calculation type in `src/lib/generic-adwall-ranking.ts`:

```typescript
function resolveDimensionValue(...) {
  if (dimension.calculation?.type === "my-custom-calc") {
    return myCustomCalculation(formData);
  }
}
```

## Current Limitations

1. **FormSection still mortgage-specific**: The URL param building logic is hardcoded for mortgage. Need to:
   - Fetch adwall config during form submission, OR
   - Pass adwall ranking metadata through funnel configs, OR
   - Create a generic param builder that works for all funnels

2. **Metrics UI is mortgage-specific**: The UI shows hardcoded dimensions. Need to:
   - Add dimension management UI (add/remove/edit dimensions)
   - Dynamic table generation based on configured dimensions

3. **Calculation types are limited**: Only `mortgage-amount` is implemented. Add more as needed.

## Future Enhancements

- [ ] Dimension management UI in Metrics tab
- [ ] Generic form param builder (fetch adwall config)
- [ ] More calculation types (percentages, ratios, etc.)
- [ ] Conditional dimensions (show certain dimensions based on funnel type)
- [ ] Ranking preview/simulation tool
- [ ] Export rankings to Excel
- [ ] A/B testing different ranking strategies

## Files

- **Types:** `src/types/adwall.ts`
- **Generic Logic:** `src/lib/generic-adwall-ranking.ts`
- **Mortgage Defaults:** `src/lib/mortgage-ranking-defaults.ts`
- **Adwall Template:** `src/templates/AdsWallTemplate.tsx`
- **Metrics UI:** `src/app/admin/adwalls/MetricsEditor.tsx`
- **Form Submission:** `src/components/FormSection.tsx`
- **Schemas:** `src/lib/config-schemas.ts`
