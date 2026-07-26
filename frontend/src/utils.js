import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

// Real GPS location leta hai — Android app (Capacitor) ke andar native
// GPS use karta hai (accurate), web browser me fallback normal HTML5 API
// use karta hai.
//
// Zaroori: GPS ka pehla reading kabhi-kabhi turant aa jaata hai lekin
// network/WiFi-based hota hai (kam accurate — kai km tak off ho sakta
// hai). Isliye hum thodi der (max ~12 sec) "watch" karte hain aur jaise
// hi ek achhi-accuracy (<= 30m) reading milti hai, wahi use karte hain —
// bilkul Blinkit/Zepto ki tarah jo "location fetch ho rahi hai" dikhate
// hain jab tak sahi fix na mil jaaye.
export async function getCurrentLocation() {
  if (Capacitor.isNativePlatform()) {
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== "granted") {
      const req = await Geolocation.requestPermissions();
      if (req.location !== "granted") {
        throw new Error("Location permission denied");
      }
    }

    return new Promise((resolve, reject) => {
      let bestReading = null;
      let settled = false;
      let watchId = null;

      const finish = async (result, error) => {
        if (settled) return;
        settled = true;
        clearTimeout(maxWaitTimer);
        if (watchId != null) {
          try {
            await Geolocation.clearWatch({ id: watchId });
          } catch {
            /* ignore */
          }
        }
        if (result) resolve(result);
        else reject(error);
      };

      // Max 12 second tak best reading ka wait karo, uske baad jo bhi
      // best mila usi se aage badho (bilkul stuck na ho)
      const maxWaitTimer = setTimeout(() => {
        if (bestReading) {
          finish({ lat: bestReading.latitude, lng: bestReading.longitude });
        } else {
          finish(null, new Error("Location fix nahi mil paaya, dubara try karo"));
        }
      }, 12000);

      Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
        (position, err) => {
          if (err || !position) return;
          const { latitude, longitude, accuracy } = position.coords;

          if (!bestReading || accuracy < bestReading.accuracy) {
            bestReading = { latitude, longitude, accuracy };
          }

          // 30 meter ya usse behtar accuracy mile to turant use karo
          if (accuracy <= 30) {
            finish({ lat: latitude, lng: longitude });
          }
        }
      ).then((id) => {
        watchId = id;
      });
    });
  }

  // 👇 Web browser ke andar (jaise localhost pe testing) — normal fallback
  // Note: laptop/PC me GPS chip nahi hoti, isliye browser sirf WiFi-based
  // location deta hai jo kai km tak off ho sakta hai — ye laptop ki
  // hardware limitation hai, code ka issue nahi. Asli test hamesha phone
  // ki APK pe hi sahi rahega.
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Coordinates se readable address nikalta hai (reverse geocoding)
export async function getAddressFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || "Location mil gayi";
  } catch {
    return "Address nahi mil paya";
  }
}