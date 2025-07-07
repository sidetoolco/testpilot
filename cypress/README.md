# Cypress Tests for Appcues Integration

This directory contains end-to-end tests to verify that the Appcues SDK is properly integrated and working on your application.

## Test Coverage

The tests verify:

1. **Appcues SDK Loading**
   - Script is properly loaded in the DOM
   - AppcuesSettings are correctly configured
   - Appcues object is available on the window

2. **Page-Specific Testing**
   - `/all-products` page functionality
   - `/create-test` page functionality
   - Appcues remains functional after page interactions

3. **Navigation Tracking**
   - Page changes are properly tracked
   - React Router navigation triggers Appcues.page() calls
   - Navigation between target pages works correctly

4. **Configuration Verification**
   - Correct Appcues account ID (222410)
   - URL detection is enabled
   - Settings are properly applied

## Running the Tests

### Prerequisites

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. The server should be accessible at `http://localhost:5173`

### Running Tests

#### Option 1: Using the test script (Recommended)
```bash
./scripts/test-appcues.sh
```

This script will:
- Check if the dev server is running
- Start it if needed
- Run the Appcues integration tests
- Clean up the dev server if it was started by the script

#### Option 2: Manual Cypress commands
```bash
# Run tests in headless mode
npm run test:e2e

# Open Cypress Test Runner
npm run cypress:open

# Run all Cypress tests
npm run cypress:run
```

## Test Structure

```
cypress/
├── e2e/
│   └── appcues-integration.cy.ts    # Main test file
├── support/
│   ├── commands.ts                  # Custom Cypress commands
│   └── e2e.ts                      # Support file
├── fixtures/                        # Test data (if needed)
└── tsconfig.json                   # TypeScript config for Cypress
```

## Custom Commands

The tests use custom Cypress commands:

- `cy.checkAppcuesLoaded()` - Verifies Appcues SDK is loaded
- `cy.checkAppcuesPageTracking()` - Tests page tracking functionality

## Troubleshooting

### Common Issues

1. **Development server not running**
   - Make sure to run `npm run dev` before running tests
   - The server should be on port 5173

2. **Appcues script not loading**
   - Check that the script is included in `index.html`
   - Verify the account ID is correct (222410)

3. **Page tracking not working**
   - Ensure `enableURLDetection: true` is set
   - Check that the AppcuesPageTracker component is properly integrated

### Debug Mode

To run tests with more verbose output:
```bash
DEBUG=cypress:* npm run test:e2e
```

## Adding New Tests

To add tests for additional pages:

1. Add a new describe block in `appcues-integration.cy.ts`
2. Follow the same pattern as existing page tests
3. Use the custom commands for consistency

Example:
```typescript
describe('New Page', () => {
  beforeEach(() => {
    cy.visit('/new-page')
    cy.get('#root').should('be.visible')
  })

  it('should have Appcues loaded', () => {
    cy.checkAppcuesLoaded()
  })
})
``` 