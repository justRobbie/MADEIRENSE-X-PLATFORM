/**
 * Check if geolocation is supported and permission is granted
 * @returns Promise that resolves with permission status
 */
export async function checkLocationPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
        throw new Error('Permissions API not supported');
    }

    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
}

/**
 * Check if request features are supported by the current browser.
 * @returns Boolean
 */
export function checkBrowserFeatureSupport (...features:(keyof (Window & typeof globalThis))[]) {
	let hasSupport = true;

    for (let i=0;i<features.length;i++) {
        if (features[i] in window) continue; 

        else {
			console.error(`"${features[i]}" feature isn't support on this browser`);

			hasSupport = false;

			break;
		};
    };

	return hasSupport;
};