export function score(config, assessment) {
  const tally = (items, answers, factors) => items.map(item => {
    const status = answers?.[item.id] ?? '';
    const answered = Object.hasOwn(factors, status);
    return {...item, status: answered ? status : '', awarded: answered ? item.points * factors[status] : 0};
  });
  const technical = tally(config.criteria, assessment.technical, config.technicalFactors);
  const governance = tally(config.governance, assessment.governance, config.governanceFactors);
  const total = items => items.reduce((sum, item) => sum + item.awarded, 0);
  const technicalScore = total(technical), governanceScore = total(governance);
  const overall = technicalScore + governanceScore;
  const answered = [...technical, ...governance].filter(item => item.status).length;
  const count = technical.length + governance.length;
  // Classify the displayed two-decimal score, matching the stated threshold ranges.
  const rounded = Number(overall.toFixed(2));
  const risk = answered === count ? config.thresholds.find(t => rounded >= t.minimum).label : null;
  return {technical, governance, technicalScore, governanceScore, overall, answered, count, risk};
}
export function summarize(config, result) {
  const statuses = [...Object.keys(config.technicalFactors), 'Unanswered'];
  const severities = ['Critical','High','Medium','Low'];
  const count = (items, status) => items.filter(item => (item.status || 'Unanswered') === status).length;
  return {statuses, counts: statuses.map(status => count(result.technical,status)),
    severity: severities.map(severity => ({severity, counts: statuses.map(status => count(result.technical.filter(i => i.severity === severity), status))}))};
}
