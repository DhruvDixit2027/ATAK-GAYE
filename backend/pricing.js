// Har issue-type ka fixed price (rupees mein)
const PRICING = {
  petrol: 100,
  mechanic: 200,
  tyre: 120,
  battery: 150,
  tow: 300,
};

function getPriceForIssue(issueType) {
  return PRICING[issueType] || 150; // agar koi match na ho, default price
}

module.exports = { PRICING, getPriceForIssue };