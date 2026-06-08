import { test, expect } from "@playwright/test";

test("Completar encuesta completa", async ({ page }) => {
  await page.goto("http://localhost:3000/encuesta");

  // PASO 1
  await page.getByText("Femenino").click();
  await page.getByText("18-25").click();

  await page.getByRole("button", { name: "Sí" }).first().click();
  await page.getByRole("button", { name: "Sí" }).last().click();

  await page.getByRole("button", { name: /Enviar encuesta/i }).click();

  // PASO 2
  await page.getByText("Muy atractivo").click();

  await page.getByRole("button", { name: "Excelente" }).nth(0).click();
  await page.getByRole("button", { name: "Excelente" }).nth(1).click();

  await page.getByRole("button", { name: /Enviar encuesta/i }).click();

  // PASO 3
  await page.getByText("Muy agradable").click();
  await page.getByText("Muy crocante").click();

  await page.getByRole("button", { name: "Excelente" }).nth(0).click();
  await page.getByRole("button", { name: "Excelente" }).nth(1).click();

  await page.getByRole("button", { name: /Enviar encuesta/i }).click();

  // PASO 4
  await page.getByRole("button", { name: "Muy agradable" }).nth(0).click();
  await page.getByRole("button", { name: "Muy agradable" }).nth(1).click();

  await page.getByRole("button", { name: "Excelente" }).click();

  await page.getByRole("button", { name: /Enviar encuesta/i }).click();

  // PASO 5
  await page.getByRole("button", { name: "Excelente" }).click();

  await page.getByRole("button", { name: "Sí" }).first().click();
  await page.getByRole("button", { name: "Sí" }).last().click();

  await page.locator("textarea").fill(
    "Prueba automática realizada con Playwright"
  );

  await page.getByRole("button", {
    name: /Enviar encuesta/i,
  }).click();

  await expect(
    page.getByText("¡Muchas gracias!")
  ).toBeVisible({ timeout: 10000 });
});