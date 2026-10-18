/**
 * Annual COI status: only current directors are eligible, and each is matched
 * by email, so departed members or officers who filed never make the year look
 * complete.
 */
export function coiCompletion(
  directorEmails: ReadonlySet<string>,
  disclosureEmails: ReadonlyArray<string>,
) {
  const filed = new Set(disclosureEmails.map((e) => e.toLowerCase()));
  const missing = [...directorEmails].filter((e) => !filed.has(e)).sort();
  const eligible = directorEmails.size;
  const submitted = eligible - missing.length;
  return { submitted, eligible, missing, complete: eligible > 0 && missing.length === 0 };
}

/** The Form 990 the board reviews this year covers the prior calendar year. */
export function form990TaxYear(now: Date): number {
  return now.getUTCFullYear() - 1;
}
