import { selectors } from "./selectors";
import { BASE_URL } from "./constants";

// @ts-ignore
export const BCEID_USERNAME: string = process.env.BCEID_USERNAME;
// @ts-ignore
export const BCEID_PASSWORD: string = process.env.BCEID_PASSWORD;

// https://playwright.dev/docs/auth

// TODO IMPROVEMENT: Have the authSimple state work once (as a beforeAll()) and save the state for each test. Not sure how to do that yet.

/**
 * This handles simple authentication using a fixed email/password. It has ONE SHARED ACCOUNT!
 * So generally this should only be used for GET requests, not POST requests, as with POST 
 * we introduce race conditions with concurrent tests or developers running them at the same time on their machiens.
 * @param page Playwright page object.
 */
export async function authSimple(page) {
    await page.goto(BASE_URL)
    await page.locator(selectors.loginButton).click()
    // Unfortunately we have duplicate id fields, so we must also select based on text.
    await page.locator(selectors.loginBCeIDButton + ':text("Basic/Business BCeID")').click();

    // These are BCeID selectors here
    await page.locator('#user').fill(BCEID_USERNAME)
    await page.locator('#password').fill(BCEID_PASSWORD)

    await page.locator('input[type="submit"].btn-primary').click()

    // wait for "Search Site Registry" header to appear, means we're on homepage

    // TODO add some sort of like, wait for site to reload and be stable
}