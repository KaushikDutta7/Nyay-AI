export const MOCK_DATA = {
  case_description: 'My client\'s agricultural land was acquired by the State for highway construction. The compensation offered is far below market value and no individual notice was served under Section 9(3).',
  judge_name: 'Justice S.R. Bhat',
  precedents: [
    {
      id: '1',
      title: 'Indore Development Authority v. Manoharlal',
      court: 'Supreme Court of India',
      year: '2020',
      principle: 'Land acquisition proceedings do not lapse under Section 24(2) of the RFCTLARR Act if the State has taken possession or deposited compensation. Compensation must reflect true market value at the date of Section 4 notification. The Constitution Bench overruled the Pune Municipal Corporation ruling that had led to widespread lapses.',
      citations: 312,
      url: 'https://indiankanoon.org/doc/17091506/',
    },
    {
      id: '2',
      title: 'State of Maharashtra v. Bharat Shanti Lal Shah',
      court: 'Supreme Court of India',
      year: '2008',
      principle: 'The right to fair compensation under land acquisition must be determined with reference to market value at the date of Section 4 notification, not the date of award. The State cannot deprive citizens of reasonable compensation without due process under Article 300A of the Constitution.',
      citations: 47,
      url: 'https://indiankanoon.org/doc/1640857/',
    },
    {
      id: '3',
      title: 'Kolkata Municipal Corporation v. Bimal Kumar Shah',
      court: 'Supreme Court of India',
      year: '1993',
      principle: 'When land is acquired for public purpose, the Collector must ensure that solatium and interest are paid before physical possession is taken. Acquisition without payment of full statutory dues is liable to be quashed on writ. Non-service of individual notice goes to root of jurisdiction.',
      citations: 88,
      url: 'https://indiankanoon.org/doc/345621/',
    },
    {
      id: '4',
      title: 'Srinivasa Co-operative House Building Society v. State of Karnataka',
      court: 'Karnataka High Court',
      year: '2015',
      principle: 'Delay in payment of compensation under the Land Acquisition Act entitles the petitioner to interest at 12% per annum from the date of taking possession. Solatium must be 30% of market value as mandated by Section 23(2) of the Act.',
      citations: 19,
      url: 'https://indiankanoon.org/doc/89234502/',
    },
    {
      id: '5',
      title: 'Hari Singh v. State of Haryana',
      court: 'Punjab & Haryana High Court',
      year: '2018',
      principle: 'Where the State acquires agricultural land without proper Section 4 notification and individual notice under Section 9(3), the entire acquisition is void ab initio. The landowner is entitled to restoration of possession and damages for unlawful dispossession.',
      citations: 23,
      url: 'https://indiankanoon.org/doc/56712301/',
    },
    {
      id: '6',
      title: 'Pune Municipal Corporation v. Harakchand Misirimal Solanki',
      court: 'Supreme Court of India',
      year: '2014',
      principle: 'Acquisition proceedings under the Land Acquisition Act lapse if the award is not made within two years under Section 11A. Urgency provisions under Section 17 override this limitation in cases of exceptional public interest, but adequate compensation must still be determined.',
      citations: 156,
      url: 'https://indiankanoon.org/doc/74523401/',
    },
  ],
  argument: `FACTS OF THE CASE:
The petitioner is the registered owner of approximately 2.4 acres of agricultural land situated in Survey No. 142, Village Ambegaon, Taluka Haveli, District Pune, Maharashtra. The Respondent-State issued a notification under Section 4(1) of the Land Acquisition Act, 1894 on 14th March 2019, for the purposes of widening of State Highway No. 27. The petitioner was neither served individual notice under Section 9(3) nor was the objection hearing under Section 5A conducted in accordance with the mandate of law. The Collector passed an Award on 22nd January 2021, offering compensation at Rs. 12,50,000 per acre, which is grossly inadequate compared to the prevailing market value of Rs. 45,00,000 per acre as evidenced by contemporaneous sale deeds registered in the same locality.

LEGAL ISSUES INVOLVED:
1. Whether the acquisition proceedings are vitiated due to non-compliance with mandatory procedural requirements under Sections 4, 5A, and 9 of the Land Acquisition Act, 1894?
2. Whether the compensation awarded by the Collector constitutes just and fair compensation within the meaning of Article 300A of the Constitution of India?
3. Whether the petitioner is entitled to enhanced compensation including solatium at 30% and interest at 12% per annum from the date of possession?

RELEVANT PRECEDENTS:
The following judicial precedents directly apply to the present case:

(i) Indore Development Authority v. Manoharlal (Supreme Court, 2020): The Constitution Bench reaffirmed that compensation must reflect true market value at the date of Section 4 notification. The Respondent-State cannot rely on circle rates which invariably understate actual market value.

(ii) State of Maharashtra v. Bharat Shanti Lal Shah (Supreme Court, 2008): The right to fair compensation must be computed with reference to bona fide sale instances of comparable land in the same locality. Deprivation without adequate compensation violates Article 300A.

(iii) Kolkata Municipal Corporation v. Bimal Kumar Shah (Supreme Court, 1993): Non-service of individual notice under Section 9(3) goes to the root of the Collector's jurisdiction and renders the award void ab initio.

LEGAL ARGUMENT:
It is respectfully submitted that the acquisition proceedings stand vitiated on multiple grounds. First, the petitioner was never served an individual notice under Section 9(3) of the Land Acquisition Act, which is mandatory and goes to the root of the Collector's jurisdiction. The absence of such notice renders the award null and void in law, as consistently affirmed by this Hon'ble Court.

Second, the compensation offered at Rs. 12,50,000 per acre is shockingly inadequate. Sale deed evidence from the same locality, executed contemporaneously with the Section 4 notification, discloses market values ranging from Rs. 42,00,000 to Rs. 48,00,000 per acre. This Hon'ble Court has unequivocally held that compensation must be derived from bona fide sale instances of similar land in the vicinity, not from artificial circle rates maintained by revenue authorities.

Third, the petitioner is entitled to solatium of 30% on the market value as mandated under Section 23(2), along with additional market value at 12% per annum under Section 23(1A) from the date of Section 4 notification to the date of award, and thereafter interest at 9% per annum under Section 34. These statutory entitlements are non-negotiable and cannot be negated by administrative convenience.

PRAYER:
It is most respectfully prayed that this Hon'ble Court may be pleased to:

(a) Issue a Writ of Certiorari quashing and setting aside the Award dated 22nd January 2021, to the extent it determines the market value at Rs. 12,50,000 per acre;

(b) Direct the Respondent-State to pay enhanced compensation computed at Rs. 45,00,000 per acre, together with solatium of 30%, additional market value at 12% per annum from 14th March 2019 to 22nd January 2021, and interest at 9% per annum thereafter;

(c) Pass such other and further orders as this Hon'ble Court may deem fit and proper.

And for this act of kindness the petitioner shall ever pray.`,
  outcome: {
    success_rate: 74,
    verdict: 'Favourable',
    successful_arguments: [
      'Establish market value through contemporaneous registered sale deeds of comparable agricultural land in the same taluka',
      'Challenge procedural infirmity — non-service of Section 9(3) individual notice goes to root of Collector\'s jurisdiction',
      'Invoke Article 300A constitutional protection and cite Supreme Court precedents on just and fair compensation',
    ],
    failed_arguments: [
      'Challenging the public purpose itself — courts consistently defer to State determination under Section 4',
      'Seeking restoration of land post-possession — courts award enhanced compensation rather than order restoration',
    ],
    risk: 'Risk is moderate — the State may contest market value evidence; the strength of registered sale deed comparisons is decisive.',
    similar_cases: 1847,
    won: 1367,
  },
  judge_profile: {
    name: 'Justice S.R. Bhat',
    court: 'Supreme Court of India',
    favour_rate: 68,
    temperament: 'Evidence-focused and constitutionally rigorous',
    tips: [
      'File a well-indexed brief three days before the hearing. Justice Bhat reads briefs in advance and expects counsel to be conversant with the full record before oral arguments begin.',
      'Lead with the constitutional angle — Article 300A and the right to property resonate strongly. Open with the constitutional provision before turning to statutory arguments.',
      'Keep oral submissions under 20 minutes. Identify your two strongest arguments and lead with them. Do not repeat what is already in your written submissions.',
    ],
    landmark: 'Navtej Singh Johar v. Union of India (2018) — Section 377 IPC reading down (Concurring opinion)',
  },
};

