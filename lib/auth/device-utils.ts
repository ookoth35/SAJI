export function getDeviceInfo(): string {
  if (typeof window === "undefined") return "Unknown Device"
  
  const ua = navigator.userAgent
  let deviceName = "Unknown Device"
  
  // Browser and OS detection
  if (ua.includes("Windows")) {
    deviceName = "Windows PC"
    if (ua.includes("Chrome")) deviceName += " (Chrome)"
    else if (ua.includes("Firefox")) deviceName += " (Firefox)"
    else if (ua.includes("Safari")) deviceName += " (Safari)"
    else if (ua.includes("Edge")) deviceName += " (Edge)"
  } else if (ua.includes("Mac")) {
    deviceName = "Mac"
    if (ua.includes("Chrome")) deviceName += " (Chrome)"
    else if (ua.includes("Firefox")) deviceName += " (Firefox)"
    else if (ua.includes("Safari")) deviceName += " (Safari)"
  } else if (ua.includes("iPhone")) {
    deviceName = "iPhone"
    if (ua.includes("Chrome")) deviceName += " (Chrome)"
    else deviceName += " (Safari)"
  } else if (ua.includes("iPad")) {
    deviceName = "iPad"
  } else if (ua.includes("Android")) {
    deviceName = "Android Phone"
    if (ua.includes("Chrome")) deviceName += " (Chrome)"
    else if (ua.includes("Firefox")) deviceName += " (Firefox)"
  } else if (ua.includes("Linux")) {
    deviceName = "Linux"
  }
  
  return deviceName
}

export async function getLocationFromIP(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/")
    const data = await response.json()
    return `${data.city}, ${data.region}, ${data.country_name}`
  } catch (error) {
    console.error("[v0] Failed to get location:", error)
    return "Unknown Location"
  }
}
