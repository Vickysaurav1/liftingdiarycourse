# UI Coding Standards

This document outlines the coding standards for UI development throughout this project.

## Component Library

### Required
- **ONLY shadcn/ui components** must be used for all UI elements in this project
- All component imports should come from `@/components/ui/*`

### Prohibited
- **NO custom components** should be created
- Do not build custom wrappers around shadcn/ui components
- Do not create application-specific component abstractions
- All UI needs must be met using the existing shadcn/ui component library

## Example Usage

```typescript
// ✅ CORRECT - Using shadcn/ui
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  );
}
```

```typescript
// ❌ WRONG - Creating custom components
export function MyCustomButton({ children }) {
  return <button className="custom-styles">{children}</button>;
}

// ❌ WRONG - Custom wrappers around shadcn/ui
export function MyButton(props) {
  return <Button {...props} />;
}
```

## Date Formatting

All dates must be formatted using **date-fns** library.

### Date Format Pattern
Dates should follow the format: `{day}{ordinal} {month} {year}`

### Examples
- `1st Sep 2025`
- `2nd Aug 2025`
- `3rd Jan 2026`
- `4th Jun 2024`
- `21st Dec 2025`
- `22nd Mar 2026`
- `23rd Jul 2024`
- `31st Oct 2025`

### Implementation

```typescript
import { format } from "date-fns";

const date = new Date(2025, 8, 1); // September 1, 2025
const formatted = format(date, "do MMM yyyy");
// Result: "1st Sep 2025"
```

### Using with date-fns Locale
For consistent formatting across the application:

```typescript
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const date = new Date();
const formatted = format(date, "do MMM yyyy", { locale: enUS });
```

## Styling

- Use **Tailwind CSS v4** for all styling
- Leverage shadcn/ui's built-in styling and customization
- Modify components via className props rather than creating custom variants
- Refer to Tailwind CSS documentation for responsive design and utility classes

## Summary

| Requirement | Rule |
|-------------|------|
| Components | ONLY shadcn/ui components |
| Custom Code | NO custom components allowed |
| Date Format | Use date-fns with format "do MMM yyyy" (e.g., 1st Sep 2025) |
| Styling | Tailwind CSS v4 via shadcn/ui |
