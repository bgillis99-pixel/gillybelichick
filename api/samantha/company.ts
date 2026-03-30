export const config = {
  maxDuration: 15,
};

const FMCSA_API_KEY = process.env.FMCSA_API_KEY || '';
const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services';

async function searchByDOT(dotNumber: string) {
  const url = `${FMCSA_BASE}/carriers/${dotNumber}?webKey=${FMCSA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.carrier;
}

async function searchByName(name: string) {
  const url = `${FMCSA_BASE}/carriers/name/${encodeURIComponent(name)}?webKey=${FMCSA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.carrier;
}

function formatCarrier(carrier: any) {
  if (!carrier) return null;

  // Handle array results (name search)
  const c = Array.isArray(carrier) ? carrier[0] : carrier;
  if (!c) return null;

  return {
    name: c.legalName || c.dbaName || 'Unknown',
    dotNumber: c.dotNumber?.toString() || null,
    mcNumber: c.mcNumber?.toString() || null,
    address: [c.phyStreet, c.phyCity, c.phyState, c.phyZipcode]
      .filter(Boolean)
      .join(', ') || null,
    phone: c.telephone || null,
    vehicles: c.totalPowerUnits ? parseInt(c.totalPowerUnits) : null,
    safetyRating: c.safetyRating || c.ratingDate ? (c.safetyRating || 'Not Rated') : null,
    drivers: c.totalDrivers ? parseInt(c.totalDrivers) : null,
    status: c.carrierOperation?.carrierOperationDesc || c.statusCode || null,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { params } = req.body;
    const query = params?.query?.trim();

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check if API key is configured
    if (!FMCSA_API_KEY) {
      // Return a helpful message when FMCSA API key isn't set
      return res.status(200).json({
        company: null,
        message: 'FMCSA API key not configured. Set FMCSA_API_KEY in environment variables to enable company lookups. You can get a free API key at https://mobile.fmcsa.dot.gov/QCDevsite/docs/qcApi',
      });
    }

    let carrier = null;

    // If it looks like a DOT number (all digits), search by DOT
    if (/^\d+$/.test(query)) {
      carrier = await searchByDOT(query);
    } else {
      // Search by name
      carrier = await searchByName(query);
    }

    const company = formatCarrier(carrier);

    if (!company) {
      return res.status(200).json({
        company: null,
        message: `No carrier found for "${query}". Try a different name or DOT number.`,
      });
    }

    return res.status(200).json({ company });
  } catch (error: any) {
    console.error('Company lookup error:', error);
    return res.status(500).json({
      error: 'Failed to look up company',
      details: error.message,
    });
  }
}
