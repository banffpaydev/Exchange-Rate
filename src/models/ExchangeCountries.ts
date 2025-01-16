import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from "../config/db";


interface CountryAttributes {
    id: number;
    name: string;
    code: string;
    currency: string;
    call_code: string;
}


interface CountryCreationAttributes extends Optional<CountryAttributes, 'id'> { }


class ExchangeCountries extends Model<CountryAttributes, CountryCreationAttributes> implements CountryAttributes {
    public id!: number;
    public name!: string;
    public code!: string;
    public currency!: string;
    public call_code!: string;
}

ExchangeCountries.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        code: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        call_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'exchange_countries',
        timestamps: false,
    }
);

export default ExchangeCountries;
