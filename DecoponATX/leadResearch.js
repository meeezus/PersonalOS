const Exa = require('exa-js').default;
const fs = require('fs');

/**
 * DecoponATX Lead Research Tool v2
 * 
 * Find Austin-based companies via content signals, then enrich in Apollo.io
 * Enhanced with stronger location filtering and CSV export
 */

// Domains to exclude (news sites, job boards, aggregators)
const EXCLUDE_DOMAINS = [
  // News & Media
  'bizjournals.com', 'culturemap.com', 'siliconhillsnews.com', 'qz.com',
  'forbes.com', 'techcrunch.com', 'statesman.com', 'axios.com',
  'austinmonitor.com', 'news.ycombinator.com', 'medium.com',
  // Job boards & company databases
  'builtinaustin.com', 'builtin.com', 'indeed.com', 'glassdoor.com',
  'crunchbase.com', 'hiretechladies.com', 'themuse.com', 'ziprecruiter.com',
  // ATS & HR platforms
  'lever.co', 'greenhouse.io', 'workable.com', 'linkedin.com', 'ashbyhq.com',
  // Generic platforms
  'yelp.com', 'facebook.com', 'instagram.com', 'twitter.com', 'eventbrite.com',
];

// Location keywords to validate Austin-based companies
const AUSTIN_SIGNALS = [
  'austin', 'atx', 'texas', 'tx', '78701', '78702', '78703', '78704', '78705',
  'downtown austin', 'east austin', 'south congress', 'domain', 'mueller',
];

// Search configurations - all queries include strong Austin location signals
const SEARCHES = {
  // === CORPORATE TEAM EVENTS (Primary Revenue) ===
  wellness: {
    query: '"Austin, TX" OR "Austin, Texas" tech company employee wellness program team culture office',
    rationale: 'Already investing in employee experiences',
    category: 'Corporate',
  },
  teamBuilding: {
    query: '"Austin, TX" company team building activities offsite retreat corporate event',
    rationale: 'Proven team event buyers',
    category: 'Corporate',
  },
  creativeCulture: {
    query: '"Austin, TX" startup creative culture fun workplace team activities company',
    rationale: 'Values unique experiences over generic options',
    category: 'Corporate',
  },
  hrTeams: {
    query: '"Austin, TX" tech company people operations HR team culture employee experience',
    rationale: 'Decision makers for team events',
    category: 'Corporate',
  },
  q1Kickoffs: {
    query: '"Austin, TX" company team kickoff 2025 planning offsite annual meeting',
    rationale: 'Q1 peak season opportunity',
    category: 'Corporate',
  },

  // === FEMALE-LED / AESTHETIC-ALIGNED ===
  femaleFounders: {
    query: '"Austin, TX" startup founded by woman CEO female founder tech company',
    rationale: 'Natural aesthetic alignment with decoden',
    category: 'Female-Led',
  },
  womenInTech: {
    query: '"Austin, TX" women in tech company female leadership team about us',
    rationale: 'Likely to appreciate creative team activities',
    category: 'Female-Led',
  },

  // === INDUSTRY VERTICALS ===
  healthTech: {
    query: '"Austin, TX" health tech healthcare startup company team about us',
    rationale: 'Often wellness-focused culture',
    category: 'Industry',
  },
  fintech: {
    query: '"Austin, TX" fintech financial technology company startup team culture',
    rationale: 'Well-funded, team event budgets',
    category: 'Industry',
  },
  ecommerce: {
    query: '"Austin, TX" ecommerce retail tech brand company headquarters team',
    rationale: 'Aesthetic-aware brands',
    category: 'Industry',
  },

  // === GROWTH SIGNALS ===
  recentFunding: {
    query: '"Austin, TX" startup raised funding series A B seed 2024 company team',
    rationale: 'Fresh capital = team celebration budget',
    category: 'Growth',
  },
  hiring: {
    query: '"Austin, TX" tech company hiring growing team join us careers office',
    rationale: 'Growing teams need bonding events',
    category: 'Growth',
  },
};

const CONFIG = {
  numResults: 15,        // Get more results to filter
  outputJson: 'leads.json',
  outputCsv: 'leads_for_apollo.csv',
};

