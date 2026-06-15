import { test, expect } from "@playwright/test";

test.describe("Login de administrador", () => {

  test("Login con credenciales correctas redirige al dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("input[type='text'], input[placeholder*='usuario'], input[placeholder*='Usuario']").first().fill("admin");
    await page.locator("input[type='password']").fill("admin123");

    await page.locator("button[type='submit'], button:has-text('Ingresar')").click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });

  test("Login con credenciales incorrectas muestra mensaje de error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("input[type='text'], input[placeholder*='usuario'], input[placeholder*='Usuario']").first().fill("admin");
    await page.locator("input[type='password']").fill("contrasena_incorrecta");

    await page.locator("button[type='submit'], button:has-text('Ingresar')").click();

    await expect(page.locator("text=Usuario o contraseña incorrectos")).toBeVisible({ timeout: 5000 });
  });

});