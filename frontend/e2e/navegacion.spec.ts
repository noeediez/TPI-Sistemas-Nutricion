import { test, expect } from "@playwright/test";

test.describe("Navegación principal", () => {

  test("La landing page carga correctamente", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("El link a la encuesta navega correctamente", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("a[href='/encuesta'], button:has-text('encuesta'), a:has-text('Encuesta')").first().click();

    await expect(page).toHaveURL(/\/encuesta/, { timeout: 5000 });
  });

  test("La página de ingredientes carga sin necesidad de login", async ({ page }) => {
    await page.goto("/ingredientes");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL("/ingredientes");
    await expect(page.locator("main")).toBeVisible({ timeout: 5000 });
  });

  test("El link al login de admin es accesible", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("input[type='password']")).toBeVisible({ timeout: 5000 });
  });

});