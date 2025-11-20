# Dynamic Multi-Step Form System

This form system allows you to create dynamic multi-step forms from JSON configuration.

## Features

- ✅ **Dynamic Form Configuration**: Forms are defined in JSON
- ✅ **Multiple Input Types**: Supports checkbox, text, email, tel, number, radio
- ✅ **Dynamic Steps**: Any number of steps
- ✅ **Progress Bar**: Automatically calculates progress based on current step
- ✅ **Go Back Button**: Automatically hidden on first step, shown from step 2 onwards
- ✅ **Validation**: Built-in validation with Zod
- ✅ **Responsive**: Works on mobile, tablet, and desktop

## Usage

### 1. Create Form Configuration JSON

Create a JSON file (e.g., `form-config.json`) with your form structure:

```json
{
  "id": "my-form",
  "title": "Form Title",
  "subtitle": "Form subtitle",
  "steps": [
    {
      "id": "step1",
      "title": "Step 1 Title",
      "description": "Step 1 description",
      "fields": [
        {
          "id": "field1",
          "type": "checkbox",
          "label": "Option 1",
          "required": false
        }
      ]
    }
  ],
  "finalStep": {
    "title": "Thank you!",
    "description": "Your submission is complete.",
    "buttonText": "Submit"
  }
}
```

### 2. Use in Your Page

```tsx
import { MultiStepForm } from "@/components/MultiStepForm";
import formConfig from "@/lib/form-config.json";
import { FormConfig } from "@/types/form";

const config = formConfig as FormConfig;

export default function Page() {
  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data);
    // Send to API, etc.
  };

  return <MultiStepForm config={config} onSubmit={handleSubmit} />;
}
```

## Field Types

### Checkbox
```json
{
  "id": "feature1",
  "type": "checkbox",
  "label": "Feature Name",
  "required": false
}
```

### Text Input
```json
{
  "id": "name",
  "type": "text",
  "label": "Name",
  "placeholder": "Enter your name",
  "required": true
}
```

### Email
```json
{
  "id": "email",
  "type": "email",
  "label": "Email",
  "placeholder": "your@email.com",
  "required": true
}
```

### Radio Buttons
```json
{
  "id": "choice",
  "type": "radio",
  "label": "Make a choice",
  "required": true,
  "options": [
    { "value": "option1", "label": "Option 1" },
    { "value": "option2", "label": "Option 2" }
  ]
}
```

## Validation

Add validation rules to fields:

```json
{
  "id": "zipCode",
  "type": "text",
  "label": "Zip Code",
  "required": true,
  "validation": {
    "pattern": "^\\d{5}(-\\d{4})?$",
    "message": "Please enter a valid zip code"
  }
}
```

## Progress Calculation

Progress is automatically calculated as:
```
progress = ((currentStep + 1) / totalSteps) * 100
```

## Go Back Button

- **Hidden** on first step (step 0)
- **Shown** from step 2 onwards
- **Hidden** on final step (if configured)

## Form Data Structure

Submitted form data follows this structure:

```typescript
{
  [stepId]: {
    [fieldId]: value
  }
}
```

Example:
```json
{
  "features": {
    "fast-filling": ["fast-filling"],
    "quick-draining": ["quick-draining"]
  },
  "location": {
    "zipCode": "90210",
    "city": "Beverly Hills",
    "state": "California"
  }
}
```

## Example Configuration

See `src/lib/form-config.example.json` for a complete example.

