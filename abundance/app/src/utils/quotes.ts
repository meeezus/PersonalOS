export interface Quote {
  text: string;
  context: 'doubt' | 'resistance' | 'validation' | 'general';
}

export const quotes: Quote[] = [
  // When doubt shows up
  { text: "Thank you for trying to protect me. I'm doing it anyway.", context: 'doubt' },
  { text: "That was ONE email. I'm sending 89 more. Watch me.", context: 'doubt' },
  { text: "I don't need to believe I can. I just need to act as if.", context: 'doubt' },
  { text: "Hi, little Michael. I see you trying to protect me.", context: 'doubt' },

  // When resistance shows up
  { text: "This discomfort means I'm growing.", context: 'resistance' },
  { text: "The voice gets louder right before the breakthrough.", context: 'resistance' },
  { text: "I'm not avoiding the pain anymore. I'm walking through it.", context: 'resistance' },
  { text: "The warrior walks the path despite fear.", context: 'resistance' },

  // When seeking external validation
  { text: "I don't need permission. I'm giving it to myself.", context: 'validation' },
  { text: "There are no guarantees. I'm willing to find out anyway.", context: 'validation' },
  { text: "My worthiness isn't determined by results. It's inherent.", context: 'validation' },
  { text: "I am already worthy, and I'm curious what happens.", context: 'validation' },

  // General warrior spirit
  { text: "The only way out is through.", context: 'general' },
  { text: "Evidence is built one action at a time.", context: 'general' },
  { text: "I CAN make shit happen.", context: 'general' },
  { text: "This is who I am becoming.", context: 'general' },
  { text: "Action creates identity.", context: 'general' },
  { text: "I'm willing to find out if I can make this happen.", context: 'general' },
];

export const getRandomQuote = (context?: Quote['context']): Quote => {
  const filtered = context ? quotes.filter(q => q.context === context) : quotes;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getQuoteOfTheDay = (): Quote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
};
