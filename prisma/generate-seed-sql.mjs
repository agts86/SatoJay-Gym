const storesByPrefecture = {
  東京都: ["錦糸町店", "新宿店", "渋谷店", "池袋店", "上野店", "品川店", "吉祥寺店", "立川店", "町田店", "北千住店"],
  神奈川県: ["横浜店", "川崎店", "藤沢店", "武蔵小杉店"],
  千葉県: ["千葉店", "船橋店", "柏店", "浦安店"],
  埼玉県: ["大宮店", "浦和店", "川越店", "越谷店"],
  栃木県: ["宇都宮店"],
  群馬県: ["高崎店"],
  茨城県: ["水戸店"],
};

const facilities = ["24時間営業", "シャワー", "ロッカー", "レンタルウェア"];
const programs = ["体験トレーニング", "姿勢改善", "筋力アップ", "ダイエット"];

let idSequence = 0;

function nextId(prefix) {
  idSequence += 1;
  return `${prefix}_${String(idSequence).padStart(5, "0")}`;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function arrayLiteral(values) {
  return `ARRAY[${values.map(quote).join(", ")}]`;
}

function todayTokyoDateParts() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);
}

function slotUtcIso(baseUtc, dayOffset, hour) {
  const utcMillis = baseUtc + dayOffset * 86_400_000 + (hour - 9) * 3_600_000;
  return new Date(utcMillis).toISOString();
}

function buildSql() {
  const [year, month, day] = todayTokyoDateParts();
  const baseUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const lines = [
    "BEGIN;",
    'TRUNCATE TABLE "Booking", "AvailabilitySlot", "Store" RESTART IDENTITY CASCADE;',
  ];

  for (const [prefecture, suffixes] of Object.entries(storesByPrefecture)) {
    for (const suffix of suffixes) {
      lines.push(...storeSqlLines(prefecture, suffix, baseUtc));
    }
  }

  lines.push("COMMIT;");
  return `${lines.join("\n")}\n`;
}

function storeSqlLines(prefecture, suffix, baseUtc) {
  const storeId = nextId("store");
  return [storeInsertSql(storeId, prefecture, suffix), ...slotSqlLines(storeId, baseUtc)];
}

function storeInsertSql(storeId, prefecture, suffix) {
  const station = suffix.replace("店", "");
  return `INSERT INTO "Store" ("id", "name", "prefecture", "access", "businessHours", "facilities", "programs", "priceText", "updatedAt") VALUES (${quote(storeId)}, ${quote(`SatoJay Gym ${suffix}`)}, ${quote(prefecture)}, ${quote(`${station}駅から徒歩5分`)}, ${quote("24時間営業")}, ${arrayLiteral(facilities)}, ${arrayLiteral(programs)}, ${quote("体験トレーニング 0円 / 月額 12,800円")}, CURRENT_TIMESTAMP);`;
}

function slotSqlLines(storeId, baseUtc) {
  const lines = [];
  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    lines.push(...slotSqlLinesForDate(storeId, baseUtc, dayOffset));
  }
  return lines;
}

function slotSqlLinesForDate(storeId, baseUtc, dayOffset) {
  const lines = [];
  for (let hour = 10; hour < 20; hour += 1) {
    lines.push(slotInsertSql(storeId, baseUtc, dayOffset, hour));
  }
  return lines;
}

function slotInsertSql(storeId, baseUtc, dayOffset, hour) {
  return `INSERT INTO "AvailabilitySlot" ("id", "storeId", "startsAt", "endsAt", "updatedAt") VALUES (${quote(nextId("slot"))}, ${quote(storeId)}, ${quote(slotUtcIso(baseUtc, dayOffset, hour))}, ${quote(slotUtcIso(baseUtc, dayOffset, hour + 1))}, CURRENT_TIMESTAMP);`;
}

process.stdout.write(buildSql());
