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

test('restores the saved unit state after a reload', async ({ page }) => {
    await page.goto('/');

    // the form fields are on the second page of the sample unit
    const player = page.frameLocator('iframe.verona-frame');
    await player.locator('#next-page').click();
    const emailField = player.locator('input[name="email-field"]');
    await emailField.fill('restored@example.org');
    await emailField.blur();

    // the demo saves the unit state reported by the player and passes it back after a reload
    const stateEntry = page.locator('[data-testid="emit-entry"][data-emit="stateChanged"]');
    await expect(stateEntry.first()).toContainText('restored@example.org');

    await page.reload();

    // only the unit state is restored, the current page is not
    await player.locator('#next-page').click();
    await expect(emailField).toHaveValue('restored@example.org');
});

test('enables the reset button without a reload once a unit state is saved', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');
    await player.locator('#next-page').click();
    const emailField = player.locator('input[name="email-field"]');
    await emailField.fill('saved@example.org');
    await emailField.blur();

    // the session storage is empty on the first load, so the button has to switch to enabled
    // on the same page load once the player reports the changed state
    await expect(page.getByTestId('reset-unit-state')).toBeEnabled();
});

test('resetting the saved unit state clears the answers', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');
    await player.locator('#next-page').click();
    const emailField = player.locator('input[name="email-field"]');
    await emailField.fill('reset@example.org');
    await emailField.blur();

    const stateEntry = page.locator('[data-testid="emit-entry"][data-emit="stateChanged"]');
    await expect(stateEntry.first()).toContainText('reset@example.org');

    await page.getByTestId('reset-unit-state').click();
    await page.waitForLoadState();

    await player.locator('#next-page').click();
    await expect(emailField).toHaveValue('');
});

test('ignores Verona messages that do not come from its own player', async ({ page }) => {
    await page.goto('/');

    const player = page.frameLocator('iframe.verona-frame');
    await expect(player.locator('#sample-unit-badge')).toHaveText('Sample Unit');

    // stands in for another player on the page, e.g. one of a second VeronaDisplay
    await page.evaluate(() => {
        window.postMessage(
            { type: 'vopUnitNavigationRequestedNotification', sessionId: 'foreign', target: 'end' },
            '*'
        );
    });

    // the foreign message is dispatched before the player's, so once that one is logged the
    // foreign one would have been logged as well
    await player.locator('#next-unit').click();

    const entries = page.locator('[data-testid="emit-entry"][data-emit="navigationRequested"]');
    await expect(entries.first()).toContainText('next');
    await expect(entries).toHaveCount(1);
});
