/**
 * EMVCo PromptPay QR Code Generator
 * Conforms to Bank of Thailand PromptPay QR specification
 */

function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let c = data.charCodeAt(i);
    crc ^= c << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(tag, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generate EMVCo PromptPay Payload string
 * @param {string} target - Mobile number (08XXXXXXXX) or National ID (13 digits) or Tax ID
 * @param {number|null} amount - Payment amount (THB)
 */
function generatePromptPayPayload(target, amount = null) {
  let sanitizedTarget = target.replace(/[^0-9]/g, '');
  let promptPaySubtag = '';

  // Format mobile number or national ID
  if (sanitizedTarget.length === 10 && sanitizedTarget.startsWith('0')) {
    // Mobile number: international format 0066 + 9 digits
    const formattedMobile = '0066' + sanitizedTarget.slice(1);
    promptPaySubtag = formatTag('01', formattedMobile);
  } else if (sanitizedTarget.length === 13) {
    // National ID / Tax ID
    promptPaySubtag = formatTag('02', sanitizedTarget);
  } else {
    // Default fallback to test mobile
    promptPaySubtag = formatTag('01', '0066891234567');
  }

  const aid = formatTag('00', 'A000000677010111');
  const merchantAccountInfo = aid + promptPaySubtag;

  let payload = '';
  payload += formatTag('00', '01'); // Payload Format Indicator
  payload += formatTag('01', amount ? '12' : '11'); // Point of Initiation: 12 = Dynamic, 11 = Static
  payload += formatTag('29', merchantAccountInfo); // Merchant Account Information (PromptPay)
  payload += formatTag('53', '764'); // Transaction Currency: 764 = THB
  
  if (amount && amount > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    payload += formatTag('54', formattedAmount);
  }

  payload += formatTag('58', 'TH'); // Country Code: TH
  payload += '6304'; // CRC placeholder

  const checksum = crc16(payload);
  return payload + checksum;
}

module.exports = {
  generatePromptPayPayload,
  crc16
};
