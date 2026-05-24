# Siyaga - Arabic Text Rephrasing Tool

## Overview

Siyaga is a client-side Arabic text rephrasing tool that uses OpenAI's GPT-4o-mini model to rephrase Arabic text in different styles and levels. It is built as a static web application with no build tools or package managers required.

## File Structure

```
siyaga-/
├── index.html          # Main HTML entry point
├── css/
│   └── styles.css      # Custom CSS styles and animations
├── js/
│   ├── prompts.js      # System prompts for different styles/levels
│   ├── api.js          # OpenAI API integration
│   └── app.js          # Main application logic and UI handling
├── PROJECT_MAP.md      # This file - project documentation
└── .env.example        # Environment variable template (reference only)
```

## File Responsibilities

### index.html
- Main entry point with full UI structure
- Loads Tailwind CSS via CDN for utility-first styling
- Loads Google Fonts (Tajawal) for Arabic typography
- References local CSS and JavaScript files
- RTL layout with `dir="rtl"` and `lang="ar"`

### css/styles.css
- Custom animations (fade-in, slide-up, spin)
- RTL-specific adjustments
- Gradient backgrounds for header and buttons
- Custom scrollbar styling for textareas
- Toggle switch styling
- Responsive breakpoints

### js/prompts.js
- Defines system prompts for 3 rephrasing styles: academic, journalistic, conversational
- Defines 3 levels of modification: light, medium, deep
- Includes modifiers for paragraph numbering and source suggestions
- Exports `SiyagaPrompts` global object with `buildPrompt()` function

### js/api.js
- Handles OpenAI API communication
- Manages API key storage in localStorage
- Implements non-blocking logger for debugging
- Exports `SiyagaAPI` global object with `rephrase()`, `saveApiKey()`, `getApiKey()` functions

### js/app.js
- Main application controller
- Manages DOM interactions and event listeners
- Implements word counter, loading states, error handling
- Calculates change percentage between original and rephrased text
- Handles clipboard copy functionality

## How to Use

1. Open `index.html` in a modern web browser
2. Enter your OpenAI API key and click "Save"
3. Paste or type the Arabic text you want to rephrase
4. Select a style (academic, journalistic, conversational)
5. Select a level (light, medium, deep)
6. Optionally enable paragraph numbering or source suggestions
7. Click "Rephrase" and wait for the result
8. Copy the result using the "Copy" button

## Architecture Decisions

- **Static site, no build tools**: The application runs entirely in the browser with no server-side component, no npm, no bundler. This makes deployment trivial (just serve static files).
- **Client-side API calls**: OpenAI API is called directly from the browser. This eliminates the need for a backend server but means the API key is stored client-side.
- **localStorage for API key**: The user's API key is stored in localStorage for convenience. Users should be aware this is not a secure storage mechanism for production use.
- **Global objects instead of ES modules**: Since there is no bundler, JavaScript files expose functionality via global objects (SiyagaPrompts, SiyagaAPI) loaded in dependency order.
- **Tailwind CSS via CDN**: Using the CDN script tag for Tailwind avoids the need for PostCSS or any build pipeline.
- **Google Fonts (Tajawal)**: Chosen for excellent Arabic typography support.

## Security Note

The OpenAI API key is stored in the browser's localStorage. This is acceptable for personal use but should not be used in a shared or production environment. For production deployments, consider implementing a backend proxy to handle API calls securely.
