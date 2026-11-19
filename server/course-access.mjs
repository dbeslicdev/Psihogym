import curriculum from './content/curriculum.json' with {type:'json'};
import {randomUUID} from 'node:crypto';
import {programiById, programPrice} from './program-catalog.mjs';

const day = 24 * 60 * 60 * 1000;
const lessonIds = new Map(Object.entries(curriculum).map(([id, program]) => [
  id, new Set(program.modules.flatMap(module => module.lessons.map(lesson => lesson.id))),
]));

export function isPurchasable(id) {
  return typeof id === 'string' && Object.hasOwn(programiById, id) &&
    programiById[id].status === 'active' && lessonIds.has(id);
}

export function programCurriculum(id) {
  return lessonIds.has(id) ? curriculum[id] : null;
}

export function validatedProgress(id, value) {
  const valid = lessonIds.get(id);
  if (!valid || !Array.isArray(value.done) || value.done.length > valid.size ||
      value.done.some(lesson => !valid.has(lesson)) ||
      (value.current !== null && !valid.has(value.current))) return null;
  return {done: [...new Set(value.done)], current: value.current};
}

function migrateOutlineProgress(db) {
  if (db.prepare('PRAGMA user_version').get().user_version >= 2) return;
  // v1 numbered the placeholder bonus lessons together with the regular lessons.
  const oldBonuses = {
    'emocionalni-razvoj': ['l11'], anksioznost: ['l20'],
    odnosi: ['l11', 'l12'], samopouzdanje: ['l13'],
  };
  db.exec('BEGIN IMMEDIATE');
  try {
    const update = db.prepare('UPDATE progress SET done=?, current=? WHERE user_id=? AND program_id=?');
    for (const row of db.prepare('SELECT user_id, program_id, done, current FROM progress').all()) {
      const aliases = oldBonuses[row.program_id];
      if (!aliases) continue;
      const map = id => aliases.includes(id) ? 'bonus' : id;
      const done = [...new Set(JSON.parse(row.done).map(map))];
      update.run(JSON.stringify(done), map(row.current), row.user_id, row.program_id);
    }
    db.exec('PRAGMA user_version=2; COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function courseAccess(db) {
  migrateOutlineProgress(db);
  // Keep the original order (including its price and kind) when a buyer renews.
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_renewals (
      id TEXT PRIMARY KEY, purchase_id TEXT NOT NULL REFERENCES purchases(id),
      amount_cents INTEGER NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('test','paid')),
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS purchase_renewals_purchase ON purchase_renewals(purchase_id, created_at);
  `);
  const latestOrders = db.prepare(`
    WITH orders AS (
      SELECT program_id, kind, created_at FROM purchases WHERE user_id=?
      UNION ALL
      SELECT p.program_id, r.kind, r.created_at
      FROM purchase_renewals r JOIN purchases p ON p.id=r.purchase_id WHERE p.user_id=?
    ), ranked AS (
      SELECT *, row_number() OVER (PARTITION BY program_id ORDER BY created_at DESC) AS position FROM orders
    )
    SELECT program_id AS programId, kind, created_at AS purchasedAt
    FROM ranked WHERE position=1 ORDER BY purchasedAt, programId
  `);

  function list(userId, now=Date.now()) {
    const active = [], expired = [];
    for (const order of latestOrders.all(userId, userId)) {
      if (!lessonIds.has(order.programId)) continue;
      const expiresAt = order.purchasedAt + programiById[order.programId].accessDays * day;
      const item = {...order, expiresAt, totalLessons: lessonIds.get(order.programId).size};
      (expiresAt > now ? active : expired).push(item);
    }
    return {purchases: active, expiredPurchases: expired};
  }

  function grantTestPurchase(userId, ids) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const now = Date.now();
      const active = new Set(list(userId, now).purchases.map(order => order.programId));
      const firstOrder = db.prepare('SELECT id FROM purchases WHERE user_id=? AND program_id=?');
      const insertOrder = db.prepare('INSERT INTO purchases(id,user_id,program_id,amount_cents,kind,created_at) VALUES(?,?,?,?,?,?)');
      const renew = db.prepare('INSERT INTO purchase_renewals(id,purchase_id,amount_cents,kind,created_at) VALUES(?,?,?,?,?)');
      for (const id of ids) {
        if (active.has(id)) continue;
        const amount = Math.round(programPrice(programiById[id], now) * 100);
        if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Invalid catalog price');
        const previous = firstOrder.get(userId, id);
        if (previous) renew.run(randomUUID(), previous.id, amount, 'test', now);
        else insertOrder.run(randomUUID(), userId, id, amount, 'test', now);
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return {list, grantTestPurchase};
}
