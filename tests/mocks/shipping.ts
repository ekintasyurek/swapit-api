import { faker } from "@faker-js/faker";

export interface IShipping {
  _id: string;
  customerShippingId: string;
  status: string;
  swap?: string;
  user?: string;
  payment?: string;
}

export class ValidShipping implements IShipping {
  _id = faker.string.sample(24);
  customerShippingId = faker.string.sample(24);
  status = "pending";
}

export class InValidShipping {
  _id = faker.string.sample(24);
  customerShippingId = faker.string.sample(24);
  status = "invalidStatus";
}

export const JestTestShipping = {
  _id: "6593538bda9d9c4df8e990b7",
};
