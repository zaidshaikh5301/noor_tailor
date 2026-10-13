import { connectDb, disconnectDb } from "../src/config/db";
import { Product } from "../src/models/Product";
import { Category } from "../src/models/Category";
import { Faq } from "../src/models/Faq";
import { Testimonial } from "../src/models/Testimonial";
import { StoreInfo } from "../src/models/StoreInfo";
import { Collection } from "../src/models/Collection";
import { Coupon } from "../src/models/Coupon";
import { products as productSeed } from "../../client/src/data/products";
import { categories as categorySeed } from "../../client/src/data/categories";
import { faqs as faqSeed } from "../../client/src/data/faqs";
import { testimonials as testimonialSeed } from "../../client/src/data/testimonials";
import { storeInfo as storeInfoSeed } from "../../client/src/data/storeInfo";
import { collections as collectionSeed } from "../../client/src/data/collections";
import { productPhotos } from "../../client/src/data/productPhotos";

const coupons = [
  { code: "NOOR10", discountPercent: 10, active: true },
];

async function seed(): Promise<void> {
  await connectDb();

  console.log("[seed] clearing catalogue data (orders and appointments are kept)...");
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Faq.deleteMany({}),
    Testimonial.deleteMany({}),
    Collection.deleteMany({}),
  ]);

  console.log(`[seed] inserting ${categorySeed.length} categories...`);
  await Category.insertMany(categorySeed);

  console.log(`[seed] inserting ${productSeed.length} products...`);
  const productDocs = productSeed.map((p) => {
    const photo = productPhotos[p.slug];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      description: p.description,
      fabric: p.fabric,
      fit: p.fit,
      occasion: p.occasion,
      colors: p.colors,
      sizes: p.sizes,
      images: photo ? [photo.src] : p.images,
      imageAlt: photo?.alt,
      tags: p.tags,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      inStock: p.inStock,
      careInstructions: p.careInstructions,
      deliveryNote: p.deliveryNote,
      customTailoringAvailable: p.customTailoringAvailable,
    };
  });
  await Product.insertMany(productDocs, { ordered: false });

  console.log(`[seed] inserting ${faqSeed.length} FAQs...`);
  await Faq.insertMany(faqSeed);

  console.log(`[seed] inserting ${testimonialSeed.length} testimonials...`);
  await Testimonial.insertMany(testimonialSeed);

  console.log(`[seed] inserting ${collectionSeed.length} collections...`);
  await Collection.insertMany(collectionSeed);

  console.log("[seed] upserting store info...");
  await StoreInfo.findOneAndUpdate(
    { name: storeInfoSeed.name },
    { $set: storeInfoSeed },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`[seed] upserting ${coupons.length} coupons...`);
  for (const coupon of coupons) {
    await Coupon.findOneAndUpdate(
      { code: coupon.code },
      { $set: coupon },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  console.log("[seed] done.");
  await disconnectDb();
}

seed().catch(async (err) => {
  console.error("[seed] failed:", err);
  await disconnectDb();
  process.exit(1);
});
