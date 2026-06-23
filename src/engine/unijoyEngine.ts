// src/engine/unijoyEngine.ts

export const NORMAL_MAP: Record<string, string> = {
  '1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯','0':'০',
  'q':'ঙ','w':'য','e':'ড','r':'প','t':'ট','y':'চ','u':'জ','i':'হ','o':'গ','p':'ড়',
  'a':'ৃ','s':'ু','d':'ি','f':'া','g':'্','h':'ব','j':'ক','k':'ত','l':'দ',
  'z':'্র','x':'ও','c':'ে','v':'র','b':'ন','n':'স','m':'ম','\\':'ৎ','|':'ঃ'
};

export const SHIFT_MAP: Record<string, string> = {
  '1':'!','2':'@','3':'#','4':'৳','5':'%','6':'^','7':'ঁ','8':'*','9':'(','0':')',
  'Q':'ং','W':'য়','E':'ঢ','R':'ফ','T':'ঠ','Y':'ছ','U':'ঝ','I':'ঞ','O':'ঘ','P':'ঢ়',
  'S':'ূ','D':'ী','F':'অ','G':'।','H':'ভ','J':'খ','K':'থ','L':'ধ',
  'Z':'্য','X':'ৗ','C':'ৈ','V':'ল','B':'ণ','N':'ষ','M':'শ','A':'র্'
};

export const POST_HASHTAG_COMBO: Record<string, string> = {
  '্া': 'আ', '্ি': 'ই', '্ী': 'ঈ', '্ু': 'উ', 'ূ': 'ঊ', 'ৃ': 'ঋ', 'ে': 'এ', 'ৈ': 'ঐ', 'ো': 'ও', 'ৌ': 'ঔ'
};

/**
 * Parses raw English keystrokes and context into perfect Unicode Bangla
 */
export function processUnijoyInput(currentText: string, incomingChar: string, isShift: boolean): string {
  // Handle Backspace externally in React event handler for safety
  let mapped = isShift ? SHIFT_MAP[incomingChar] : NORMAL_MAP[incomingChar];
  
  if (!mapped) {
    return currentText + incomingChar; // Return standard character if no mapping exists (e.g. space)
  }

  // Handle explicit vowel combinations via Hasant (g)
  if (currentText.endsWith('্')) {
    const baseWithHasant = currentText;
    if (mapped === 'া') return baseWithHasant.slice(0, -1) + 'আ';
    if (mapped === 'ি') return baseWithHasant.slice(0, -1) + 'ই';
    if (mapped === 'ী') return baseWithHasant.slice(0, -1) + 'ঈ';
    if (mapped === 'ু') return baseWithHasant.slice(0, -1) + 'উ';
    if (mapped === 'ূ') return baseWithHasant.slice(0, -1) + 'ঊ';
    if (mapped === 'ৃ') return baseWithHasant.slice(0, -1) + 'ঋ';
    if (mapped === 'ে') return baseWithHasant.slice(0, -1) + 'এ';
    if (mapped === 'ৈ') return baseWithHasant.slice(0, -1) + 'ঐ';
    if (mapped === 'ও') return baseWithHasant.slice(0, -1) + 'ঔ';
  }

  return currentText + mapped;
}

/**
 * Advanced Layout Adjuster resolving Pre-base vowels (ি, ে, ৈ) and Reph (র্)
 * Ensures proper cluster transformations prior to Word Token Matching.
 */
export function finalizeBanglaWordTokens(word: string): string {
  let chars = Array.from(word);
  let length = chars.length;

  for (let i = 0; i < length - 1; i++) {
    // Rule A: Shift+A = Reph (র্) handling. Moves Reph after the subsequent consonant/conjunct cluster
    if (chars[i] === 'র্') {
      let targetIndex = i + 1;
      // Skip over clusters joined by Hasant
      while (targetIndex + 1 < length && (chars[targetIndex] === '্' || chars[targetIndex + 1] === '্')) {
        targetIndex++;
      }
      const reph = chars[i];
      chars.splice(i, 1);
      chars.splice(targetIndex, 0, reph);
      word = chars.join('');
      chars = Array.from(word);
      length = chars.length;
    }
  }

  // Rule B: Pre-Base Vowel Signs (ি, ে, ৈ) swapping behavior
  for (let i = 0; i < length - 1; i++) {
    if (chars[i] === 'ি' || chars[i] === 'ে' || chars[i] === 'ৈ') {
      const preVowel = chars[i];
      let targetConsonantIdx = i + 1;
      
      // Lookahead to find standard cluster boundary to latch onto
      while (targetConsonantIdx + 1 < length && chars[targetConsonantIdx + 1] === '্') {
        targetConsonantIdx += 2;
      }
      
      if (targetConsonantIdx < length) {
        chars.splice(i, 1);
        chars.splice(targetConsonantIdx, 0, preVowel);
        word = chars.join('');
        chars = Array.from(word);
        length = chars.length;
      }
    }
  }

  return chars.join('');
             }
