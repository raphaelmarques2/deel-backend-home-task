import Sequelize from "sequelize";
import { Profile } from "./profile.model";

export enum ContractStatus {
  New = "new",
  InProgress = "in_progress",
  Terminated = "terminated",
}
type ContractAttributes = {
  id: number;
  terms: string;
  status: ContractStatus;
  ClientId: Sequelize.ForeignKey<Profile["id"]>;
  ContractorId: Sequelize.ForeignKey<Profile["id"]>;
};
type ContractCreationAttributes = Sequelize.Optional<ContractAttributes, "id">;

export class Contract extends Sequelize.Model<
  ContractAttributes,
  ContractCreationAttributes
> {
  declare id: number;
  declare terms: string;
  declare status: ContractStatus;
  declare ClientId: Sequelize.ForeignKey<Profile["id"]>;
  declare ContractorId: Sequelize.ForeignKey<Profile["id"]>;
}

export function initContractModel(sequelize: Sequelize.Sequelize) {
  Contract.init(
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("new", "in_progress", "terminated"),
      },
    },
    {
      sequelize,
      modelName: "Contract",
    }
  );
}
