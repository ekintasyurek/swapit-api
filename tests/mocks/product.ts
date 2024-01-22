import { faker } from "@faker-js/faker";

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  user?: string;
  swap?: string;
}

export class ValidProduct implements IProduct {
  _id = faker.string.sample(24);
  name = faker.string.sample(10);
  description = faker.string.sample(20);
  category = "furniture";
}

export class InValidProduct {
  _id = faker.string.sample(24);
  category = "furniture";
}

export const JestTestProduct = {
  _id: "6582ce89c465f17be2ed9106",
};
