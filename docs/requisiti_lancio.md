# Requisiti di Lancio — Sintesi Operativa
> Fonte: Specifica Operativa Tereso v1.0 (2 marzo 2026)
> Sintetizzati per uso dello sviluppatore. Ogni BR è tracciabile al documento originale.

---

## SF-01 · Piani e Abbonamenti

| ID | Requisito | Note |
|----|-----------|------|
| BR1.1 | Tre piani: Free, Base, Pro | Nomi "Intermedio"/"Platino" deprecati |
| BR1.2 | Base: 1,99 €/mese · 19,99 €/anno | |
| BR1.3 | Pro: 3,99 €/mese · 39,99 €/anno | |
| BR1.4 | Free: 15 pillole, 2 tool, 4 guide, quiz solo su contenuti free | |
| BR1.5 | Base: 40 pillole, 6 tool, 10 guide, quiz su contenuti sbloccati | |
| BR1.6 | Pro: tutto, + eventi live, attestati | |
| BR1.7–8 | Selezione fissa per piano, nessun limite mensile | |
| BR1.9 | Rinnovo automatico mensile e annuale | Stripe Subscriptions |
| BR1.10 | Email preavviso 15gg prima per annuali, nessuna per mensili | Webhook invoice.upcoming |
| BR1.11 | Pagamento fallito → blocco immediato, no grace period | Webhook invoice.payment_failed |
| BR1.12 | Storico congelato in read-only a scadenza, ripreso al rinnovo | |
| BR1.13 | Upgrade immediato con proration | proration_behavior: always_invoice |
| BR1.14 | Downgrade differito a fine periodo | cancel_at_period_end |
| BR1.15 | Cancellazione autonoma, no rimborso parziale | |

---

## SF-02 · Trial Gratuito

| ID | Requisito | Note |
|----|-----------|------|
| BR2.1 | Trial automatico alla registrazione B2C | |
| BR2.3 | Durata: 3 giorni | |
| BR2.4 | Accesso Pro completo escluso: download, live, attestati | |
| BR2.5–9 | A scadenza → Free automatico, tutti i progressi conservati in read-only | Webhook trial_will_end |
| BR2.6 | No carta richiesta all'attivazione | payment_method_collection: if_required |
| BR2.7 | Un solo trial per email, nessun controllo device/IP | |
| BR2.8 | Solo B2C, non disponibile per B2B | |

---

## SF-03 · Pagamenti e Fatturazione

| ID | Requisito | Note |
|----|-----------|------|
| BR3.1 | Stripe unico payment processor B2C | |
| BR3.3–4 | Fatture/ricevute PDF scaricabili dall'area personale | |
| BR3.5 | IVA 22% su tutto, solo Italia | |
| BR3.7 | B2C: ricevuta PDF, no SDI | |
| BR3.8–9 | B2B: fattura elettronica SDI + bonifico, fuori da Stripe | |
| BR3.11 | Rimborsi solo per errori tecnici, gestione manuale | |

---

## SF-04 · Coupon

| ID | Requisito | Note |
|----|-----------|------|
| BR4.1–2 | Coupon inseribile in fase di acquisto | |
| BR4.5 | Due tipologie: sconto % e valore fisso | Stripe Coupons |
| BR4.7 | Configurabili: scadenza, max utilizzi totali, limite per utente | |
| BR4.8 | Non cumulabili (max 1 per acquisto) | |
| BR4.9 | Solo Tereso crea coupon, nessun coupon che regala accesso gratuito | |

---

## SF-05 · Accesso Contenuti

| ID | Requisito | Note |
|----|-----------|------|
| BR5.1–2 | Accesso legato ad abbonamento attivo, globale | |
| BR5.3 | Nessun contenuto obbligatorio, nessun percorso forzato | |
| BR5.6–7 | Nessun contatore mensile, selezione fissa illimitata | |
| BR5.9 | B2B: catalogo personalizzato per azienda, solo Tereso gestisce | |
| BR5.12 | SCORM: rimandato. Solo video nativi, PDF, quiz, Excel al lancio | |
| BR5.13 | Nessun prerequisito tra contenuti | |

