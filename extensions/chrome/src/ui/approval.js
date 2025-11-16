// Approval UI script
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const origin = urlParams.get('origin');
  const type = urlParams.get('type');
  const payload = urlParams.get('payload');

  // Update UI with request details
  document.getElementById('origin').textContent = origin || 'Unknown';
  document.getElementById('request-type').textContent = formatRequestType(type);

  // Show warning for sensitive operations
  if (['SIGN_MESSAGE', 'SIGN_TRANSACTION', 'SIGN_ALL_TRANSACTIONS'].includes(type)) {
    document.getElementById('warning').style.display = 'block';
  }

  // Show transaction preview if applicable
  if (payload && (type === 'SIGN_TRANSACTION' || type === 'SIGN_ALL_TRANSACTIONS')) {
    try {
      const data = JSON.parse(payload);
      showTransactionPreview(data);
    } catch (error) {
      console.error('Failed to parse payload:', error);
    }
  }

  // Handle button clicks
  document.getElementById('approve-btn').addEventListener('click', function() {
    sendResponse(true);
  });

  document.getElementById('reject-btn').addEventListener('click', function() {
    sendResponse(false);
  });
});

function formatRequestType(type) {
  switch (type) {
    case 'CONNECT':
      return 'Connect Wallet';
    case 'SIGN_MESSAGE':
      return 'Sign Message';
    case 'SIGN_TRANSACTION':
      return 'Sign Transaction';
    case 'SIGN_ALL_TRANSACTIONS':
      return 'Sign Multiple Transactions';
    case 'REQUEST_ACCOUNTS':
      return 'Request Accounts';
    default:
      return type;
  }
}

function showTransactionPreview(data) {
  const preview = document.getElementById('transaction-preview');
  const dataElement = document.getElementById('transaction-data');

  preview.style.display = 'block';

  if (data.transaction) {
    // Single transaction
    dataElement.textContent = JSON.stringify(data.transaction, null, 2);
  } else if (data.transactions) {
    // Multiple transactions
    dataElement.textContent = `Batch of ${data.transactions.length} transactions`;
  }
}

function sendResponse(approved) {
  // Send response back to background script
  chrome.runtime.sendMessage({
    type: 'APPROVAL_RESPONSE',
    origin: new URLSearchParams(window.location.search).get('origin'),
    approved,
  });

  // Close the popup
  window.close();
}