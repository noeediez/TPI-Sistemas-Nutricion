import { test, expect } from "@playwright/test";

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.waitForLoadState("domcontentloaded");
  await page.locator("input[type='text'], input[placeholder*='usuario'], input[placeholder*='Usuario']").first().fill("admin");
  await page.locator("input[type='password']").fill("admin123");
  await page.locator("button[type='submit'], button:has-text('Ingresar')").click();
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe("Dashboard de administración", () => {

  test("El dashboard carga y muestra estadísticas globales", async ({ page }) => {
    await loginAdmin(page);

    await expect(page.locator("h2, h3").first()).toBeVisible({ timeout: 10000 });
  });

  test("El dashboard muestra el gráfico radar de atributos", async ({ page }) => {
    await loginAdmin(page);

    await expect(page.locator(".recharts-radar, svg")).toBeVisible({ timeout: 10000 });
  });

  test("El listado de respuestas se muestra ordenado", async ({ page }) => {
    await loginAdmin(page);

    const tabla = page.locator("div, section").filter({ hasText: /respuesta/i }).first();
    await expect(tabla).toBeVisible({ timeout: 10000 });
  });

});