async function search(key) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    console.error('❌ Set EXA_API_KEY environment variable');
    console.error('   export EXA_API_KEY=your-key-here');
    process.exit(1);
  }

  const s = SEARCHES[key];
  if (!s) {
    console.error(`❌ Unknown search key: ${key}`);
    list();
    process.exit(1);
  }

  console.log(`\n🍊 DecoponATX Lead Research v2\n`);
  console.log(`� Category: ${s.category}`);
  console.log(`�🔍 Query: ${s.query}`);
  console.log(`💡 Why: ${s.rationale}\n`);

  const exa = new Exa(apiKey);

  try {
    const results = await exa.searchAndContents(s.query, {
      numResults: CONFIG.numResults,
      type: 'auto',
      excludeDomains: EXCLUDE_DOMAINS,
      text: { maxCharacters: 500, includeHtmlTags: false },
    });

    if (!results.results?.length) {
      console.log('⚠️ No results found. Try a different search key.');
      return;
    }

    // Process and validate results
    const leads = results.results
      .map((r, i) => ({
        id: i + 1,
        company: extractName(r),
        domain: getDomain(r.url),
        url: r.url,
        description: cleanText(r.text),
        hasAustinSignal: checkAustinSignal(r),
        searchKey: key,
        category: s.category,
      }))
      .filter(l => l.domain && !l.domain.includes('/')); // Filter out malformed URLs

    // Separate Austin-confirmed vs unconfirmed
    const austinConfirmed = leads.filter(l => l.hasAustinSignal);
    const unconfirmed = leads.filter(l => !l.hasAustinSignal);

    // Save JSON
    fs.writeFileSync(CONFIG.outputJson, JSON.stringify(leads, null, 2));

    // Save CSV for easy Apollo lookup
    const csvHeader = 'Company,Domain,Category,Austin Confirmed,URL\n';
    const csvRows = leads.map(l =>
      `"${l.company}","${l.domain}","${l.category}","${l.hasAustinSignal ? 'Yes' : 'Verify'}","${l.url}"`
    ).join('\n');
    fs.writeFileSync(CONFIG.outputCsv, csvHeader + csvRows);

    // Output
    console.log('─'.repeat(65));
    console.log('📍 AUSTIN CONFIRMED (ready for Apollo):');
    console.log('─'.repeat(65));
    if (austinConfirmed.length) {
      austinConfirmed.forEach(l =>
        console.log(`  ✅ ${l.company.substring(0, 28).padEnd(30)} ${l.domain}`)
      );
    } else {
      console.log('  (none confirmed - check results manually)');
    }

    if (unconfirmed.length) {
      console.log('\n⚠️  VERIFY LOCATION (may not be Austin-based):');
      console.log('─'.repeat(65));
      unconfirmed.forEach(l =>
        console.log(`  ❓ ${l.company.substring(0, 28).padEnd(30)} ${l.domain}`)
      );
    }

    console.log('\n' + '─'.repeat(65));
    console.log(`📁 Saved: ${CONFIG.outputJson} (full data)`);
    console.log(`📁 Saved: ${CONFIG.outputCsv} (for Apollo import)`);
    console.log('─'.repeat(65));
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Open Apollo.io → People Search');
    console.log('   2. Filter by Company Domain (use domains above)');
    console.log('   3. Filter by Location: Austin, TX');
    console.log('   4. Filter by Title: HR, People Ops, Office Manager, Chief of Staff');
    console.log('   5. Export contacts to your Lead Tracker\n');

  } catch (err) {
    console.error('❌ Search failed:', err.message);
    if (err.message.includes('401')) {
      console.error('   Check your EXA_API_KEY is valid');
    }
  }
}

