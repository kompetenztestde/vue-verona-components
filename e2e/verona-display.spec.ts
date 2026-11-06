import { expect, test } from '@playwright/test';

test('loads the player and starts the sample unit', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');

    await expect(player.locator('#sample-unit-badge')).toHaveText('Sample Unit');
});

test('shows emitted events in the demo log', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');
    await player.locator('#next-unit').click();

    const entry = page.locator('[data-testid="emit-entry"][data-emit="navigationRequested"]');
    await expect(entry).toContainText('next');
});
