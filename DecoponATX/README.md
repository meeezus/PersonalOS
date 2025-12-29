# Austin Tech Lead Research Tool

A Node.js tool that uses the [Exa API](https://exa.ai) to find Austin tech companies and export structured lead data to JSON.

## Quick Start

```bash
# Set your API key
export EXA_API_KEY="your-api-key"

# Run the search
npm run search
```

## Features

- **Smart search** using Exa's semantic search with content retrieval
- **Rich data extraction** including title, URL, description, highlights, and dates
- **Intelligent company name parsing** from page titles
- **Clean JSON output** ready for CRM import or further processing
- **Helpful error messages** for common issues (auth, rate limits, network)

## Output Format

Results are saved to `leads.json`:

```json
{
  "id": 1,
  "companyName": "Example Tech",
  "websiteUrl": "https://example.com/about",
  "domain": "example.com",
  "description": "Full text description from the page...",
  "highlights": ["Key sentence from the content"],
  "publishedDate": "2024-01-15",
  "author": null
}
```

## Requirements

- Node.js 14+
- Exa API key ([get one here](https://exa.ai))

## Installation

```bash
npm install
```

## Usage

```bash
# Using npm script
npm run search

# Or directly with node (requires sourcing nvm first)
source ~/.nvm/nvm.sh && node leadResearch.js
```

## Configuration

Edit the `CONFIG` object in `leadResearch.js` to customize:

```javascript
const CONFIG = {
  searchQuery: 'Austin Texas tech startup HR manager people operations',
  numResults: 10,
  outputFile: 'leads.json',
};
```
