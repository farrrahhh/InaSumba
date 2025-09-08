import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/database.js";

// User Model
const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.STRING(8),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Character Model
const Character = sequelize.define(
  "Character",
  {
    character_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    region: {
      type: DataTypes.STRING(50),
    },
  },
  {
    tableName: "characters",
    timestamps: true,
  }
);

// Conversation Model
const Conversation = sequelize.define(
  "Conversation",
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    character_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  }
);

// Message Model
const Message = sequelize.define(
  "Message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

// Product Model
const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    meaning_motif: {
      type: DataTypes.TEXT,
    },
    long_description: {
      type: DataTypes.TEXT,
    },
    long_meaning_motif: {
      type: DataTypes.TEXT,
    },
    video_url: {
      type: DataTypes.STRING(255),
    },
    photo_url: {
      type: DataTypes.STRING(255),
    },
    weaver_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

// Weaver Model
const Weaver = sequelize.define(
  "Weaver",
  {
    weaver_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    specialization: {
      type: DataTypes.JSON,
      get() {
        const rawValue = this.getDataValue("specialization");
        return rawValue
          ? Array.isArray(rawValue)
            ? rawValue
            : JSON.parse(rawValue)
          : [];
      },
      set(value) {
        this.setDataValue(
          "specialization",
          value ? (typeof value === "string" ? JSON.parse(value) : value) : []
        );
      },
    },
  },
  {
    tableName: "weavers",
    timestamps: true,
  }
);

// Transaction Model
const Transaction = sequelize.define(
  "Transaction",
  {
    transaction_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    resi: {
      type: DataTypes.STRING(100),
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
  }
);

// Define relationships
User.hasMany(Conversation, { foreignKey: "user_id", as: "conversations" });
Conversation.belongsTo(User, { foreignKey: "user_id" });

Character.hasMany(Conversation, {
  foreignKey: "character_id",
  as: "conversations",
});
Conversation.belongsTo(Character, { foreignKey: "character_id" });

Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
  as: "messages",
});
Message.belongsTo(Conversation, { foreignKey: "conversation_id" });

Weaver.hasMany(Product, { foreignKey: "weaver_id", as: "products" });
Product.belongsTo(Weaver, { foreignKey: "weaver_id" });

Product.hasMany(Transaction, { foreignKey: "product_id", as: "transactions" });
Transaction.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Transaction, { foreignKey: "user_id" });
Transaction.belongsTo(User, { foreignKey: "user_id" });

export { User, Character, Conversation, Message, Product, Weaver, Transaction };
