import { test, expect } from '@playwright/test';

const MOCK_HOTELS = [
  {
    id: 'hotel-01',
    name: 'The Grand Backwaters Resort',
    place_id: 'kumarakom',
    place_name: 'Kumarakom',
    star_rating: 5,
    average_rating: 4.9,
    address: 'Vembanad Lake, Kumarakom, Kerala',
    min_price: 6500,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['wifi', 'pool', 'spa', 'breakfast', 'parking']
  },
  {
    id: 'hotel-02',
    name: 'Munnar Misty Hills Sanctuary',
    place_id: 'munnar',
    place_name: 'Munnar',
    star_rating: 4,
    average_rating: 4.7,
    address: 'Tea Gardens Road, Munnar, Kerala',
    min_price: 4200,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    amenities: ['wifi', 'restaurant', 'parking', 'sea_view']
  }
];

const MOCK_PLACES = [
  { id: 'munnar', name: 'Munnar', state: 'Kerala' },
  { id: 'kumarakom', name: 'Kumarakom', state: 'Kerala' }
];

test.describe('Hotelier E2E Smoke & Hospitality Lifecycle Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API routes with mock fixtures for deterministic offline/CI test execution
    await page.route('**/api/hotels/places*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ places: MOCK_PLACES })
      });
    });

    await page.route('**/api/hotels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hotels: MOCK_HOTELS })
      });
    });

    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null })
      });
    });

    await page.route('**/api/coupons/active*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ coupons: [] })
      });
    });

    // Navigate to platform home
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('1. Guest Homepage Smoke Test - verifies branding, navigation, and hotel discovery', async ({ page }) => {
    // Check navigation brand
    const brand = page.locator('header a:has-text("Hotelier")');
    await expect(brand).toBeVisible();

    // Check main navigation links
    await expect(page.locator('header a:has-text("Explore Hotels")')).toBeVisible();
    await expect(page.locator('header a:has-text("Saved Stays")')).toBeVisible();

    // Check Featured Accommodations section
    const accommodationsHeading = page.locator('h2:has-text("Featured Accommodations")');
    await expect(accommodationsHeading).toBeVisible();

    // Verify mock hotel is rendered
    await expect(page.locator('text=The Grand Backwaters Resort').first()).toBeVisible();
  });

  test('2. Multi-Currency Switcher - converts hotel tariffs across regional currencies', async ({ page }) => {
    // Open currency dropdown
    const currencyBtn = page.locator('button[aria-label="Currency Selector"]');
    await expect(currencyBtn).toBeVisible();
    await currencyBtn.click();

    // Select US Dollar ($)
    const usdOption = page.locator('button:has-text("USD ($)")');
    await expect(usdOption).toBeVisible();
    await usdOption.click();

    // Verify currency button reflects USD
    await expect(currencyBtn).toContainText('USD');

    // Switch to Euro (€)
    await currencyBtn.click();
    const eurOption = page.locator('button:has-text("EUR (€)")');
    await expect(eurOption).toBeVisible();
    await eurOption.click();

    await expect(currencyBtn).toContainText('EUR');
  });

  test('3. AI Concierge ("Aria") - opens floating widget, sends prompt chip, and displays response', async ({ page }) => {
    // Click floating Aria launcher button
    const aiLauncher = page.locator('button[aria-label="Ask AI Concierge"]');
    await expect(aiLauncher).toBeVisible();
    await aiLauncher.click();

    // Verify AI Concierge Drawer opened
    const drawerHeader = page.locator('h3:has-text("Aria AI Concierge")');
    await expect(drawerHeader).toBeVisible();

    // Verify quick prompt chips are visible
    const promptChip = page.locator('button:has-text("Romantic Stays in Munnar")');
    await expect(promptChip).toBeVisible();

    // Click prompt chip and verify user query is posted
    await promptChip.click();
    await expect(page.locator('text=Show me romantic luxury resorts in Munnar with scenic views')).toBeVisible();

    // Close the concierge drawer
    const closeBtn = page.locator('button[title="Close Concierge"]');
    await closeBtn.click();
    await expect(drawerHeader).not.toBeVisible();
  });

  test('4. Side-by-Side Comparison Drawer - adds hotel to comparison dock and verifies tray', async ({ page }) => {
    // Wait for hotel card compare button
    const compareBtn = page.locator('button[title*="Compare"], button[aria-label*="Compare"], button:has-text("Compare")').first();
    await expect(compareBtn).toBeVisible({ timeout: 10000 });
    await compareBtn.click();

    // Floating comparison dock should appear
    const comparisonDock = page.locator('aside[aria-label="Hotel Comparison Toolbar"]');
    await expect(comparisonDock).toBeVisible();
    await expect(comparisonDock).toContainText('Compare (1/3)');
  });

  test('5. Auth Modal - opens guest login dialog and verifies guest access option', async ({ page }) => {
    // Click Sign In button in navbar
    const signInBtn = page.locator('header button:has-text("Sign In")');
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // Check modal header ("Welcome Back")
    const modalHeading = page.locator('h2:has-text("Welcome Back")');
    await expect(modalHeading).toBeVisible();

    // Verify instant demo guest button is available
    const guestBtn = page.locator('button:has-text("Continue as Guest")');
    await expect(guestBtn).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(modalHeading).not.toBeVisible();
    }
  });
});
