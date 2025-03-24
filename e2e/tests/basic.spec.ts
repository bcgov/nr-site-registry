import { test, expect } from '@playwright/test';

// The imports in e2e tests are slightly different, but typescript still configured incorrectly.
// @ts-ignore
const BASE_URL: string = process.env.BASE_URL;

test('has title', async ({ page }) => {
  await page.goto(BASE_URL);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Site Remediation Services/);
});

test('has heading', async ({ page }) => {
  await page.goto(BASE_URL);

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Search Site Registry' })).toBeVisible();
});

test('has BCGov logo', async ({ page }) => {
  await page.goto(BASE_URL);
  const logo = await page.locator('img.logo');
  await expect(logo).toBeVisible();
})