export const AGENT_STEPS = [
  {
    key: 'precedent',
    number: '01',
    label: 'Precedent Hunter',
    description: 'Semantic search over 50,000+ Indian court judgements',
    steps: [
      'Connecting to vector database...',
      'Encoding case description with sentence-transformers...',
      'Searching 50,000+ Indian court judgements...',
      'Ranking by semantic similarity...',
    ],
    doneText: 'Found 6 highly relevant precedents across Supreme Court and High Courts',
  },
  {
    key: 'argument',
    number: '02',
    label: 'Argument Drafter',
    description: 'Drafts formal legal argument citing retrieved precedents',
    steps: [
      'Analysing retrieved precedents...',
      'Identifying applicable legal principles...',
      'Composing formal argument in 5-section structure...',
      'Citing judgements with precise names and courts...',
    ],
    doneText: 'Formal legal argument drafted — Facts, Legal Issue, Precedents, Argument, Prayer',
  },
  {
    key: 'outcome',
    number: '03',
    label: 'Outcome Predictor',
    description: 'Predicts success probability from similar case patterns',
    steps: [
      'Pattern matching against similar Indian cases...',
      'Calculating petitioner success probability...',
      'Identifying winning vs failing argument patterns...',
      'Generating risk assessment...',
    ],
    doneText: 'Prediction complete — 74% success probability, Favourable verdict',
  },
  {
    key: 'judge',
    number: '04',
    label: 'Judge Profiler',
    description: 'Profiles the bench from judicial history',
    steps: [
      'Searching judicial history in vector database...',
      'Analysing ruling patterns and temperament...',
      'Computing petitioner favour rate...',
      'Generating advocacy tips...',
    ],
    doneText: 'Profile ready — rules in favour 68% of time, evidence-focused temperament',
  },
];