async function searchAll() {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    console.error('❌ Set EXA_API_KEY');
    process.exit(1);
  }

  console.log(`\n🍊 DecoponATX Lead Research v2 - FULL SCAN\n`);
  console.log('Running all search categories...\n');

  const exa = new Exa(apiKey);
  const allLeads = [];
  const seenDomains = new Set();

  for (const [key, s] of Object.entries(SEARCHES)) {
    console.log(`🔍 ${key}...`);

    try {
      const results = await exa.searchAndContents(s.query, {
        numResults: 10,
        type: 'auto',
        excludeDomains: EXCLUDE_DOMAINS,
        text: { maxCharacters: 500, includeHtmlTags: false },
      });

      if (results.results?.length) {
        for (const r of results.results) {
          const domain = getDomain(r.url);
          if (!seenDomains.has(domain) && domain && !domain.includes('/')) {
            seenDomains.add(domain);
            allLeads.push({
              company: extractName(r),
              domain,
              url: r.url,
              description: cleanText(r.text),
              hasAustinSignal: checkAustinSignal(r),
              searchKey: key,
              category: s.category,
            });
          }
        }
      }

      // Rate limit friendly
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.log(`   ⚠️ ${key} failed: ${err.message}`);
    }
  }

  // Sort: Austin confirmed first
  allLeads.sort((a, b) => (b.hasAustinSignal ? 1 : 0) - (a.hasAustinSignal ? 1 : 0));

  // Save
  fs.writeFileSync(CONFIG.outputJson, JSON.stringify(allLeads, null, 2));

  const csvHeader = 'Company,Domain,Category,Austin Confirmed,URL\n';
  const csvRows = allLeads.map(l =>
    `"${l.company}","${l.domain}","${l.category}","${l.hasAustinSignal ? 'Yes' : 'Verify'}","${l.url}"`
  ).join('\n');
  fs.writeFileSync(CONFIG.outputCsv, csvHeader + csvRows);

  // Output
  console.log('\n' + '═'.repeat(65));
  console.log(`📊 FOUND ${allLeads.length} UNIQUE COMPANIES`);
  console.log('═'.repeat(65));

  const confirmed = allLeads.filter(l => l.hasAustinSignal);
  const unconfirmed = allLeads.filter(l => !l.hasAustinSignal);

  console.log(`\n✅ Austin Confirmed: ${confirmed.length}`);
  confirmed.slice(0, 15).forEach(l =>
    console.log(`   ${l.company.substring(0, 28).padEnd(30)} ${l.domain}`)
  );
  if (confirmed.length > 15) console.log(`   ... and ${confirmed.length - 15} more`);

  console.log(`\n❓ Verify Location: ${unconfirmed.length}`);
  unconfirmed.slice(0, 10).forEach(l =>
    console.log(`   ${l.company.substring(0, 28).padEnd(30)} ${l.domain}`)
  );
  if (unconfirmed.length > 10) console.log(`   ... and ${unconfirmed.length - 10} more`);

  console.log('\n' + '─'.repeat(65));
  console.log(`📁 Full results: ${CONFIG.outputJson}`);
  console.log(`📁 Apollo CSV: ${CONFIG.outputCsv}`);
  console.log('─'.repeat(65) + '\n');
}

function list() {
  console.log('\n🍊 DecoponATX Lead Research v2\n');
  console.log('AVAILABLE SEARCHES:\n');

  const categories = {};
  Object.entries(SEARCHES).forEach(([k, v]) => {
    if (!categories[v.category]) categories[v.category] = [];
    categories[v.category].push({ key: k, ...v });
  });

  Object.entries(categories).forEach(([cat, searches]) => {
    console.log(`  📁 ${cat}`);
    searches.forEach(s => {
      console.log(`     ${s.key.padEnd(18)} → ${s.rationale}`);
    });
    console.log();
  });

  console.log('USAGE:\n');
  console.log('  node leadResearch.js <search-key>    Run single search');
  console.log('  node leadResearch.js --all           Run ALL searches');
  console.log('  node leadResearch.js --list          Show this help\n');
}

function extractName(r) {
  if (r.title) {
    let n = r.title
      .split('|')[0]
      .split(' - ')[0]
      .split('–')[0]
      .split('::')[0]
      .replace(/About\s*(Us)?|Home|Team|Careers?|Jobs?|Contact/gi, '')
      .replace(/[®™©]/g, '')
      .trim();
    if (n.length > 2 && n.length < 60) return n;
  }
  return getDomain(r.url).replace(/\.(com|io|co|tech|health|ai)$/i, '');
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .substring(0, 200)
    .trim();
}

function checkAustinSignal(result) {
  const text = [
    result.title || '',
    result.text || '',
    result.url || '',
  ].join(' ').toLowerCase();

  return AUSTIN_SIGNALS.some(signal => text.includes(signal));
}

// CLI
const arg = process.argv[2];
if (!arg || arg === '--list' || arg === '-l') {
  list();
} else if (arg === '--all' || arg === '-a') {
  searchAll();
} else {
  search(arg);
}
