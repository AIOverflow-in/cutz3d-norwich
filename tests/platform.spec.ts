import { expect, test } from "@playwright/test";

test("landing page has no footer patch or horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-wordmark")).toContainText("3DCUTZ");
  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    footerBackground: getComputedStyle(document.querySelector("footer")!).backgroundColor,
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.footerBackground).not.toBe("rgb(255, 255, 255)");
});

test("customer can complete the booking interface", async ({ page }) => {
  await page.route("**/api/availability**", (route) => route.fulfill({ json: { slots: ["09:00", "09:45"] } }));
  await page.route("**/api/bookings", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const payload = route.request().postDataJSON();
    return route.fulfill({ status: 201, json: { managementToken: "safe-test-token", booking: { id: "test", reference: "3D-TEST01", customerName: payload.customerName, email: payload.email, phone: payload.phone, serviceId: "skin-fade", serviceName: "Skin Fade", price: 22, duration: 45, date: payload.date, time: payload.time, status: "Pending", createdAt: new Date().toISOString() } } });
  });
  await page.goto("/book");
  await page.getByRole("button", { name: /Skin Fade/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByLabel(/Full name/).fill("Jamie Test");
  await page.getByLabel(/Mobile number/).fill("07700900123");
  await page.getByLabel(/Email address/).fill("jamie@example.com");
  await page.getByRole("button", { name: /Request booking/ }).click();
  await expect(page.getByRole("heading", { name: "Request sent." })).toBeVisible();
  await expect(page.getByText("3D-TEST01")).toBeVisible();
  await expect(page.getByRole("link", { name: "Manage this booking" })).toHaveAttribute("href", "/manage?token=safe-test-token");
});

test("dashboard is protected and shows passwordless sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/login$/);
  await expect(page.getByRole("heading", { name: "Salon dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Email my secure link/ })).toBeVisible();
});
