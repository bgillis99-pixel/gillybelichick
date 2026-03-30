export const config = {
  maxDuration: 15,
};

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const MAPS_BASE = 'https://maps.googleapis.com/maps/api';

async function getDirections(origin: string, destination: string) {
  const url = `${MAPS_BASE}/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    return { error: `No route found from "${origin}" to "${destination}"` };
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    origin: leg.start_address,
    destination: leg.end_address,
    distance: leg.distance.text,
    duration: leg.duration.text,
    steps: leg.steps?.slice(0, 5).map((s: any) =>
      s.html_instructions.replace(/<[^>]*>/g, '')
    ),
    mapUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
  };
}

async function findPlaces(query: string, location?: string) {
  let url = `${MAPS_BASE}/place/textsearch/json?query=${encodeURIComponent(query)}&key=${MAPS_API_KEY}`;
  if (location) {
    // Geocode the location first to get lat/lng
    const geoUrl = `${MAPS_BASE}/geocode/json?address=${encodeURIComponent(location)}&key=${MAPS_API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    if (geoData.results?.[0]) {
      const { lat, lng } = geoData.results[0].geometry.location;
      url += `&location=${lat},${lng}&radius=50000`;
    }
  }

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    return { places: [], message: `No results for "${query}"` };
  }

  return {
    places: data.results.slice(0, 5).map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      placeType: place.types?.[0]?.replace(/_/g, ' ') || null,
      mapUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    })),
  };
}

async function geocode(address: string) {
  const url = `${MAPS_BASE}/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    return { error: `Could not find "${address}"` };
  }

  const result = data.results[0];
  return {
    address: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.formatted_address)}`,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (!MAPS_API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured. Enable the Maps, Directions, Places, and Geocoding APIs in Google Cloud Console (free tier: $200/month credit).' });
    }

    if (action === 'get_directions') {
      const result = await getDirections(params.origin, params.destination);
      return res.status(200).json(result);
    }

    if (action === 'find_places') {
      const result = await findPlaces(params.query, params.near);
      return res.status(200).json(result);
    }

    if (action === 'geocode') {
      const result = await geocode(params.address);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Maps API error:', error);
    return res.status(500).json({ error: 'Maps API error', details: error.message });
  }
}