---

## SF-06 · Catalogo

| ID | Requisito | Note |
|----|-----------|------|
| BR6.1 | Contenuti video = "Pillole" | |
| BR6.3–4 | Pillola: titolo, durata, descrizione, immagine, categoria | |
| BR6.5 | 8 categorie al lancio | Budget, Risparmio, Pensione, Banca, Assicurazioni, Mutui, Finanza digitale, Fiscalità |
| BR6.8 | Tool = Excel scaricabili · Guide = PDF scaricabili | |
| BR6.10 | Card video: thumbnail, titolo, rating stelle, durata | |
| BR6.11 | Blocchi "consigliati" gestiti manualmente da Tereso | |
| BR6.13 | Struttura flat al lancio: Categoria → Pillola | Entità Course nel DB ma UI flat |
| BR6.14 | Ogni pillola in una sola categoria | |
| BR6.17 | Versioning: progressi su v1 restano validi, no version_id al lancio | |

---

## SF-07 · Tracking e Completamento

| ID | Requisito | Note |
|----|-----------|------|
| BR7.1–6 | Tracking: tempo connessione, completamenti, quiz, badge, primo/ultimo accesso | |
| BR7.2 | Video completato: currentTime / duration >= 0.9 | Validato con Mux analytics |
| BR7.11 | Corso completato: 90% pillole + quiz finale >= 70% | |
| BR7.13 | Tracking real-time se low effort, batch accettabile altrimenti | Mux semplifica |
| BR7.14 | Data retention illimitata per account attivi | |

---

## SF-08 · Gamification

| ID | Requisito | Note |
|----|-----------|------|
| BR8.1 | Sistema punti "Teresi" | |
| BR8.2–4 | Classifica con podio top 3 + posizioni 4-10, utente corrente evidenziato | |
| BR8.6 | Badge pubblici e condivisibili (LinkedIn, social) | |
| BR8.9 | Tabella punti: video+10, quiz+20, corso+50, badge+30, referral+1000, recensione+10 | |
| BR8.10 | Teresi solo per ranking, nessun premio reale al lancio | |
| BR8.11 | Teresi non scadono mai | |
| BR8.12 | B2C: classifica globale · B2B: classifica interna + accesso globale | |
| BR8.13–19 | Punti: real-time · Classifica e badge: batch giornaliero | |
| BR8.14 | 8 badge di lancio | Benvenuto, Prima Pillola, Maratoneta, Quiz Master, Corso Conquistatore, Social Star, Tool User, Referral Champion |

---

## SF-09 · Quiz

| ID | Requisito | Note |
|----|-----------|------|
| BR9.1 | Solo scelta multipla al lancio | |
| BR9.2 | Randomizzazione domande e opzioni | |
| BR9.3–11 | Soglia superamento: 70% · Tentativi: illimitati · Nessun timer | |
| BR9.4 | Riepilogo risposte con spiegazione dopo il quiz | |
| BR9.14 | Due tipologie: quiz su singola pillola + quiz cumulativo fine corso | |
| BR9.15 | Quiz finale obbligatorio per completamento ma non blocca accesso alle pillole | |
| BR9.16 | Solo Tereso crea/pubblica quiz (workflow bozza → pubblicazione) | |

---

## SF-10 · Sessioni 1:1

| ID | Requisito | Note |
|----|-----------|------|
| BR10.1–2 | Individuale: 59 € · Coppia: 69 € | |
| BR10.4–5 | Calendly al lancio (3-4 coach) + modulo custom in parallelo | |
| BR10.7–9 | Email automatica post-prenotazione (questionario pre) + post-sessione (feedback) | |
| BR10.14 | Cancellazione/spostamento fino a 48h prima, no-show = sessione consumata | |
| BR10.15–16 | Google Meet, durata fissa 50 min | |
| BR10.20 | Credito senza scadenza se acquistato ma mai prenotato | |

