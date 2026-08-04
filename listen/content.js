/* =============================================================
   LISTEN  .  editorial content
   -------------------------------------------------------------
   Jeffrey edits THIS file. Nothing here is fetched from the
   registry. The recording data (artist, title, cover art,
   streaming links, certification date, verify link) comes live
   from the public CEP registry. This file holds only the words:
   the collection essay and the per-recording notes, plus the
   order the recordings appear in.

   HOW TO WRITE A NOTE
   . Fill the empty strings below. Multi-line is fine as long as
     you keep the backticks ( `...` ). Leave a field empty to
     hide that section on the page.
   . House rule: no em dashes. Use periods, commas, or restructure.
   . Certification applies to the RECORDING, never to the artist
     or the label. Keep every note about the recording itself.
   . These notes are yours. The build only supplies the frame.
   ============================================================= */
window.LISTEN_CONTENT = {

  collection: {
    // Title shown on /listen/collection. Empty falls back to a plain title.
    title: "",

    // One or two plain lines under the "Listen" heading on /listen.
    // Empty falls back to a factual line built from the CEP claim.
    intro: "",

    // The opening essay for the founding collection. You write this.
    // While it is empty, /listen/collection shows a marked placeholder.
    essay: ``
  },

  // Order the recordings appear on /listen and /listen/collection.
  // Any certified recording not listed here is appended after these,
  // in registry order, so a new certification never silently drops.
  // CEP-000001 is placed last on purpose. See its disclosure below.
  order: [
    "CEP-000005", "CEP-000006", "CEP-000007", "CEP-000008", "CEP-000009", "CEP-000010",
    "CEP-000002", "CEP-000003",
    "CEP-000001"
  ],

  // Per-recording notes. Every field is an empty slot for you to fill.
  //   listen_for : the "what to listen for" note (the differentiator)
  //   story      : how the recording was made
  //   personnel  : who played what (one line is fine)
  //   recorded   : where and when it was recorded
  //   preserved  : what the artist chose to keep rather than correct
  //   support_url: optional direct link to support the artist. If empty,
  //                the page falls back to the artist website or a platform.
  records: {

    // Caroline in the Garden . "Mine" (Act Two)
    "CEP-000005": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Caroline in the Garden . "Tick" (Act Two)
    "CEP-000006": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Caroline in the Garden . "Push Through" (Act Two)
    "CEP-000007": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Caroline in the Garden . "Seconds" (Act Two)
    "CEP-000008": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Caroline in the Garden . "Late Bloomer" (Act Two)
    "CEP-000009": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Caroline in the Garden . "The Dentist's Chair" (Act Two)
    "CEP-000010": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Camilo y los Cruzers . "Descarga Rockeada"
    "CEP-000002": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Camilo y los Cruzers . "Severance Mambo"
    // Note: this recording currently has no streaming links in the
    // registry, so its page shows the cover and the verify link only
    // until links are added to the registry.
    "CEP-000003": { listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "" },

    // Sgt. Splendor, Kate Vargas, & Eric McFadden . "A Chorus Of Cowardly Men"
    "CEP-000001": {
      listen_for: ``, story: ``, personnel: "", recorded: "", preserved: ``, support_url: "",

      // DRAFT disclosure . Jeffrey to approve or reword before launch.
      // Shown as a callout on this recording's page and beside it in the
      // collection. Written to state plainly that the conflict was handled
      // by having an independent reviewer, not the founder, do the analysis.
      // It does not name the venture; name it here if you prefer.
      disclosure: `The founder of the Musical Form Institute has an affiliation with this recording through a separate production venture. To avoid a conflict of interest, the CEP review of this recording was carried out by an independent analyst, not by the founder, and certification followed only from the published CEP standard. No recording receives preferential treatment.`
    }

  }
};
