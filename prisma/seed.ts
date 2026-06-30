import { KANTO_PREFECTURES, type Prefecture } from "../src/shared/reservation-types";
import { createSatoJayPrismaClient } from "../src/server/prisma/client";

await using prisma = createSatoJayPrismaClient();

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

async function main(): Promise<void> {
  for (const prefecture of KANTO_PREFECTURES) {
    await seedStoresForPrefecture(prefecture);
  }
}

async function seedStoresForPrefecture(prefecture: Prefecture): Promise<void> {
  for (const suffix of storesByPrefecture[prefecture]) {
    await prisma.store.upsert({
      where: { name: `SatoJay Gym ${suffix}` },
      update: storeData(prefecture, suffix),
      create: {
        name: `SatoJay Gym ${suffix}`,
        ...storeData(prefecture, suffix),
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

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
