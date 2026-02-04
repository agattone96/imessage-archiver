const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') return;

    const appleId = process.env.APPLE_ID;
    const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
    const teamId = process.env.APPLE_TEAM_ID;

    if (!appleId || !appleIdPassword || !teamId) {
        console.log('[notarize] Skipping notarization (missing APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID).');
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    console.log(`[notarize] Notarizing ${appName}...`);
    await notarize({
        appBundleId: 'com.antigravity.imessagearchiver',
        appPath: `${appOutDir}/${appName}.app`,
        appleId,
        appleIdPassword,
        teamId
    });
};
