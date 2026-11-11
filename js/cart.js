// ---------- cart: lines are {id, qty}; prices always come from the MENU array ----------
const MAX_QTY = 10;
const LARGE_SURCHARGE = 300; // per drink, only when "Large" is chosen
const cartLines = [];

function findItem(id) {
  return MENU.find(item => item.id === id);
}

function currentSize() {
  const checked = document.querySelector('#orderForm input[name="size"]:checked');
  return checked ? checked.value : 'regular';
}

// calculated values: item count, drinks count, subtotal, surcharge, total
function cartTotals() {
  let count = 0, drinks = 0, subtotal = 0;
  for (const line of cartLines) {
    const item = findItem(line.id);
    count += line.qty;
    subtotal += item.price * line.qty;
    if (item.type !== 'Bake') drinks += line.qty;
  }
  const surcharge = currentSize() === 'large' ? drinks * LARGE_SURCHARGE : 0;
  return { count, drinks, subtotal, surcharge, total: subtotal + surcharge };
}

function addToCart(id) {
  const line = cartLines.find(l => l.id === id);
  if (!line) {
    cartLines.push({ id, qty: 1 });
  } else if (line.qty >= MAX_QTY) {
    renderCart('You can order up to ' + MAX_QTY + ' of one item.');
    return;
  } else {
    line.qty += 1;
  }
  renderCart();
}

function changeQty(id, delta) {
  const index = cartLines.findIndex(l => l.id === id);
  if (index === -1) return;
  const next = cartLines[index].qty + delta;
  if (next > MAX_QTY) { renderCart('You can order up to ' + MAX_QTY + ' of one item.'); return; }
  if (next < 1) cartLines.splice(index, 1);
  else cartLines[index].qty = next;
  renderCart();
}

function removeFromCart(id) {
  const index = cartLines.findIndex(l => l.id === id);
  if (index !== -1) cartLines.splice(index, 1);
  renderCart();
}

function clearCart() {
  cartLines.length = 0;
  renderCart();
}

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeButton(className, text, label, handler) {
  const btn = makeEl('button', className, text);
  btn.type = 'button';
  btn.setAttribute('aria-label', label);
  btn.addEventListener('click', handler);
  return btn;
}

function sumRow(label, value, className) {
  const row = makeEl('div', 'cart-sum-row' + (className ? ' ' + className : ''));
  row.append(makeEl('span', '', label), makeEl('span', '', value));
  return row;
}

function renderCart(note) {
  const box = document.getElementById('cart');
  if (!box) return;
  const totals = cartTotals();
  box.replaceChildren();

  if (cartLines.length === 0) {
    box.append(makeEl('p', 'cart-empty', 'Your cart is empty. Add something tasty from the menu above.'));
  } else {
    cartLines.forEach(line => {
      const item = findItem(line.id);
      const row = makeEl('div', 'cart-row');
      const info = makeEl('div', 'cart-info');
      info.append(makeEl('span', 'cart-name', item.name), makeEl('span', 'cart-line-price', formatPrice(item.price * line.qty)));
      const qty = makeEl('div', 'qty');
      qty.append(
        makeButton('qty-btn', '−', 'Decrease quantity of ' + item.name, () => changeQty(item.id, -1)),
        makeEl('span', 'qty-num', String(line.qty)),
        makeButton('qty-btn', '+', 'Increase quantity of ' + item.name, () => changeQty(item.id, 1))
      );
      row.append(info, qty, makeButton('cart-remove', '×', 'Remove ' + item.name + ' from cart', () => removeFromCart(item.id)));
      box.append(row);
    });
    const sum = makeEl('div', 'cart-sum');
    sum.append(sumRow('Items', String(totals.count)));
    if (totals.surcharge > 0) sum.append(sumRow('Large size (' + totals.drinks + ' × ' + formatPrice(LARGE_SURCHARGE) + ')', formatPrice(totals.surcharge)));
    sum.append(sumRow('Total', formatPrice(totals.total), 'cart-total'));
    box.append(sum);
  }
  if (note) box.append(makeEl('p', 'cart-note', note));

  // floating shortcut button
  const fabText = document.getElementById('cartFabText');
  if (fabText) fabText.textContent = totals.count + (totals.count === 1 ? ' item · ' : ' items · ') + formatPrice(totals.total);
  const cartError = document.getElementById('cartError');
  if (cartError && totals.count > 0) cartError.hidden = true;

  document.dispatchEvent(new CustomEvent('cart:changed', { detail: totals }));
}

// size change updates the total
const orderFormForCart = document.getElementById('orderForm');
if (orderFormForCart) {
  orderFormForCart.addEventListener('change', e => {
    if (e.target.name === 'size') renderCart();
  });
  renderCart();
}
