import { test, expect } from '@playwright/test';
import { selectors } from './selectors';
import { authSimple } from './auth';

/**
 * TODO:
 * - we should use https://playwright.dev/docs/auth
 * - try to login ONCE, and share auth between all subsequent tests
 * - if we have to write to filesystem (for auth), how does that work in github actions?
 * - above only really works for GETs.
 * 
 * - can write separate tests which have per-account tests if we modify server state.
 */

test('can login with BCeID account', async ({ page }) => {
    // await page.goto(BASE_URL)
    // await page.locator(selectors.loginButton).click()
    // // Unfortunately we have duplicate id fields, so we must also select based on text.
    // await page.locator(selectors.loginBCeIDButton + ':text("Basic/Business BCeID")').click();

    // // Now we navigate to a whole new page, and need to type in the auth creds.
    // // wait 5sec, for navigation
    // // await page.waitForTimeout(5 * 1000);
    // // can we reduce this to wait for url? or wait for inputs?
   
    // // These are BCeID selectors here
    // await page.locator('#user').fill(BCEID_USERNAME)
    // await page.locator('#password').fill(BCEID_PASSWORD)

    // await page.locator('input[type="submit"].btn-primary').click()
    await authSimple(page)


    await page.waitForTimeout(2 * 1000);

    expect(1).toBe(1);
});


