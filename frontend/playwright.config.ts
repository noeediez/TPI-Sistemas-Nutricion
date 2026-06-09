import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Carpeta donde están los tests
testDir: "./e2e",

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Fallar la build si dejaste test.only en algún archivo
  forbidOnly: !!process.env.CI,

  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,

  // Workers paralelos
  workers: process.env.CI ? 1 : undefined,

  // Reporte HTML (se abre automáticamente al terminar)
  reporter: "html",

  use: {
    // URL base del proyecto local
    baseURL: "http://localhost:3000",

    // Guarda trazas si el test falla (para debug)
    trace: "on-first-retry",

    // Captura screenshot si falla
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Levanta el servidor de Next.js automáticamente antes de correr los tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
