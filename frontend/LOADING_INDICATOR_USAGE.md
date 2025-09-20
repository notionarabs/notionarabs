# Loading Indicator Usage Guide

## Overview

The loading indicator system has been implemented to show a beautiful loading animation during page navigation that matches your website's design system.

## Features

- **Automatic Detection**: Automatically detects navigation events and shows loading indicator
- **Design System Integration**: Uses your website's orange/blue color scheme and dark mode support
- **Arabic Text**: Shows "جاري التحميل..." (Loading...) in Arabic
- **Smooth Animations**: Multiple spinning rings with pulsing center dot
- **Backdrop Blur**: Modern glass-morphism effect with backdrop blur

## Components Created

### 1. LoadingContext (`contexts/LoadingContext.js`)

Manages the global loading state across the application.

### 2. LoadingIndicator (`components/LoadingIndicator.js`)

The visual loading indicator component with spinning animation.

### 3. NavigationHandler (`components/NavigationHandler.js`)

Handles navigation events and manages loading state automatically.

### 4. LoadingLink (`components/LoadingLink.js`)

A custom Link component that triggers loading state on navigation.

## How It Works

The loading indicator automatically appears when:

- User navigates between pages using the Next.js router
- User uses browser back/forward buttons
- Any navigation event is triggered

The indicator disappears when:

- The new page has finished loading
- Navigation is complete

## Usage

### Automatic Usage (Recommended)

The loading indicator works automatically for all navigation. No additional setup required.

### Manual Usage with LoadingLink

If you want to use the custom LoadingLink component for specific links:

```jsx
import LoadingLink from "../components/LoadingLink";

// Instead of regular Link
<LoadingLink href="/templates" className="nav-link">
  القوالب
</LoadingLink>;
```

### Manual Loading Control

If you need to manually control the loading state:

```jsx
import { useLoading } from "../contexts/LoadingContext";

function MyComponent() {
  const { setLoading } = useLoading();

  const handleSomeAction = async () => {
    setLoading(true);
    // Do something that takes time
    await someAsyncOperation();
    setLoading(false);
  };

  return <button onClick={handleSomeAction}>Perform Action</button>;
}
```

## Styling

The loading indicator uses CSS classes defined in `globals.css`:

- `.loading-overlay`: Main overlay container
- `.loading-spinner`: Primary spinning ring
- `.loading-spinner-outer`: Secondary spinning ring (reverse direction)
- `.loading-dot`: Pulsing center dot
- `.loading-text`: Loading text styling

## Customization

To customize the loading indicator:

1. **Colors**: Modify the CSS classes in `globals.css` to change colors
2. **Text**: Change "جاري التحميل..." in `LoadingIndicator.js`
3. **Animation Speed**: Adjust animation durations in CSS
4. **Size**: Modify the spinner size by changing the width/height classes

## Integration Status

✅ LoadingContext created and integrated
✅ LoadingIndicator component created with design system colors
✅ NavigationHandler integrated in layout
✅ CSS styles added to globals.css
✅ Layout updated with LoadingProvider and LoadingIndicator
✅ LoadingLink component created for manual usage

The loading indicator is now fully functional and will show automatically during page navigation!
