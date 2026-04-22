const hasKeyword = (text, keywords) =>
  keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))

const knowledgeBase = [
  {
    id: 'R001',
    category: 'Termination Without Notice',
    severity: 'high',
    keywords: ['terminate', 'termination', 'end contract', 'dismiss'],
    condition: (clause) =>
      hasKeyword(clause, ['terminate', 'termination', 'dismiss']) &&
      !hasKeyword(clause, ['notice', 'days', 'weeks', 'months']),
    explanation:
      'A termination clause was found with no notice period. The contract can be ended without any warning.',
    recommendation:
      'Negotiate a minimum 30-day written notice period before termination takes effect.'
  },
  {
    id: 'R002',
    category: 'Non-Compete Restriction',
    severity: 'high',
    keywords: ['non-compete', 'non compete', 'competing business', 'competitor'],
    condition: (clause) =>
      hasKeyword(clause, ['non-compete', 'non compete', 'competing business', 'competitor']),
    explanation:
      'A non-compete clause was detected. You may be restricted from working in the same industry or for competing companies after leaving.',
    recommendation:
      'Check the geographic scope and duration carefully. Non-competes longer than 12 months or with broad geographic scope are often unenforceable.'
  },
  {
    id: 'R003',
    category: 'IP Ownership Assignment',
    severity: 'high',
    keywords: ['intellectual property', 'invention', 'work product', 'created by employee'],
    condition: (clause) =>
      hasKeyword(clause, ['intellectual property', 'work product', 'invention', 'created during']) &&
      hasKeyword(clause, ['owned by', 'belongs to', 'assigned to', 'property of']),
    explanation:
      'An IP assignment clause was detected. Any work you create - potentially including personal projects made outside working hours - may be owned by the employer.',
    recommendation:
      "Request a carve-out for inventions developed outside of work hours using personal resources, with no relation to the company's business."
  },
  {
    id: 'R004',
    category: 'Unilateral Modification',
    severity: 'high',
    keywords: ['reserves the right', 'may change', 'sole discretion', 'modify at any time'],
    condition: (clause) =>
      hasKeyword(clause, ['reserves the right', 'may change', 'sole discretion', 'modify at any time', 'amend at its discretion']),
    explanation:
      'One party can unilaterally modify the terms of this agreement without your consent.',
    recommendation:
      'Push for a clause requiring mutual written agreement signed by both parties before any modification takes effect.'
  },
  {
    id: 'R005',
    category: 'Penalty / Liquidated Damages',
    severity: 'medium',
    keywords: ['penalty', 'liquidated damages', 'forfeit', 'deduction', 'breach of contract'],
    condition: (clause) =>
      hasKeyword(clause, ['penalty', 'liquidated damages', 'forfeit', 'financial penalty']),
    explanation:
      'A penalty clause was found. You may owe a fixed sum of money if you breach certain conditions, regardless of actual harm caused.',
    recommendation:
      'Ensure the penalty amount is proportionate to the actual damage. Courts may void grossly excessive penalty clauses.'
  },
  {
    id: 'R006',
    category: 'Mandatory Arbitration',
    severity: 'medium',
    keywords: ['arbitration', 'binding arbitration', 'waive right to sue', 'dispute resolution'],
    condition: (clause) =>
      hasKeyword(clause, ['arbitration', 'binding arbitration', 'waive right to sue', 'arbitrator']),
    explanation:
      'A mandatory arbitration clause was detected. You may be waiving your right to pursue legal action in a court of law.',
    recommendation:
      'Check whether arbitration is binding, whether you waive the right to a class-action suit, and who bears the arbitration costs.'
  },
  {
    id: 'R007',
    category: 'Auto-Renewal Clause',
    severity: 'medium',
    keywords: ['automatically renew', 'auto-renewal', 'auto renewal', 'unless cancelled'],
    condition: (clause) =>
      hasKeyword(clause, ['automatically renew', 'auto-renewal', 'auto renewal', 'automatically extended', 'unless cancelled']),
    explanation:
      'This contract will automatically renew unless you actively cancel it by a specific deadline.',
    recommendation:
      'Note the cancellation deadline in your calendar. Ensure the notice period required to cancel is reasonable (ideally 30 days or less).'
  },
  {
    id: 'R008',
    category: 'Unlimited Liability',
    severity: 'high',
    keywords: ['unlimited liability', 'fully liable', 'solely responsible', 'all damages'],
    condition: (clause) =>
      hasKeyword(clause, ['unlimited liability', 'fully liable', 'solely responsible for all', 'all losses and damages']),
    explanation:
      'This clause may expose you to unlimited financial liability with no cap on damages.',
    recommendation:
      'Negotiate a liability cap, typically equal to the total contract value or a fixed reasonable amount.'
  },
  {
    id: 'R009',
    category: 'Confidentiality (Overbroad)',
    severity: 'medium',
    keywords: ['confidential', 'non-disclosure', 'proprietary information', 'trade secret'],
    condition: (clause) =>
      hasKeyword(clause, ['confidential', 'non-disclosure', 'proprietary']) &&
      !hasKeyword(clause, ['except', 'excluding', 'does not include', 'publicly available']),
    explanation:
      'A confidentiality clause was found with no exceptions. This may prevent you from disclosing information that is already publicly known or that you already knew before signing.',
    recommendation:
      'Ensure the NDA carves out: (a) information already public, (b) information you knew prior to the agreement, (c) information independently developed by you.'
  },
  {
    id: 'R010',
    category: 'No Severance',
    severity: 'medium',
    keywords: ['no severance', 'not entitled to severance', 'no separation pay'],
    condition: (clause) =>
      hasKeyword(clause, ['no severance', 'not entitled to severance', 'no separation pay', 'waive severance']),
    explanation:
      'This clause explicitly removes your entitlement to severance pay upon termination.',
    recommendation:
      'Negotiate a severance formula (e.g., one week per year of service) to be included in writing.'
  },
  {
    id: 'R011',
    category: 'Unilateral Salary Deduction',
    severity: 'high',
    keywords: ['deduct from salary', 'deducted from wages', 'salary deduction', 'withhold payment'],
    condition: (clause) =>
      hasKeyword(clause, ['deduct from salary', 'deducted from wages', 'salary deduction', 'withhold payment', 'recover from salary']),
    explanation:
      'The employer may deduct amounts from your salary without requiring separate authorisation.',
    recommendation:
      'Any salary deduction should require your written consent each time it occurs. Push for this to be stated explicitly.'
  },
  {
    id: 'R012',
    category: 'Choice of Jurisdiction',
    severity: 'low',
    keywords: ['jurisdiction', 'governing law', 'courts of', 'subject to the laws of'],
    condition: (clause) =>
      hasKeyword(clause, ['jurisdiction', 'governing law', 'courts of', 'subject to the laws of']),
    explanation:
      "This clause specifies which country or state's laws govern the contract and where disputes must be resolved.",
    recommendation:
      'Ensure the jurisdiction is convenient for you. If it specifies a foreign jurisdiction, legal action becomes significantly more expensive and complex.'
  },
  {
    id: 'R013',
    category: 'No Ownership of Work After Termination',
    severity: 'medium',
    keywords: ['return all materials', 'delete all copies', 'no right to retain', 'revert to company'],
    condition: (clause) =>
      hasKeyword(clause, ['return all materials', 'delete all copies', 'no right to retain', 'revert to company']),
    explanation:
      'Upon termination you may be required to return or destroy all work materials, losing access to anything you created.',
    recommendation:
      'Ensure you retain copies of work relevant to your personal portfolio under a clearly defined permitted use clause.'
  },
  {
    id: 'R014',
    category: 'Probation Period Clause',
    severity: 'low',
    keywords: ['probation', 'probationary period', 'trial period'],
    condition: (clause) =>
      hasKeyword(clause, ['probation', 'probationary period', 'trial period']) &&
      hasKeyword(clause, ['terminate', 'dismissed', 'end employment']),
    explanation:
      'A probation period clause was found that allows termination with reduced or no notice during the probation window.',
    recommendation:
      'Clarify the exact duration of the probation period and what notice (if any) is required to terminate during it.'
  },
  {
    id: 'R015',
    category: 'Indemnification Clause',
    severity: 'high',
    keywords: ['indemnify', 'indemnification', 'hold harmless', 'defend and indemnify'],
    condition: (clause) =>
      hasKeyword(clause, ['indemnify', 'indemnification', 'hold harmless', 'defend and indemnify']),
    explanation:
      'An indemnification clause requires you to compensate the other party for losses, damages, or legal costs arising from your actions.',
    recommendation:
      'Limit indemnification to losses directly caused by your own gross negligence or willful misconduct - not general errors or third-party claims.'
  },
  {
    id: 'R016',
    category: 'Exclusion of Consequential Damages',
    severity: 'low',
    keywords: ['consequential damages', 'indirect damages', 'loss of profits', 'special damages'],
    condition: (clause) =>
      hasKeyword(clause, ['consequential damages', 'indirect damages', 'loss of profits', 'special damages']) &&
      hasKeyword(clause, ['not liable', 'exclude', 'waive', 'disclaim']),
    explanation:
      'The other party is excluding liability for indirect losses such as lost profits or business opportunities, even if caused by their breach.',
    recommendation:
      'Consider whether this exclusion is fair relative to the risk you are taking on under the agreement.'
  },
  {
    id: 'R017',
    category: 'Non-Solicitation Clause',
    severity: 'medium',
    keywords: ['non-solicitation', 'non solicitation', 'solicit employees', 'solicit clients'],
    condition: (clause) =>
      hasKeyword(clause, ['non-solicitation', 'non solicitation', 'solicit employees', 'solicit clients', 'poach']),
    explanation:
      "A non-solicitation clause was found. You may be prohibited from recruiting the company's employees or approaching their clients after leaving.",
    recommendation:
      'Check the duration. More than 12 months is generally considered excessive. Geographic and role-based limits should also be specified.'
  },
  {
    id: 'R018',
    category: 'Unilateral Assignment of Contract',
    severity: 'medium',
    keywords: ['assign this agreement', 'transfer this agreement', 'assign its rights', 'successor company'],
    condition: (clause) =>
      hasKeyword(clause, ['assign this agreement', 'transfer this agreement', 'assign its rights', 'successor']) &&
      !hasKeyword(clause, ['consent', 'written approval', 'prior approval']),
    explanation:
      'The other party can transfer this contract to a third party (e.g., if the company is acquired) without requiring your consent.',
    recommendation:
      'Add a clause stating that assignment requires your prior written consent, which shall not be unreasonably withheld.'
  },
  {
    id: 'R019',
    category: 'Waiver of Class Action',
    severity: 'high',
    keywords: ['class action', 'class-action', 'waive class', 'individual basis only'],
    condition: (clause) =>
      hasKeyword(clause, ['class action', 'class-action', 'waive class', 'individual basis only']),
    explanation:
      'You are waiving your right to participate in a class-action lawsuit. Disputes must be resolved individually, which increases your cost of seeking legal recourse.',
    recommendation:
      'This waiver is often bundled with mandatory arbitration. Consider negotiating its removal entirely.'
  },
  {
    id: 'R020',
    category: 'Force Majeure (Asymmetric)',
    severity: 'low',
    keywords: ['force majeure', 'act of god', 'circumstances beyond control'],
    condition: (clause) =>
      hasKeyword(clause, ['force majeure', 'act of god', 'circumstances beyond control']) &&
      hasKeyword(clause, ['employer', 'company', 'licensor']) &&
      !hasKeyword(clause, ['employee', 'both parties', 'either party']),
    explanation:
      'A force majeure clause was found that may only protect one party (typically the employer or company), leaving you exposed to obligations even in extraordinary circumstances.',
    recommendation:
      'Ensure the force majeure clause applies symmetrically to both parties.'
  }
]

module.exports = { knowledgeBase, hasKeyword }
