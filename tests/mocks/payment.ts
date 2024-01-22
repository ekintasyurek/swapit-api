import { faker } from "@faker-js/faker";

export interface IPayment {
  _id: string;
  status: string;
  amount: number;
  user?: string;
  shipping?: string;
}

export class ValidPayment implements IPayment {
  _id = faker.string.sample(24);
  status = "pending";
  amount = faker.number.int(100);
}

export class InValidPayment {
  _id = faker.string.sample(24);
  status = "pending";
}

export const JestTestPayment = {
  _id: "6593561a7983259a5d5e05f3",
};
