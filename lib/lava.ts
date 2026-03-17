interface CreateLavaInvoiceInput {
  apiKey: string;
  email: string;
  offerId: string;
  currency: 'RUB' | 'USD' | 'EUR';
}

interface LavaInvoiceResponse {
  id: string;
  paymentUrl: string | null;
  status?: string;
}

export async function createLavaInvoice(input: CreateLavaInvoiceInput): Promise<LavaInvoiceResponse> {
  const response = await fetch('https://gate.lava.top/api/v3/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': input.apiKey,
    },
    body: JSON.stringify({
      email: input.email,
      offerId: input.offerId,
      currency: input.currency,
    }),
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    throw new Error(payload || `Lava API error ${response.status}`);
  }

  const payload = (await response.json()) as LavaInvoiceResponse;
  if (!payload?.id) {
    throw new Error('Lava не вернул id контракта');
  }

  return payload;
}
