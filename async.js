// Lab Task 6 - async/await user fetching + Promise.all validation

// ---- Simulated API (so the lab runs without internet). Each call waits, then answers like a server would.
const usersDb = [
  { id: 1, name: 'Ali', email: 'ali@uni.edu', age: 20 },
  { id: 2, name: 'Sara', email: 'sara@uni.edu', age: 22 },
  { id: 3, name: '', email: 'not-an-email', age: -5 },   // exists, but its data is invalid
];
const addressesDb = [
  { userId: 1, city: 'Islamabad', phone: '03001234567' },
  { userId: 2, city: 'Lahore', phone: '03111234567' },
  { userId: 3, city: '', phone: 'abc' },                 // invalid details
];

function fakeApiCall(table, key, id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof id !== 'number') {
        reject(new TypeError('id must be a number'));
        return;
      }
      const record = table.find((row) => row[key] === id);
      if (record === undefined) reject(new Error(`Request failed: no record for id ${id} (404)`));
      else resolve(record);
    }, 100);
  });
}

// ---- Part 1: async/await. Returns a valid user, or throws (= the returned promise rejects).
async function fetchUser(id) {
  const user = await fakeApiCall(usersDb, 'id', id); // a rejection here is thrown automatically

  const isValid =
    typeof user.name === 'string' && user.name.trim() !== '' &&
    typeof user.email === 'string' && user.email.includes('@') &&
    Number.isInteger(user.age) && user.age > 0;
  if (!isValid) {
    throw new Error(`User ${id} was fetched but its data is invalid`);
  }
  return user; // valid user object
}

async function fetchUserAddress(id) {
  const address = await fakeApiCall(addressesDb, 'userId', id);
  const isValid = address.city.trim() !== '' && /^\d{11}$/.test(address.phone);
  if (!isValid) {
    throw new Error(`Address details for user ${id} are invalid`);
  }
  return address;
}

// ---- Part 2: Promise.all over two async operations.
// Both start at the same time. The combined promise fulfils only if BOTH succeed, and rejects as soon as
// EITHER fails (fetch error or invalid details).
function loadFullProfile(id) {
  return Promise.all([fetchUser(id), fetchUserAddress(id)]).then(([user, address]) => ({ ...user, address }));
}

// ---------------------------------------------------------------- demo
async function main() {
  console.log('=== Part 1: fetchUser ===');
  for (const id of [1, 99, 3, 'abc']) {
    try {
      console.log(`id ${id}: SUCCESS`, await fetchUser(id));
    } catch (error) {
      console.log(`id ${id}: ERROR ->`, error.message);
    }
  }

  console.log('\n=== Part 2: Promise.all ===');
  for (const id of [1, 2, 3, 99]) {
    try {
      const profile = await loadFullProfile(id);
      console.log(`id ${id}: ACCEPTED`, profile);
    } catch (error) {
      console.log(`id ${id}: REJECTED ->`, error.message);
    }
  }
}

main();