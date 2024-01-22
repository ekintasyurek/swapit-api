import { faker } from "@faker-js/faker";

export interface IUser {
  email: string;
  name: string;
  phoneNumber: number;
  password: string;
  city: string;
  district: string;
  neighbourhood: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export class ValidUser implements IUser {
  email = faker.internet.email();
  name = faker.person.firstName();
  phoneNumber = parsePhoneNumber(faker.phone.number());
  password = faker.internet.password();
  city = faker.location.city();
  district = faker.location.county();
  neighbourhood = faker.location.street();
}

export class InValidUser {
  email = faker.internet.email();
  password = faker.internet.password();
}

export class InvalidLogin implements IUserLogin {
  email = faker.string.sample(10);
  password = faker.string.sample(2);
}

function parsePhoneNumber(phoneString: string): number {
  const numericPhoneString = phoneString.replace(/\D/g, "");
  return parseInt(numericPhoneString, 10);
}

export const JestTestUser = {
  email: "jesttest@jesttest.com",
  password: "jesttes",
};

export const AdminTestUser = {
  email: "admin2@admin.com",
  password: "admin2password",
};
