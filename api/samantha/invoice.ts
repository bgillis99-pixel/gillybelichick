export const config = {
  maxDuration: 15,
};

// Invoice API -- generates and manages invoices for NorCal CARB Mobile
// Stores invoices in Cloudflare D1 or returns formatted invoice data

const SERVICES: Record<string, { name: string; price: number }> = {
  'hd-obd': { name: 'HD-OBD Testing', price: 75 },
  'smoke-opacity': { name: 'Smoke/Opacity Testing', price: 199 },
  'fleet-opacity': { name: 'Fleet Opacity Testing', price: 149 },
  'rv-motorhome': { name: 'RV/Motorhome Testing', price: 300 },
};

const BIZ = {
  company: 'NorCal CARB Mobile LLC',
  address: 'Northern California',
  phone: '916-890-4427',
  email: 'bryan@norcalcarbmobile.com',
  certId: 'IF530523',
};

function generateInvoiceNumber() {
  const date = new Date();
  const yr = date.getFullYear().toString().slice(-2);
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `NCM-${yr}${mo}-${rand}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'create_invoice') {
      const { customer_name, customer_email, customer_phone, services, notes } = params;

      const lineItems = (services || []).map((s: { type: string; quantity: number }) => {
        const svc = SERVICES[s.type] || { name: s.type, price: 0 };
        return {
          service: svc.name,
          quantity: s.quantity || 1,
          unitPrice: svc.price,
          total: svc.price * (s.quantity || 1),
        };
      });

      const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.total, 0);
      const invoiceNumber = generateInvoiceNumber();

      const invoice = {
        invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        from: BIZ,
        to: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
        },
        lineItems,
        subtotal,
        total: subtotal,
        notes: notes || 'Payment due within 30 days. Thank you for choosing NorCal CARB Mobile.',
        status: 'draft',
      };

      return res.status(200).json({ invoice, message: `Invoice ${invoiceNumber} created for $${subtotal}` });
    }

    if (action === 'get_pricing') {
      return res.status(200).json({
        services: Object.entries(SERVICES).map(([key, svc]) => ({
          id: key,
          name: svc.name,
          price: svc.price,
        })),
        note: 'Fleet discounts available for 5+ vehicles. Call for custom quotes.',
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Invoice API error:', error);
    return res.status(500).json({ error: 'Invoice error', details: error.message });
  }
}
