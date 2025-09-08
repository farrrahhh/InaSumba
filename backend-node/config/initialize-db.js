import { User, Character, Weaver, Product } from "../models/models.js";
import { Op } from "sequelize";

/**
 * Initialize database with default data
 */
export const initializeDatabase = async () => {
  try {
    console.log("Checking for default data in database...");

    // Check and create a default user
    const defaultUserId = "3C69BD32"; // This matches the default ID used in the frontend
    const existingUser = await User.findOne({
      where: { user_id: defaultUserId },
    });

    if (!existingUser) {
      console.log("Creating default user");
      await User.create({
        user_id: defaultUserId,
        name: "Default User",
        email: "default@example.com",
        password: "default-password", // In a real app, this would be hashed
      });
    }

    // Check and create default character (Ina Na)
    const existingCharacter = await Character.findOne({
      where: { character_id: "CR001" },
    });

    if (!existingCharacter) {
      console.log("Creating default character: Ina Na");
      await Character.create({
        character_id: "CR001",
        name: "Ina Na",
        bio: "Ina Na, 40 tahun, adalah seorang penenun terampil dan berpengetahuan luas dari Sumba. Dikenal dengan kepribadiannya yang keibuan, ramah, dan sabar, Ina selalu siap berbagi cerita dan pengetahuannya tentang kekayaan budaya Sumba, terutama seni tenun ikat tradisional. Ia bangga melestarikan warisan leluhur dan sangat senang membimbing siapa pun yang ingin belajar lebih banyak tentang makna di balik setiap motif dan proses di balik setiap helai kain.",
        region: "Sumba, Nusa Tenggara Timur",
      });
    }

    // Check and create default weaver
    const existingWeaver = await Weaver.findOne({
      where: { weaver_id: "WVR001" },
    });

    if (!existingWeaver) {
      console.log("Creating default weaver: Maria Domi Ndapa");
      await Weaver.create({
        weaver_id: "WVR001",
        name: "Maria Domi Ndapa",
        bio: "Maria Domi is a traditional ikat weaver from East Sumba who inherited the weaving skills from her ancestors at the age of 10. She is recognized as one of the finest artisans who still preserves the natural dyeing techniques using roots and leaves from the native forests of Sumba. In addition to being a craftswoman, Maria actively trains the younger generation to ensure that the cultural heritage and ancestral techniques are not forgotten. She frequently organizes workshops in villages and promotes woven textiles at both national and international levels.",
        address:
          "Pau Village, Rindi Subdistrict, East Sumba Regency, East Nusa Tenggara. The location lies in the hills surrounded by fields and rivers, which serve as the main inspiration for her weaving motifs.",
        phone_number: "082112345678",
        specialization: [
          "Human Motif",
          "Dragon Motif",
          "Horse Motif",
          "Chicken Motif",
          "Geometric Pattern",
        ],
      });
    }

    // Check and create default products
    const existingProducts = await Product.findAll({
      where: {
        product_id: {
          [Op.in]: ["PRD001", "PRD002", "PRD003", "PRD004", "PRD005", "PRD006"],
        },
      },
    });

    if (existingProducts.length < 6) {
      console.log("Creating default products...");

      const productsToCreate = [
        {
          product_id: "PRD001",
          name: "Sumba Weaving - Human Motif",
          quantity: 10,
          price: 750000,
          category: "Woven Fabric",
          description:
            "Handwoven fabric from East Sumba featuring ancestral human figures.",
          meaning_motif:
            "The human motif symbolizes ancestral spirits and lineage.",
          long_description:
            "This handwoven masterpiece captures the essence of Sumba heritage. Each thread is dyed naturally and woven using traditional ikat techniques passed down for generations. The texture and color composition represent spiritual devotion and local wisdom. The process requires meticulous care, involving binding, dyeing, and sun-drying the threads for several days before weaving. The result is a rich, detailed piece that tells a cultural story through its pattern.",
          long_meaning_motif:
            "The human figure motif reflects the belief in ancestral presence in daily life. It portrays the respect and devotion of Sumbanese people to their lineage and forebears. The use of this motif in textiles often signifies ceremonial roles, spiritual rituals, and community leadership within traditional society.",
          video_url:
            "https://drive.google.com/file/d/1oHL_fbAW9vt53FRfutlsjR2xL0LBgKm6/view?usp=drive_link",
          photo_url:
            "https://drive.google.com/file/d/1uV95sLI6NSsEis3cQgJw9Wfw5Ci0_z4S/view?usp=drive_link",
          weaver_id: "WVR001",
        },
        {
          product_id: "PRD002",
          name: "Sumba Weaving - Dragon Motif",
          quantity: 8,
          price: 800000,
          category: "Woven Fabric",
          description: "Woven textile featuring the mythical dragon.",
          meaning_motif:
            "The dragon motif represents guardianship and cosmic strength.",
          long_description:
            "This vibrant cloth is inspired by mythological beliefs in Sumba, where dragons are seen as protectors. It is dyed with a deep mix of indigo and forest green, then manually woven for over two weeks. The ikat technique used ensures that the colors lock deeply into the fibers, resulting in lasting brilliance and pattern clarity.",
          long_meaning_motif:
            "Dragons in Sumbanese interpretation are a blend of snake and bird, symbolizing movement between heaven and earth. The motif is believed to guard the wearer from harm and bring spiritual balance.",
          video_url:
            "https://drive.google.com/file/d/1oHL_fbAW9vt53FRfutlsjR2xL0LBgKm6/view?usp=drive_link",
          photo_url:
            "https://drive.google.com/file/d/1zjYNTNdGg-O6At2KF6BoEaYAdF5rtC7-/view?usp=drive_link",
          weaver_id: "WVR001",
        },
        {
          product_id: "PRD003",
          name: "Sumba Weaving - Horse Motif",
          quantity: 12,
          price: 700000,
          category: "Woven Fabric",
          description: "Woven textile from Sumba with symbolic horse motif.",
          meaning_motif: "Horse motif represents speed, power, and nobility.",
          long_description:
            "This fabric is crafted to honor the significance of horses in Sumbanese ceremonies. Horses are status symbols and often used in dowry and ritual offerings. The cloth itself is light yet durable, with pattern symmetry representing balance and harmony.",
          long_meaning_motif:
            "The horse motif denotes loyalty and strength. It is commonly worn by male elders during festivals or while reciting oral histories in village gatherings.",
          video_url:
            "https://drive.google.com/file/d/1oHL_fbAW9vt53FRfutlsjR2xL0LBgKm6/view?usp=drive_link",
          photo_url:
            "https://drive.google.com/file/d/1wzLPg6IMmymX0LX5ewWIejo75GyaO5SD/view?usp=drive_link",
          weaver_id: "WVR001",
        },
        {
          product_id: "PRD004",
          name: "Sumba Hand-knitted Bag",
          quantity: 15,
          price: 250000,
          category: "Accessories",
          description: "Handmade bag crafted by local women from Sumba.",
          meaning_motif: null,
          long_description:
            "This knitted bag blends function and fashion, woven with locally sourced cotton and adorned with traditional bead accents. The bag design takes inspiration from Sumba's daily farming life, portraying resilience and connection to the land.",
          long_meaning_motif: null,
          video_url: null,
          photo_url:
            "https://drive.google.com/file/d/11NRs3FMnIFBB5XpSeeGUf70A5AT2ey-n/view?usp=drive_link",
          weaver_id: "WVR001",
        },
        {
          product_id: "PRD005",
          name: "Sumba Keychain Souvenir",
          quantity: 30,
          price: 50000,
          category: "Souvenir",
          description: "Souvenir keychain made by Sumbanese artisans.",
          meaning_motif: null,
          long_description:
            "This keychain showcases a miniature motif commonly used in ikat cloth. It's crafted from wood and naturally dyed fibers, ideal for tourists or cultural enthusiasts. Portable yet meaningful, it introduces Sumba's artistry in a fun and accessible way.",
          long_meaning_motif: null,
          video_url: null,
          photo_url:
            "https://drive.google.com/file/d/16aYKpf8UMnEBn5QDOf0Rw3gDDnC1IHnH/view?usp=drive_link",
          weaver_id: "WVR001",
        },
        {
          product_id: "PRD006",
          name: "Sumba Weaving - Chicken Motif",
          quantity: 6,
          price: 600000,
          category: "Woven Fabric",
          description: "Traditional woven cloth with chicken motif.",
          meaning_motif:
            "Chicken symbolizes fertility, sustenance, and local livelihood.",
          long_description:
            "This ikat piece integrates daily symbols of agrarian life, focusing on the humble chicken which plays an essential role in both economy and tradition. The cloth is often used in ritual meals or as offerings during village feasts.",
          long_meaning_motif:
            "Chicken imagery connects to themes of renewal and nourishment. In Sumba, it is believed that chickens help bridge the human and ancestral realm, especially when sacrificed in ceremonial events.",
          video_url:
            "https://drive.google.com/file/d/1oHL_fbAW9vt53FRfutlsjR2xL0LBgKm6/view?usp=drive_link",
          photo_url:
            "https://drive.google.com/file/d/1uV95sLI6NSsEis3cQgJw9Wfw5Ci0_z4S/view?usp=drive_link",
          weaver_id: "WVR001",
        },
      ];

      // Create products that don't exist yet
      const existingProductIds = existingProducts.map((p) => p.product_id);
      const productsToAdd = productsToCreate.filter(
        (p) => !existingProductIds.includes(p.product_id)
      );

      if (productsToAdd.length > 0) {
        await Product.bulkCreate(productsToAdd);
        console.log(`Created ${productsToAdd.length} new products`);
      }
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default initializeDatabase;
