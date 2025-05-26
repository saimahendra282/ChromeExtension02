async function extractCGPAFromCurrentPage() {
  await wait(3000);
  let cgpa = null;
  cgpa = extractFromCGPASection();
  if (cgpa) return cgpa;
  cgpa = extractFromTables();
  if (cgpa) return cgpa;
  cgpa = extractFromPageText();
  if (cgpa) return cgpa;
  cgpa = extractFromNumericElements();
  if (cgpa) return cgpa;
  return null;
}

function findCGPALink() {
  const selectors = [
    '#mainlayout_sidenav a',
    '.sidebar a',
    '.navigation a',
    '.menu a',
    'nav a',
    'a[href*="cgpa"]'
  ];
  for (const selector of selectors) {
    const links = document.querySelectorAll(selector);
    for (const link of links) {
      const text = link.textContent.trim().toLowerCase();
      const href = link.getAttribute('href') || '';
      if (text.includes('cgpa') || href.includes('cgpa')) {
        return link;
      }
    }
  }
  return null;
}

function extractFromCGPASection() {
  const selectors = [
    '.exam-student-course-external-total-consolidated-marks-info-index',
    '[class*="cgpa"]',
    '[id*="cgpa"]',
    '.cgpa-section'
  ];
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const cgpa = findCGPAInText(element.textContent);
      if (cgpa) return cgpa;
    }
  }
  return null;
}

function extractFromTables() {
  const tables = document.querySelectorAll('table');
  for (const table of tables) {
    const text = table.textContent.toLowerCase();
    if (text.includes('cgpa')) {
      const cgpa = findCGPAInText(table.textContent);
      if (cgpa) return cgpa;
    }
  }
  return null;
}

function extractFromPageText() {
  const pageText = document.body.textContent;
  return findCGPAInText(pageText);
}

function extractFromNumericElements() {
  const elements = document.querySelectorAll('*');
  for (const element of elements) {
    if (element.children.length === 0) {
      const text = element.textContent.trim();
      if (/\d+\.\d{1,2}/.test(text)) {
        const cgpa = findCGPAInText(element.parentElement.textContent);
        if (cgpa) return cgpa;
      }
    }
  }
  return null;
}

function findCGPAInText(text) {
  const patterns = [
    /cgpa[\s:=]+(\d+\.?\d*)/i,
    /(\d+\.\d{1,2})(?=.*cgpa)/i,
    /cgpa[\s\S]{0,50}?(\d+\.\d{1,2})/i,
    /(\d+\.\d{1,2})[\s\S]{0,50}?cgpa/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 10) {
        return match[1];
      }
    }
  }
  const keywords = ['cgpa'];
  const numberRegex = /\b\d+\.\d{1,2}\b/g;
  let match;
  while ((match = numberRegex.exec(text)) !== null) {
    const num = parseFloat(match[0]);
    if (num >= 0 && num <= 10) {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(text.length, match.index + match[0].length + 100);
      const surrounding = text.slice(start, end).toLowerCase();
      if (keywords.some(keyword => surrounding.includes(keyword))) {
        return match[0];
      }
    }
  }
  return null;
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}