import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://localhost:3100";
const shotsDir = path.resolve("screenshots");
const storagePath = path.resolve("screenshots", "auth-state.json");

const desktopRoutes = [
  ["dashboard", "/"],
  ["routines", "/routines"],
  ["routines-detail", "/routines/detail?id=rutina-principal-4d"],
  ["routines-day", "/routines/day?routineId=rutina-principal-4d&dayId=lunes_empuje_a"],
  ["diet", "/diet"],
  ["diet-editor", "/diet/editor"],
  ["exercises", "/exercises"],
  ["exercises-detail", "/exercises/detail?id=press_banca"],
  ["measurements", "/measurements"],
  ["progress", "/progress"],
  ["settings", "/settings"],
  ["settings-profile", "/settings/profile"],
  ["workout-active", "/workout/active"],
  ["workout-finish", "/workout/finish"],
];

const mobileRoutes = [
  ["mobile-dashboard", "/"],
  ["mobile-routines", "/routines"],
  ["mobile-diet", "/diet"],
  ["mobile-exercises", "/exercises"],
  ["mobile-progress", "/progress"],
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeGoto(page, route) {
  const url = `${baseUrl}${route}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch {
    // best effort second attempt
    await wait(1200);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await wait(3500);
}

await fs.mkdir(shotsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const desktop = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await desktop.newPage();

  await safeGoto(page, "/login");
  await page.screenshot({ path: path.join(shotsDir, "login-desktop.png"), fullPage: true });

  let authenticated = false;
  try {
    await page.getByRole("button", { name: "Registrate" }).click({ timeout: 2000 });
    const randomEmail = `athlos.${Date.now()}@example.com`;
    await page.getByPlaceholder("tu@email.com").fill(randomEmail, { timeout: 3000 });
    await page.getByPlaceholder("Minimo 6 caracteres").fill("athlos1234", { timeout: 3000 });
    await page.getByRole("button", { name: "Crear cuenta" }).click({ timeout: 3000 });
    await wait(6000);
    authenticated = !page.url().includes("/login");
  } catch {
    authenticated = false;
  }

  for (const [name, route] of desktopRoutes) {
    try {
      await safeGoto(page, route);
      await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
    } catch {
      await page.screenshot({ path: path.join(shotsDir, `${name}-fallback.png`), fullPage: true });
    }
  }

  await desktop.storageState({ path: storagePath });

  const mobilePage = await desktop.newPage();
  await mobilePage.setViewportSize({ width: devices["iPhone 13"].viewport.width, height: devices["iPhone 13"].viewport.height });

  for (const [name, route] of mobileRoutes) {
    try {
      await safeGoto(mobilePage, route);
      await mobilePage.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
    } catch {
      await mobilePage.screenshot({ path: path.join(shotsDir, `${name}-fallback.png`), fullPage: true });
    }
  }

  await mobilePage.close();
  await desktop.close();
} finally {
  await browser.close();
}
