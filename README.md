# ZVV Zwart - Wit | Futsal Lotings & Rouleer App

Een moderne, interactieve en mobielvriendelijke webapplicatie om teams te loten en rouleerschema's te genereren voor ons zaalvoetbalteam. 

## ⚽ Over de App

Deze applicatie is speciaal ontworpen om snel en eerlijk teams in te delen voor onze wekelijkse zaalvoetbalwedstrijden tussen **Team WIT** en **Team ZWART**. 

### Belangrijkste functionaliteiten:
*   **Spelerselectie (12 van 17)**: Vink eenvoudig aan welke 12 spelers van de vaste spelerslijst aanwezig zijn.
*   **Dynamische Tellers & Validatie**: De app controleert direct of er exact 2 keepers en 10 veldspelers zijn geselecteerd voordat er geloot kan worden.
*   **Flexibele Rollen**: Klik op de rol-badge (Speler/Keeper) van een speler om deze live aan te passen (handig als een veldspeler moet keepen of vice versa).
*   **Willekeurige Loting**: De spelers worden at random verdeeld (1 keeper + 5 spelers per team) met een Fisher-Yates shuffle.
*   **Automatisch Rouleerschema**: Omdat er per team 1 reserve is, berekent de app direct een eerlijk wisselrooster (om de 5 minuten) zodat iedereen evenveel speeltijd krijgt.
*   **Thema Wisselaar**: Schakel eenvoudig tussen een premium Donkere modus (standaard) en een heldere Lichte modus. De voorkeur wordt onthouden!
*   **Lokale Opslag**: Je selectie en eventuele rolwijzigingen worden in de browser opgeslagen, zodat je volgende week direct verder kunt.

---

## 🚀 Live Demo & Hostingsinstructies

Deze app heeft geen database of server nodig en kan direct gratis online gehost worden via **GitHub Pages**:

1.  Upload deze bestanden naar een GitHub repository.
2.  Ga in de repository naar **Settings** -> **Pages**.
3.  Kies bij *Branch* voor **`main`** en klik op **Save**.
4.  De app is direct live op `https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`!

---

## 🛠️ Technische Details

*   **Frontend**: HTML5, Vanilla CSS3 (met CSS variabelen en `@keyframes` animaties), en Vanilla JS.
*   **Geluidseffecten**: Synthetisch gegenereerde audio via de browser Web Audio API (geen externe audiobestanden nodig).
*   **Confetti-effect**: Volledig op maat gemaakt canvas confetti-systeem.
*   **Geen afhankelijkheden**: Geen npm installaties, builds of bundlers nodig. Werkt ook lokaal door dubbel te klikken op `index.html`.

---
*Ontworpen en ontwikkeld voor ZVV Zwart - Wit.*
