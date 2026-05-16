// POST /api/subscribe
// Footer newsletter form -> Brevo double opt-in (DOI).
// The Brevo API key stays server-side via Vercel env vars and is never exposed in the page.
//
// Required Vercel environment variables (Production):
//   BREVO_API_KEY          Brevo API key (secret)
//   BREVO_LIST_ID          numeric ID of the NEW-signups list (not the legacy migration list)
//   BREVO_DOI_TEMPLATE_ID  numeric ID of the Double Opt-In confirmation email template in Brevo
//
// Brevo DOI endpoint reference:
//   POST https://api.brevo.com/v3/contacts/doubleOptinConfirmation
//   headers: api-key, Content-Type: application/json
//   body: { email, templateId, includeListIds:[..], redirectionUrl }
//   success: HTTP 201, empty body. The DOI template must already exist in the account.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body || {};
  const email = String(body.email_address || body.email || '').trim().toLowerCase();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.redirect(302, '/thanks?e=invalid');
  }

  const API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = parseInt(process.env.BREVO_LIST_ID, 10);
  const TEMPLATE_ID = parseInt(process.env.BREVO_DOI_TEMPLATE_ID, 10);

  if (!API_KEY || !LIST_ID || !TEMPLATE_ID) {
    console.error('subscribe: missing Brevo env config (BREVO_API_KEY / BREVO_LIST_ID / BREVO_DOI_TEMPLATE_ID)');
    return res.redirect(302, '/thanks?e=config');
  }

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        email,
        templateId: TEMPLATE_ID,
        includeListIds: [LIST_ID],
        redirectionUrl: 'https://musicalform.org/thanks',
      }),
    });

    if (r.status === 201 || r.ok) {
      return res.redirect(302, '/thanks');
    }

    // Non-201: most commonly an already-existing/confirmed contact. Log it, but do not
    // show the visitor an error wall. Parity with the prior Kit redirect behavior.
    const detail = await r.text().catch(() => '');
    console.error('subscribe: Brevo non-201', r.status, detail);
    return res.redirect(302, '/thanks');
  } catch (err) {
    console.error('subscribe: exception', err);
    return res.redirect(302, '/thanks?e=server');
  }
}
