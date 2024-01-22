import { faker } from "@faker-js/faker";

export interface ISwap {
  _id: string;
  status: string;
  product1?: string;
  product2?: string;
  user1?: string;
  user2?: string;
  shipping1?: string;
  shipping2?: string;
}

export class ValidSwap implements ISwap {
  _id = faker.string.sample(24);
  status = "pending";
}

export class InValidSwap {
  _id = faker.string.sample(24);
  status = "invalidStatus";
}

export const JestTestSwap = {
  _id: "6593533fa4ab68703c4331e7",
};
