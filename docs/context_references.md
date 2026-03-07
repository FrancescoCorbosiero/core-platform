# Architettura Core — Piattaforma E-Learning (Educazione Finanziaria)

> Documento vivente. Aggiornato progressivamente durante il brainstorming.

---

## 1. IDENTITÀ DEL PRODOTTO

Piattaforma web di educazione finanziaria con:
- Modello di accesso ad abbonamento (Free / Base / Pro)
- Contenuti brevi ("pillole") + tool Excel + guide PDF
- Doppio canale: **B2C** (self-service, Stripe) e **B2B** (contratto aziendale, bonifico)
- Un unico super-admin operativo: **Tereso**

---

## 2. UTENTI E RUOLI

| Ruolo | Canale | Note |
|-------|--------|------|
| Utente B2C | Self-service | Trial 3gg → Free/Base/Pro |
| Utente B2B | Attivato da Tereso | Dipendente aziendale |
| Tereso (super admin) | Back office | Gestisce tutto: contenuti, piani, coupon, aziende |
| HR aziendale | — | Nessun potere di configurazione sul catalogo |

---

## 3. MODELLO DI ACCESSO AI CONTENUTI

| Contenuto | Trial (3gg) | Free | Base | Pro |
|-----------|-------------|------|------|-----|
| Pillole (video) | 120/120 | 15/120 | 40/120 | 120/120 |
| Tool (Excel) | 20/20 * | 2/20 | 6/20 | 20/20 |
| Guide (PDF) | 20/20 * | 4/20 | 10/20 | 20/20 |
| Quiz | Tutti | Solo free | Su sbloccati | Tutti |
| Eventi live | ✗ | ✗ | ✗ | ✓ |
| Attestati/Certificati | ✗ | ✗ | ✗ | ✓ |
| Download materiali | ✗ | ✗ | ✓ | ✓ |

*solo consultazione online, no download

**Regole:** selezione fissa per piano, nessun prerequisito, accesso globale,
a scadenza contenuti bloccati e storico in read-only.

---

## 4. PRICING E SUBSCRIPTION (B2C)

| Piano | Mensile | Annuale |
|-------|---------|---------|
| Free | — | — |
| Base | 1,99 €/mese | 19,99 €/anno |
| Pro | 3,99 €/mese | 39,99 €/anno |

**Ciclo di vita:**
- Rinnovo automatico (Stripe)
- Upgrade: immediato, `proration_behavior: 'always_invoice'` per tutte le combinazioni mensile/annuale
- Downgrade: differito a fine periodo (`cancel_at_period_end`)
- Cancellazione: accesso fino a scadenza, nessun rimborso
- Pagamento fallito → blocco immediato su `invoice.payment_failed`
- Notifica rinnovo: email 15gg prima su `invoice.upcoming` (solo annuali)

**Trial B2C:**
- 3 giorni, accesso Pro (escluso: download, live, attestati)
- No carta richiesta (`payment_method_collection: if_required`)
- Un solo trial per email
- Scadenza → popup con CTA "Passa a Base" / "Passa a Pro", poi downgrade a Free
- Progressi conservati in read-only

**Coupon:**
- Sconto % o valore fisso
- Configurabili: scadenza, max utilizzi, limite per utente
- Non cumulabili, solo Tereso li crea
- Nessun coupon che regala accesso gratuito

---

## 5. MODELLO B2B

| Aspetto | Dettaglio |
|---------|-----------|
| Billing | Bonifico bancario — fuori da Stripe |
| Contratto | Pacchetto N licenze per azienda, prezzo negoziato |
| Attivazione | Tereso carica CSV email dipendenti → magic link automatico |
| Auth | Magic link: sistema riconosce email B2B da tabella `companies`, assegna `company_id` |
| Trial | Non disponibile |
| Catalogo | Personalizzato per azienda da Tereso |
| Sessioni 1:1 | Gratuite se incluse nel contratto, altrimenti come B2C |
| Contatore sessioni | Visibile solo a Tereso, decremento manuale nel back office |

**Struttura dati (semplice, no multi-tenancy enterprise):**
- `companies` — anagrafica azienda + date contratto
- `company_course_access` — mapping azienda → contenuti attivi
- `company_id` sul profilo utente — distingue B2B da B2C

---

## 6. CATALOGO CONTENUTI

### Struttura dati (entità Course presente dal giorno 1)
```
Categoria
  └── Corso (entità nel DB — UI flat al lancio, gerarchia visibile in futuro)
       └── Pillola (video breve)
            └── Quiz associato (opzionale)
       └── Quiz finale (trigger completamento corso)
```

**8 categorie al lancio:**
Budget e pianificazione · Risparmio e investimenti · Pensione · Servizi bancari
· Assicurazioni · Mutui e finanziamenti · Finanza digitale · Fiscalità

**Tipi di contenuto:**
- **Pillole**: titolo, descrizione, thumbnail, durata, rating, categoria
- **Tool**: file Excel scaricabili
- **Guide**: PDF scaricabili
- **Quiz**: scelta multipla, tentativi illimitati, soglia superamento 70%
- **SCORM**: rimandato — tracking nativo più adatto per questo use case

**Versioning contenuti:** nessun `version_id` al lancio — progressi esistenti
restano validi all'aggiornamento di un contenuto. Si aggiunge se emerge necessità concreta.

