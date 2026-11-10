import { WHATSAPP_NUMBER } from '../config.js';
import { formatNaira } from './format.js';

const params = new URLSearchParams(window.location.search);
const reference = [params.get('reference'), params.get('trxref')].find(value =>
  value && /^[A-Za-z0-9._=\-]{1,128}$/.test(value));
const demoRequested = !reference && params.get('demo') === '1';

let storedOrder;
try { storedOrder = JSON.parse(sessionStorage.getItem('order')); } catch { storedOrder = null; }
const matchesCheckout = storedOrder?.product && (reference
  ? !storedOrder.demo && storedOrder.reference === reference
  : demoRequested && storedOrder.demo === true);
const order = matchesCheckout ? storedOrder : null;

if (order?.name) document.getElementById('thankyou-heading').textContent = `Thank you, ${order.name.split(' ')[0]}.`;
if (order?.demo) {
  document.getElementById('thankyou-sub').hidden = true;
  document.getElementById('demo-confirmation').hidden = false;
}

const detail = document.getElementById('order-detail');
for (const [label, value] of [
  ['Unit', order?.productName],
  ['Delivery state', order?.state],
  ['Order total', order?.total ? formatNaira(order.total) : null],
  ['Payment reference', reference],
]) {
  if (!value) continue;
  const row = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  detail.append(row);
}
detail.hidden = !detail.childElementCount;

const message = reference
  ? `Hello! Please help me check my order. Payment reference: ${reference}.`
  : order?.demo ? `Hello! I tried the demo checkout for ${order.productName}. Please help me order.`
  : 'Hello! Please help me with my order.';
document.getElementById('wa-confirm').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
