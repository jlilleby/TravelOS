Oppdater Google Maps-eksporten i Travel OS.

Hele reisen eksporteres som JSON med events. Google Maps-rutegeneratoren skal bygge en komplett kjørerute basert på eventenes strukturerte lokasjonsdata.

Implementer følgende:

flight-events skal aldri inkluderes i Google Maps-kjøreruten.
Ikke legg teksten via: foran stedsnavn. Google Maps skal motta rene stedsnavn.
For drive-events skal følgende brukes i denne rekkefølgen:
data.startLocation
alle verdier fra data.viaLocations
data.endLocation
viaLocations kan være separert med semikolon eller linjeskift og må splittes med /[;\n]/.
Trim alle lokasjoner og fjern tomme verdier.
Fjern eventuelle eksisterende via:-prefiks med /^via\s*:/i.
Fjern direkte duplikater mellom slutten av én drive-event og starten av den neste.
Bruk primært drive-events i komplett kjørerute. Ikke inkluder POI-er som allerede finnes som viaLocations.
Sorter events etter:
start_date
start_time
sort_order
Generer:
Google Maps-rute per drive-event
Google Maps-rute per dag
komplett roadtrip-rute basert på alle drive-events
Hvis en rute blir for stor for én Google Maps-lenke, del den automatisk i nummererte segmenter.
Flight-events skal i stedet vises som egne flysegmenter:
SVG → OSL
OSL → KEF
KEF → OSL
OSL → SVG
Vis en forhåndsvisning av alle stopp før Google Maps åpnes, slik at brukeren kan fjerne eller endre feilaktige stopp.

Denne endringen krever ikke nødvendigvis noen databaseendring, fordi nødvendige verdier allerede finnes i events.data_json/data. Dersom implementasjonen foreslår nye databasefelter, skal den også levere nummerert SQL-migrering og rollback-script.


# Travel OS Feature Specification

## Timeline Filters, Saved Views & Focus Modes

### Goal

Implement a flexible filtering system for the Travel OS timeline.

## Features

-   Frontend filtering only
-   Combine multiple filters
-   Event type filtering
-   Date filtering
-   Search
-   Saved Views
-   Focus Modes
-   URL synchronization
-   Mobile support
-   SQL migration for saved_views
-   Rollback script

## Quick Filters

-   All
-   Transport
-   Accommodation
-   Photo
-   Roadtrip
-   Eclipse
-   Food

## Focus Modes

-   Photo
-   Driving
-   Travel Day
-   Camping
-   Eclipse

## Database Migration

``` sql
CREATE TABLE saved_views (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  trip_id CHAR(36),
  name VARCHAR(100) NOT NULL,
  view_type VARCHAR(50) DEFAULT 'timeline',
  filter_json JSON NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS saved_views;
```

## Acceptance Criteria

-   Multi-filter support
-   Saved Views
-   Focus Modes
-   URL sync
-   Multi-day event support
-   Responsive UI
-   SQL migration included