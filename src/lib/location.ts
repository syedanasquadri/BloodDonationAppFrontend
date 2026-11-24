import * as Location from "expo-location";

export type LocationResult = {
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
};

/**
 * Requests foreground location permission, retrieves GPS coordinates
 * (checking fast cached position first, then active fix with timeout),
 * and reverse-geocodes street address, city, and state.
 * Returns null gracefully if permission is denied or location is unavailable.
 */
export async function getCurrentLocationWithAddress(): Promise<LocationResult | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    // 1. Try last known position first (returns instantly on emulators and devices)
    let location = await Location.getLastKnownPositionAsync().catch(() => null);

    // 2. If no cached position, request current position with a 6-second timeout
    if (!location) {
      location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 6000),
        ),
      ]);
    }

    if (!location) {
      return null;
    }

    const { latitude, longitude } = location.coords;

    let address: string | null = null;
    let city: string | null = null;
    let state: string | null = null;

    try {
      const addresses = await Promise.race([
        Location.reverseGeocodeAsync({
          latitude,
          longitude,
        }),
        new Promise<Location.LocationGeocodedAddress[]>((resolve) =>
          setTimeout(() => resolve([]), 4000),
        ),
      ]);

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        city = addr.city || addr.subregion || addr.district || null;
        state = addr.region || null;

        // Construct detailed street/area address from reverse geocode components
        let streetLine = "";
        if (addr.street) {
          streetLine = addr.streetNumber
            ? `${addr.streetNumber} ${addr.street}`
            : addr.street;
          if (
            addr.name &&
            addr.name !== addr.street &&
            addr.name !== addr.streetNumber &&
            !streetLine.includes(addr.name)
          ) {
            streetLine = `${addr.name}, ${streetLine}`;
          }
        } else if (addr.name) {
          streetLine = addr.name;
        }

        const addressParts = [
          streetLine,
          addr.district && addr.district !== addr.city && !streetLine.includes(addr.district)
            ? addr.district
            : null,
          addr.subregion &&
          addr.subregion !== addr.city &&
          addr.subregion !== addr.district &&
          !streetLine.includes(addr.subregion)
            ? addr.subregion
            : null,
          addr.postalCode ? addr.postalCode : null,
        ].filter(Boolean);

        address = addressParts.join(", ") || addr.formattedAddress || null;
      }
    } catch (geocodeError) {
      console.warn("Reverse geocode failed:", geocodeError);
    }

    // Fallback: If reverse geocode didn't produce an address or city, try OpenStreetMap Nominatim
    if (!address || !city) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "BloodDonationApp/1.0",
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            const nom = data.address;
            if (!city) {
              city =
                nom.city ||
                nom.town ||
                nom.village ||
                nom.suburb ||
                nom.county ||
                null;
            }
            if (!state) {
              state = nom.state || null;
            }
            if (!address) {
              const road = nom.road || "";
              const houseNumber = nom.house_number || "";
              const streetLine = houseNumber
                ? `${houseNumber} ${road}`.trim()
                : road;

              const parts = [
                streetLine,
                nom.neighbourhood && nom.neighbourhood !== streetLine
                  ? nom.neighbourhood
                  : null,
                nom.suburb && nom.suburb !== city && nom.suburb !== streetLine
                  ? nom.suburb
                  : null,
                nom.postcode || null,
              ].filter(Boolean);

              address = parts.join(", ") || data.display_name || null;
            }
          }
        }
      } catch (fallbackError) {
        console.warn("Nominatim reverse geocode fallback failed:", fallbackError);
      }
    }

    return {
      latitude,
      longitude,
      address,
      city,
      state,
    };
  } catch (error) {
    console.warn("Error getting current location:", error);
    return null;
  }
}
