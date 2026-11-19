# Priprema integracije plaćanja
Status: ugovor sučelja i validacija ulaza; nije aktivan backend ili Stripe integracija. Demo checkout ostaje jasno označena simulacija. Nijedan API ključ nije potreban u ovoj fazi.

## Endpointi za implementaciju
POST /api/checkout: autenticirani korisnik, CSRF zaštita ako se koriste cookie sesije, rate limit; tijelo {programIds, termsVersion, immediateDeliveryAccepted}. Klijent ne šalje cijenu ili userId. Backend validira katalog, već kupljene programe, aktualnu verziju uvjeta i izričit izbor kupca. Kreira pending order i vraća {orderId, checkoutUrl}. Dozvoljene redirect adrese definira server.
GET /api/orders/:id: samo vlasnik ili ovlašteni administrator; vraća pending/paid/failed/refunded i dostupnost sadržaja.
POST /api/webhooks/stripe: sirovo tijelo + provjera potpisa službenim SDK-om; nikada browser token kao dokaz uplate.
GET /api/programs/:id/access: provjera korisnika i entitlementa u bazi prije svakog zaštićenog resursa.

## Model podataka
users; products (server price in euro cents); orders (user_id, status, currency, total, provider_session unique, accepted_terms_version, consent_time); order_items (snapshot price); payment_events (provider,event_id UNIQUE); entitlements (user_id,program_id UNIQUE, status, order_id); progress (user_id,program_id,lesson_id UNIQUE).

## Potvrda plaćanja
Provjeriti paid status, currency i total prema spremljenoj narudžbi. Procesirati samo poznate evente. Upis eventa, promjena statusa i entitlement moraju biti atomski; jedinstvena ograničenja štite i paralelne dostave. Kod privremene greške vratiti grešku za retry. Kod neispravnog potpisa odbiti. Povratak korisnika ne smije sam mijenjati status.

## Obvezni scenariji
Uspjeh, odbijena kartica, zatvoren checkout, naplata bez povratka korisnika, zakašnjeli webhook, dupli i paralelni event, pogrešan potpis, pogrešan iznos/valuta, tuđa narudžba, krivotvoren browser entitlement, već kupljen program, refund i chargeback. Test/live okoline strogo odvojiti. Tajne samo server-side env, nikad VITE_ varijable.

## Što je sada pripremljeno
server/checkout-contract.mjs: čista validacija ID-eva i izračuna iz server kataloga, bez ovisnosti o payment SDK-u. Prije korištenja spojiti endpoint na stvarni identitet i bazu. Ovaj modul sam ne pruža autentikaciju niti obradu webhooka.
