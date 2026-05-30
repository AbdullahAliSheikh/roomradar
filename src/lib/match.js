// Simple weighted matching score for room ads vs seeker prefs.
// prefs: { city, maxRent, occupancy, minLength, minWidth, maxFloor }
export function matchScore(ad, prefs) {
  if (!prefs) return null;
  let score = 0;
  let weight = 0;

  // City (40%)
  weight += 40;
  if (prefs.city && ad.city) {
    if (ad.city.toLowerCase().trim() === prefs.city.toLowerCase().trim()) score += 40;
    else if (ad.city.toLowerCase().includes(prefs.city.toLowerCase())) score += 20;
  }

  // Rent (25%)
  weight += 25;
  if (prefs.maxRent && ad.rent_monthly != null) {
    if (Number(ad.rent_monthly) <= Number(prefs.maxRent)) score += 25;
    else {
      const over = (ad.rent_monthly - prefs.maxRent) / prefs.maxRent;
      score += Math.max(0, 25 * (1 - over * 2));
    }
  } else if (!prefs.maxRent) score += 25;

  // Occupancy (15%)
  weight += 15;
  if (prefs.occupancy) {
    if (Number(ad.occupancy) === Number(prefs.occupancy)) score += 15;
    else if (Math.abs(ad.occupancy - prefs.occupancy) === 1) score += 8;
  } else score += 15;

  // Length (8%)
  weight += 8;
  if (prefs.minLength) {
    const l = Number(ad.length_ft);
    if (l >= Number(prefs.minLength)) score += 8;
    else score += Math.max(0, 8 * (l / Number(prefs.minLength)));
  } else score += 8;

  // Width (7%)
  weight += 7;
  if (prefs.minWidth) {
    const w = Number(ad.width_ft);
    if (w >= Number(prefs.minWidth)) score += 7;
    else score += Math.max(0, 7 * (w / Number(prefs.minWidth)));
  } else score += 7;

  // Floor (5%)
  weight += 5;
  if (prefs.maxFloor != null && prefs.maxFloor !== "") {
    if (ad.floor <= Number(prefs.maxFloor)) score += 5;
  } else score += 5;

  return Math.round((score / weight) * 100);
}