import { expect, test } from '@playwright/test';

test('loads the player and starts the sample unit', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');

    await expect(player.locator('#sample-unit-badge')).toHaveText('Sample Unit');
});
