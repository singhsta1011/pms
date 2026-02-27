module.exports = (sequelize, DataTypes) => {

  const Hotel = sequelize.define(
    "Hotel",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      /* ===============================
         BASIC HOTEL INFO
      =============================== */

      hotelCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ownerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      gstNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      /* ===============================
         ⭐ SAAS CONTROL FIELDS
      =============================== */

      status: {
        type: DataTypes.ENUM("ACTIVE","SUSPENDED"),
        defaultValue: "ACTIVE",
      },

      subscriptionPlan: {
        type: DataTypes.STRING,
        allowNull: true,
      }

    },
    {
      tableName: "hotels",
      timestamps: true
    }
  );

  return Hotel;
};