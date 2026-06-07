// Test E2E — flujo completo de la encuesta
// Simula a un usuario  completando todos los pasos y enviando

import { test, expect } from "@playwright/test";

// espera que la página cargue y el contenido sea visible
async function irA(page: import("@playwright/test").Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
}

// hace clic en un botón que contiene el texto (ignora emojis y <br>)
async function clickBoton(page: import("@playwright/test").Page, texto: string) {
  await page.locator(`button:has-text("${texto}")`).first().click();
}

test.describe("Flujo completo de la encuesta", () => {

  test("El usuario completa y envía la encuesta sin errores", async ({ page }) => {

    // Ir a la página de la encuesta 
    await irA(page, "/encuesta");
    await expect(page.locator("h1")).toContainText("Antes de empezar", { timeout: 15000 });

    // Datos 
    await clickBoton(page, "Femenino");
    await clickBoton(page, "18-25");

    // Preguntas Sí/No (primera y segunda)
    const botonesGrales = page.locator('button:has-text("Sí")');
    await botonesGrales.first().click();
    await botonesGrales.nth(1).click();

    await clickBoton(page, "Siguiente");

    // Vista 
    await expect(page.locator("h1")).toContainText("Vista", { timeout: 5000 });

    await clickBoton(page, "Muy atractivo");

    const excelentes = page.locator('button:has-text("Excelente")');
    await excelentes.first().click();
    await excelentes.nth(1).click();

    await clickBoton(page, "Siguiente");

    // Olfato y Textura 
    await expect(page.locator("h1")).toContainText("Olfato", { timeout: 5000 });

    await clickBoton(page, "Muy agradable");
    await clickBoton(page, "Crocante");

    const excelentesP3 = page.locator('button:has-text("Excelente")');
    await excelentesP3.first().click();

    const muyBuenas = page.locator('button:has-text("Muy buena")');
    await muyBuenas.first().click();

    await clickBoton(page, "Siguiente");

    // Sabor
    await expect(page.locator("h1")).toContainText("Sabor", { timeout: 5000 });

    const agradables = page.locator('button:has-text("Agradable")');
    await agradables.first().click();
    await clickBoton(page, "Muy agradable");

    const excelentesP4 = page.locator('button:has-text("Excelente")');
    await excelentesP4.first().click();

    await clickBoton(page, "Siguiente");

    // Prueba Afectiva 
    await expect(page.locator("h1")).toContainText("Prueba Afectiva", { timeout: 5000 });

    const excelentesP5 = page.locator('button:has-text("Excelente")');
    await excelentesP5.first().click();

    const botonesS = page.locator('button:has-text("Sí")');
    await botonesS.first().click();
    await botonesS.nth(1).click();

    await page.locator("textarea").fill("Excelente producto, muy sabroso y saludable.");

    await page.locator('button:has-text("Enviar encuesta")').click();

    //  Verificación: pantalla de agradecimiento 
    await expect(page.locator("h1")).toContainText("Muchas gracias", { timeout: 15000 });
  });

});
