// Tests de validaciones por paso
// Verifica que no se pueda avanzar sin completar cada pregunta

import { test, expect } from "@playwright/test";

// Helper: navega y espera a que la página esté lista
async function irA(page: import("@playwright/test").Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
}
 
// ayuda para completar el Paso 1 correctamente
async function completarPaso1(page: import("@playwright/test").Page) {
  await page.locator('button:has-text("Femenino")').first().click();
  await page.locator('button:has-text("18-25")').click();
  await page.locator('button:has-text("Sí")').first().click();
  await page.locator('button:has-text("Sí")').nth(1).click();
  await page.locator('button:has-text("Siguiente")').click();
}
 
test.describe("Validaciones por paso", () => {
 
  test("Paso 1: no avanza si no se seleccionó sexo", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    // Intentar avanzar sin responder nada
    await page.locator('button:has-text("Siguiente")').click();
 
    // Debe aparecer el aviso de error
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
  });
 
  test("Paso 1: no avanza si falta la edad", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    // Solo seleccionar sexo, no la edad
    await page.locator('button:has-text("Femenino")').first().click();
    await page.locator('button:has-text("Siguiente")').click();
 
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
  });
 
  test("Paso 1: no avanza si faltan las preguntas generales", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    await page.locator('button:has-text("Femenino")').first().click();
    await page.locator('button:has-text("18-25")').click();
    // No responde las preguntas de Sí/No
 
    await page.locator('button:has-text("Siguiente")').click();
 
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
  });
 
  test("Paso 1: el aviso se cierra al hacer clic en Entendido", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    await page.locator('button:has-text("Siguiente")').click();
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
 
    await page.locator('button:has-text("Entendido")').click();
    await expect(page.locator(".aviso-toast")).not.toBeVisible();
  });
 
  test("Paso 2: no avanza si faltan preguntas de vista", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    // Completar paso 1 correctamente
    await completarPaso1(page);
 
    // En paso 2, intentar avanzar sin responder
    await expect(page.locator("h1")).toContainText("Vista", { timeout: 5000 });
    await page.locator('button:has-text("Siguiente")').click();
 
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
  });
 
  test("Paso 5: no envía si faltan respuestas afectivas", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    // Paso 1
    await completarPaso1(page);
 
    // Paso 2
    await expect(page.locator("h1")).toContainText("Vista", { timeout: 5000 });
    await page.locator('button:has-text("Muy atractivo")').first().click();
    await page.locator('button:has-text("Excelente")').first().click();
    await page.locator('button:has-text("Excelente")').nth(1).click();
    await page.locator('button:has-text("Siguiente")').click();
 
    // Paso 3
    await expect(page.locator("h1")).toContainText("Olfato", { timeout: 5000 });
    await page.locator('button:has-text("Muy agradable")').first().click();
    await page.locator('button:has-text("Crocante")').click();
    await page.locator('button:has-text("Excelente")').first().click();
    await page.locator('button:has-text("Muy buena")').first().click();
    await page.locator('button:has-text("Siguiente")').click();
 
    // Paso 4
    await expect(page.locator("h1")).toContainText("Sabor", { timeout: 5000 });
    await page.locator('button:has-text("Agradable")').first().click();
    await page.locator('button:has-text("Muy agradable")').first().click();
    await page.locator('button:has-text("Excelente")').first().click();
    await page.locator('button:has-text("Siguiente")').click();
 
    // Paso 5: intentar enviar sin responder
    await expect(page.locator("h1")).toContainText("Prueba Afectiva", { timeout: 5000 });
    await page.locator('button:has-text("Enviar encuesta")').click();
 
    await expect(page.locator(".aviso-toast")).toBeVisible({ timeout: 5000 });
    // No debe llegar a la pantalla de gracias
    await expect(page.locator("h1")).not.toContainText("Muchas gracias");
  });
 
  test("Navegación: el botón Atrás vuelve al paso anterior", async ({ page }) => {
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });
 
    // Completar y avanzar al paso 2
    await completarPaso1(page);
 
    // Verificar que estamos en paso 2
    await expect(page.locator("h1")).toContainText("Vista", { timeout: 5000 });
 
    // Volver atrás
    await page.locator('button:has-text("Atrás")').click();
 
    // Verificar que volvimos al paso 1
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 5000 });
  });
 
});