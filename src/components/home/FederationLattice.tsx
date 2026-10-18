const SITES = [
  { id: "A", t: 0.14 },
  { id: "B", t: 0.23 },
  { id: "C", t: 0.32 },
  { id: "D", t: 0.41 },
  { id: "E", t: 0.5 },
] as const;

/** Scroll-driven federated-research figure. Progress from parent act `--sc-p`. */
export function FederationLattice() {
  return (
    <div className="fed" aria-label="Federated research: data stays at each site">
      <div className="fed__analysis" data-sc-cue="0.06 1 0.22 0">
        <span className="fed__analysis-label">Shared analysis package</span>
        <span className="fed__analysis-detail">sent to each site · runs locally</span>
      </div>

      <div className="fed__sites">
        {SITES.map((site) => (
          <div
            key={site.id}
            className="fed__site"
            style={{ ["--site-t" as string]: String(site.t) }}
          >
            <div className="fed__card">
              <div className="fed__card-head">
                <span>Site {site.id}</span>
                <span className="fed__dot" aria-hidden>
                  ●
                </span>
              </div>
              <p className="fed__card-body">
                EHR → CLIF tables
                <br />
                local analysis run
              </p>
            </div>

            <div className="fed__arrow" aria-hidden>
              <span className="fed__arrow-line" />
              <span className="fed__arrow-head" />
            </div>
          </div>
        ))}
      </div>

      {/* Starts by 0.45 so the privacy note stays readable for most of its time on screen. */}
      <div className="fed__aggregate" data-sc-cue="0.45 1 0.28 0">
        <span className="fed__aggregate-lead">Aggregate results only</span>
        <span className="fed__aggregate-trail">
          No patient-level data leaves an institution
        </span>
      </div>
    </div>
  );
}
