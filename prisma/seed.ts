import { PrismaClient } from "@prisma/client";
import { KANTO_PREFECTURES, type Prefecture } from "../src/shared/reservation-types";
import { addDaysTokyo, createTokyoSlotUtc, formatTokyoDateKey } from "../src/shared/tokyo-date";

const prisma = new PrismaClient();

const storesByPrefecture: Record<Prefecture, string[]> = {
  東京都: [
    "錦糸町店",
    "新宿店",
    "渋谷店",
    "池袋店",
    "上野店",
    "品川店",
    "吉祥寺店",
    "立川店",
    "町田店",
    "北千住店",
  ],
  神奈川県: ["横浜店", "川崎店", "藤沢店", "武蔵小杉店"],
  千葉県: ["千葉店", "船橋店", "柏店", "浦安店"],
  埼玉県: ["大宮店", "浦和店", "川越店", "越谷店"],
  栃木県: ["宇都宮店"],
  群馬県: ["高崎店"],
  茨城県: ["水戸店"],
};

const facilities = ["24時間営業", "シャワー", "ロッカー", "レンタルウェア"];
const programs = ["体験トレーニング", "姿勢改善", "筋力アップ", "ダイエット"];

interface StoreSeedContext {
  storeId: string;
  todayKey: string;
}

interface DateSlotSeedContext {
  storeId: string;
  dateKey: string;
}

async function main(): Promise<void> {
  const todayKey = formatTokyoDateKey(new Date());

  for (const prefecture of KANTO_PREFECTURES) {
    await seedStoresForPrefecture(prefecture, todayKey);
  }
}

async function seedStoresForPrefecture(prefecture: Prefecture, todayKey: string): Promise<void> {
  for (const suffix of storesByPrefecture[prefecture]) {
    const store = await prisma.store.upsert({
      where: { name: `SatoJay Gym ${suffix}` },
      update: storeData(prefecture, suffix),
      create: {
        name: `SatoJay Gym ${suffix}`,
        ...storeData(prefecture, suffix),
      },
    });

    await seedSlotsForStore({ storeId: store.id, todayKey });
  }
}

async function seedSlotsForStore({ storeId, todayKey }: StoreSeedContext): Promise<void> {
  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    const dateKey = addDaysTokyo(todayKey, dayOffset);
    await seedSlotsForDate({ storeId, dateKey });
  }
}

async function seedSlotsForDate({ storeId, dateKey }: DateSlotSeedContext): Promise<void> {
  for (let hour = 10; hour < 20; hour += 1) {
    const startsAt = createTokyoSlotUtc(dateKey, hour);
    const endsAt = createTokyoSlotUtc(dateKey, hour + 1);
    await prisma.availabilitySlot.upsert({
      where: {
        storeId_startsAt: {
          storeId,
          startsAt,
        },
      },
      update: { endsAt },
      create: {
        storeId,
        startsAt,
        endsAt,
      },
    });
  }
}

function storeData(prefecture: Prefecture, suffix: string) {
  return {
    prefecture,
    access: `${suffix.replace("店", "")}駅から徒歩5分`,
    businessHours: "24時間営業",
    facilities,
    programs,
    priceText: "体験トレーニング 0円 / 月額 12,800円",
  };
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
