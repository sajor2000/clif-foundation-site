// t: when each hospital's results start back. Uneven on purpose: each
// hospital runs the analysis on its own schedule.
const SITES = [
  { id: "A", t: 0.34 },
  { id: "B", t: 0.45 },
  { id: "C", t: 0.38 },
  { id: "D", t: 0.52 },
  { id: "E", t: 0.41 },
] as const;

/**
 * Scroll-driven federated-research figure, in three beats on the pinned act's
 * `--sc-p`: the analysis package goes out to each hospital (0.08–0.30), each
 * hospital's aggregate result comes back (0.34–0.68), the aggregate lights
 * (0.68–0.80), then the finished figure holds.
 */
export function FederationLattice() {
  return (
    <div className="fed" aria-label="Federated research: patient data stays at each hospital">
      <div className="fed__analysis" data-sc-cue="0.06 1 0.22 0">
        <span className="fed__analysis-label">Shared analysis package</span>
        <span className="fed__analysis-detail">sent to each hospital · runs there</span>
      </div>

      <div className="fed__sites">
        {SITES.map((site, i) => (
          <div
            key={site.id}
            className="fed__site"
            style={{
              ["--site-i" as string]: String(i),
              ["--site-t" as string]: String(site.t),
            }}
          >
            <div className="fed__card">
              <div className="fed__card-head">
                <span>
                  <span className="fed__card-word">Hospital </span>
                  {site.id}
                </span>
                <span className="fed__dot" aria-hidden>
                  ●
                </span>
              </div>
              <p className="fed__card-body">
                Health records → CLIF
                <br />
                Analysis runs locally
              </p>
            </div>

            <div className="fed__arrow" aria-hidden>
              <span className="fed__arrow-line" />
              <span className="fed__arrow-head" />
            </div>
          </div>
        ))}
      </div>

      {/* Arrives with the last result, then holds for the rest of the pin. */}
      <div className="fed__aggregate" data-sc-cue="0.62 1 0.1 0">
        <span className="fed__aggregate-lead">Aggregate results only</span>
        <span className="fed__aggregate-trail">
          No patient-level data leaves a hospital
        </span>
      </div>
    </div>
  );
}