---

## SF-11 · Referral

| ID | Requisito | Note |
|----|-----------|------|
| BR11.1–4 | Funzione "Invita un Amico" con codice personale e link | |
| BR11.3 | 1000 Teresi a chi condivide, accreditati alla registrazione dell'invitato | |
| BR11.6 | Invitato non riceve nulla al lancio | |
| BR11.8–10 | Solo B2C · Campo codice facoltativo in registrazione | |

---

## SF-12 · Certificati

| ID | Requisito | Note |
|----|-----------|------|
| BR12.1–4 | PDF automatico al completamento corso (90% pillole + quiz finale) | Solo Pro e B2B |
| BR12.5 | Contenuto: nome utente, nome corso, data, logo Tereso, dicitura SRL | |
| BR12.7 | Solo valore simbolico, no valore legale | |
| BR12.9 | Solo scaricabile dall'area personale, no invio email | |
| BR12.10 | Nessun QR o codice verifica al lancio | |

---

## SF-13 · B2B Multi-Company

| ID | Requisito | Note |
|----|-----------|------|
| BR13.5–9 | Attivazione manuale da Tereso via CSV email · Magic link ai dipendenti | |
| BR13.7 | Isolamento dati totale tra aziende · Eccezione: classifica globale | |
| BR13.8 | Catalogo personalizzabile per azienda da Tereso | |
| BR13.12 | Un utente = una sola azienda. B2C e B2B richiedono email diverse | |
| BR13.14–15 | Dashboard HR: utenti attivi, minuti visti, corsi completati, ranking, export Excel | |

---

## SF-14 · Gestione Account

| ID | Requisito | Note |
|----|-----------|------|
| BR14.1 | Registrazione B2C autonoma via email | |
| BR14.4 | Dati utente: nome, cognome, indirizzo, cellulare, azienda, email | |
| BR14.6 | Disattivazione ≠ eliminazione · Eliminazione solo su richiesta o dopo 24 mesi inattività | |
| BR14.7–8 | Diritto oblio e portabilità dati: gestione manuale su richiesta | |
| BR14.9 | Cambio email con verifica nuovo indirizzo | |
| BR14.11 | Un account = B2C o B2B, mai entrambi | |

---

## SF-15 · Notifiche

| ID | Requisito | Note |
|----|-----------|------|
| BR15.1–2 | Canali: newsletter, in-app, email · Toggle on/off per utente | |
| BR15.6 | Email solo per eventi rilevanti, non per micro-eventi | |
| BR15.7 | No push mobile al lancio | |
| BR15.8–9 | Newsletter via tool esterno · Solo Tereso invia comunicazioni massive | |
| BR15.10 | Max 1 email/giorno per utente | |

---

## SF-16 · Privacy e GDPR

| ID | Requisito | Note |
|----|-----------|------|
| BR16.1–2 | SSL obbligatorio · GDPR compliance | |
| BR16.3 | Backup settimanali | |
| BR16.9 | Consensi granulari separati in registrazione | privacy, marketing, profilazione, analytics |
| BR16.11 | Data residency EU | |
| BR16.14–15 | Cookie banner "tutto o niente" · Solo cookie tecnici al lancio | |

---

## SF-17 · Recensioni

| ID | Requisito | Note |
|----|-----------|------|
| BR17.1–2 | Valutazioni e commenti per corso · Rating stelle visibile su card | |
| BR17.4 | Recensioni visibili solo a utenti B2C registrati | |
| BR17.5 | Post-moderazione: pubblica subito, admin rimuove se necessario | |
| BR17.6 | Utente può modificare/eliminare proprie recensioni | |
| BR17.8 | "Valuta Tereso" = canale interno separato, non pubblico | |
