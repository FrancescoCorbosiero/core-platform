import { resend } from './client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@tereso.it'

export async function sendConfirmAccountEmail(to: string, confirmUrl: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Conferma il tuo account Tereso',
    html: `
      <h1>Benvenuto su Tereso!</h1>
      <p>Grazie per esserti registrato. Per confermare il tuo account, clicca sul link qui sotto:</p>
      <p><a href="${confirmUrl}">Conferma il tuo account</a></p>
      <p>Se non hai creato un account, puoi ignorare questa email.</p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send confirm account email: ${error.message}`)
  }
}

export async function sendTrialExpiringEmail(to: string, daysLeft: number) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Il tuo periodo di prova scade tra ${daysLeft} giorni`,
    html: `
      <h1>Il tuo periodo di prova sta per scadere</h1>
      <p>Mancano solo <strong>${daysLeft} giorni</strong> alla scadenza del tuo periodo di prova su Tereso.</p>
      <p>Per continuare ad accedere a tutti i contenuti, scegli un piano di abbonamento prima della scadenza.</p>
      <p><a href="https://tereso.it/pricing">Scegli un piano</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send trial expiring email: ${error.message}`)
  }
}

export async function sendTrialExpiredEmail(to: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Il tuo periodo di prova è scaduto',
    html: `
      <h1>Il tuo periodo di prova è scaduto</h1>
      <p>Il tuo periodo di prova su Tereso è terminato.</p>
      <p>Per continuare ad accedere ai contenuti, sottoscrivi un abbonamento.</p>
      <p><a href="https://tereso.it/pricing">Visualizza i piani</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send trial expired email: ${error.message}`)
  }
}

export async function sendSubscriptionConfirmedEmail(to: string, planName: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Abbonamento confermato',
    html: `
      <h1>Abbonamento confermato!</h1>
      <p>Il tuo abbonamento al piano <strong>${planName}</strong> su Tereso è stato attivato con successo.</p>
      <p>Ora puoi accedere a tutti i contenuti inclusi nel tuo piano.</p>
      <p><a href="https://tereso.it/dashboard">Vai alla dashboard</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send subscription confirmed email: ${error.message}`)
  }
}

export async function sendPaymentFailedEmail(to: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Pagamento non riuscito',
    html: `
      <h1>Pagamento non riuscito</h1>
      <p>Non siamo riusciti a elaborare il pagamento per il tuo abbonamento Tereso.</p>
      <p>Per favore, aggiorna il tuo metodo di pagamento per evitare l'interruzione del servizio.</p>
      <p><a href="https://tereso.it/account/billing">Aggiorna il metodo di pagamento</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send payment failed email: ${error.message}`)
  }
}

export async function sendRenewalReminderEmail(to: string, renewalDate: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Promemoria di rinnovo abbonamento',
    html: `
      <h1>Il tuo abbonamento si rinnoverà presto</h1>
      <p>Il tuo abbonamento annuale su Tereso si rinnoverà il <strong>${renewalDate}</strong>.</p>
      <p>Se desideri apportare modifiche al tuo piano, puoi farlo dalla tua area personale.</p>
      <p><a href="https://tereso.it/account/billing">Gestisci abbonamento</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send renewal reminder email: ${error.message}`)
  }
}

export async function sendSubscriptionCancelledEmail(to: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Abbonamento cancellato',
    html: `
      <h1>Abbonamento cancellato</h1>
      <p>Il tuo abbonamento su Tereso è stato cancellato.</p>
      <p>Ci dispiace vederti andare. Puoi riattivare il tuo abbonamento in qualsiasi momento.</p>
      <p><a href="https://tereso.it/pricing">Riattiva abbonamento</a></p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send subscription cancelled email: ${error.message}`)
  }
}

export async function sendB2BMagicLinkEmail(to: string, magicLinkUrl: string) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Il tuo link di accesso Tereso',
    html: `
      <h1>Accedi a Tereso</h1>
      <p>Clicca sul link qui sotto per accedere alla piattaforma Tereso:</p>
      <p><a href="${magicLinkUrl}">Accedi ora</a></p>
      <p>Questo link è valido per un singolo utilizzo e scadrà tra 15 minuti.</p>
      <p>Se non hai richiesto questo link, puoi ignorare questa email.</p>
    `,
  })

  if (error) {
    throw new Error(`Failed to send B2B magic link email: ${error.message}`)
  }
}
