# MyAutoScrap Frontend

A complete responsive React + Vite public website frontend for a UK scrap-car enquiry platform.

## Included

- Modern responsive homepage
- Sticky desktop/mobile header
- Six-step quote flow
- Mock vehicle lookup
- Mock price calculation with bonuses and deductions
- Customer details and validation
- Enquiry success screen and reference generation
- How It Works page
- Areas We Cover page with postcode checker and map placeholder
- About Us page
- Contact Us form
- FAQ search and accordions
- Privacy and Terms placeholders
- Responsive footer and WhatsApp action

## Mac setup

### 1. Install Node.js

Recommended: Node.js 22 or newer.

Using Homebrew:

```bash
brew install node
```

Confirm installation:

```bash
node -v
npm -v
```

### 2. Open the project

Extract the ZIP, open Terminal, and move into the folder:

```bash
cd ~/Downloads/myautoscrap-frontend
```

You can also type `cd ` with a trailing space and drag the folder into Terminal.

### 3. Install packages

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in Terminal, normally:

```text
http://localhost:5173
```

### 5. Open in VS Code

Install VS Code, then from the project folder run:

```bash
code .
```

If `code` is not recognised, open VS Code and use:

```text
Command Palette → Shell Command: Install 'code' command in PATH
```

## Production build

```bash
npm run build
```

The optimized files will be created in:

```text
dist/
```

Preview the production build:

```bash
npm run preview
```

## Important files

```text
src/App.jsx                    Routes
src/components/Layout.jsx      Header and footer
src/components/QuoteFlow.jsx   Complete quote journey
src/services/mockApi.js        Mock APIs and pricing
src/data/siteData.js           Cities, reviews and FAQs
src/styles.css                 Whole website design
src/pages/                     Public pages
```

## Replace mock APIs later

The frontend currently calls functions in:

```text
src/services/mockApi.js
```

Replace these with real HTTP requests when the backend is ready:

- `lookupVehicle(registration)`
- `calculateQuote(data)`
- `submitEnquiry(data)`

Suggested backend endpoints:

```text
POST /api/vehicles/lookup
POST /api/quotes/calculate
POST /api/enquiries
POST /api/contact
GET  /api/coverage/check
```

## Business details to replace

Search the project for these placeholders:

```text
0800 123 4567
447700900000
info@myautoscrap.co.uk
Add your registered UK address here
```

Also replace placeholder legal text before production release.