**Quiz e piani:** ogni utente accede solo ai quiz relativi ai contenuti
del proprio piano. Nessuna logica cross-piano.

---

## 7. TRACKING

**Completamento video:** `currentTime / duration >= 0.9` lato client +
validazione server-side tramite Mux watch time analytics. Nessun heartbeat
complesso al lancio.

**Completamento corso:** 90% pillole completate + quiz finale ≥ 70%.
Trigger automatico generazione certificato (solo Pro e B2B).

---

## 8. GAMIFICATION

**Punti Teresi:**

| Azione | Punti |
|--------|-------|
| Video completato | +10 |
| Quiz superato | +20 |
| Corso completato | +50 |
| Badge sbloccato | +30 |
| Referral | +1000 |
| Recensione | +10 |
| Login giornaliero | +2 (opzionale) |
| Prenotazione 1:1 | +40 (opzionale) |

**Architettura:** punti accreditati in real-time, classifica e badge
ricalcolati in batch giornaliero.

**8 badge di lancio:**
Benvenuto a Bordo · Prima Pillola · Maratoneta · Quiz Master ·
Corso Conquistatore · Social Star · Tool User · Referral Champion

**Classifiche:**
- B2C: globale
- B2B: interna (all time + ultimi 12 mesi) + accesso classifica globale
- Identità: nickname obbligatorio (GDPR)

---

## 9. SESSIONI 1:1

- Individuale: 59 € | Coppia: 69 € | Durata: 50 min | Via: Google Meet
- Prenotazione: **Calendly** al lancio (3-4 coach)
- Cancellazione: fino a 48h prima senza penali; no-show = sessione consumata
- Pagamenti: fuori da Stripe al lancio
- Modulo proprietario: in sviluppo parallelo

---

## 10. EMAIL TRANSAZIONALI

Lista completa (via **Resend**):

| Evento | Email |
|--------|-------|
| Registrazione | Conferma account |
| Trial in scadenza | Avviso giorno prima + CTA upgrade |
| Trial scaduto | Conferma downgrade a Free |
| Acquisto | Conferma abbonamento + ricevuta |
| Pagamento fallito | Avviso blocco accesso |
| Rinnovo annuale | Preavviso 15gg prima |
| Cancellazione | Conferma + data scadenza accesso |
| Attivazione B2B | Magic link dipendente |

---

## 11. STACK TECNICO — DEFINITIVO

| Layer | Tecnologia | Note |
|-------|-----------|------|
| Frontend + API | **Next.js** (App Router) | SSR, API routes, stesso repo |
| CMS + Admin panel | **Payload CMS v3** | Risolve back office Tereso nativamente |
| Database | **PostgreSQL** | Nativo Payload |
| Auth + Access control | **Payload Auth** | Magic link, ruoli, access functions |
| Billing B2C | **Stripe** | Subscription, proration, coupon, webhook |
| Video hosting | **Mux** | Analytics native → tracking 90% semplificato |
| Email transazionale | **Resend** | SDK TypeScript, integrazione Next.js nativa |
| Error tracking | **Sentry** | Error monitoring + session replay |
| Telemetria | **OpenTelemetry** | Standard de facto, integrazione nativa Next.js |
| Deploy | **Vercel** (frontend) + **Railway** (DB/backend) | Zero ops |
| Billing B2B | Fuori stack | Bonifico manuale |

### Stripe — webhook critici
| Webhook | Azione |
|---------|--------|
| `invoice.payment_failed` | Blocco immediato accesso |
| `customer.subscription.trial_will_end` | Downgrade trial → Free |
| `invoice.upcoming` | Email preavviso rinnovo annuale |
| `customer.subscription.updated` | Aggiornamento piano utente |
| `customer.subscription.deleted` | Freeze storico, blocco contenuti |

---

## 12. SEQUENZA DI SVILUPPO

**Fase 1 — Fondamenta** *(senior + Claude Code)*
- Data model completo: users, companies, content, courses, plans, progress, gamification
- Auth B2C (email/password) + Auth B2B (magic link)
- Access control per piano (Payload access functions)
- Integrazione Stripe: prodotti, prezzi, webhook critici
- Configurazione Mux

**Fase 2 — Core verticale** *(primo prodotto testabile)*
- Registrazione → trial → catalogo → player video → tracking → scadenza → upgrade
- Back office Tereso: gestione contenuti, piani, coupon

**Fase 3 — Espansione parallela** *(aggiunta figure)*
- B2B: aziende, catalogo per tenant, dashboard HR
- Gamification: Teresi, badge, classifiche
- Sessioni 1:1: integrazione Calendly
- Certificati PDF, recensioni, notifiche in-app

---

## 13. DECISIONI APERTE RESIDUE

Nessuna decisione architetturale bloccante rimasta aperta.

**Da definire in fase di design UI/UX:**
- Schermata upsell post-trial (popup → flusso pagamento)
- Dashboard HR B2B: layout e filtri
- Profilo coach: card e scheda dettaglio

**Da valutare dopo il lancio:**
- Ricerca full-text avanzata (Algolia) se ricerca base diventa pain point
- SCORM se clienti B2B portano contenuti propri
- Versioning contenuti con `version_id` se emerge necessità
- Automazione eliminazione account inattivi (24 mesi)
