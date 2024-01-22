import request from "supertest";
import router from "../source/server";
import { IUserLogin, ValidUser, InvalidLogin, InValidUser } from "./mocks/user";

describe("Sign Up", () => {
  it("Create User Successfully", async () => {
    const validUser = new ValidUser();
    const result = await request(router)
      .post("/api/auths/register")
      .send(validUser);
    expect(result.body.user.email).toEqual(validUser.email);
    expect(result.body.user.name).toEqual(validUser.name);
    expect(result.body.user.phoneNumber).toEqual(validUser.phoneNumber);
    expect(result.body.user.city).toEqual(validUser.city);
    expect(result.body.user.district).toEqual(validUser.district);
    expect(result.body.user.neighbourhood).toEqual(validUser.neighbourhood);
    expect(result.statusCode).toEqual(201);
  });
  it("fails to create user with an invalid input", async () => {
    const invalidUser = new InValidUser();
    const result = await request(router)
      .post("/api/auths/register")
      .send(invalidUser);
    expect(result.statusCode).toEqual(500);
  });
});

describe("Sign In", () => {
  const validUser = new ValidUser();
  const loginUser: IUserLogin = {
    email: validUser.email,
    password: validUser.password,
  };

  beforeAll(async () => {
    await request(router).post("/api/auths/register").send(validUser);
  });
  it("Log In User Successfully", async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(loginUser);
    expect(result.body.message).toEqual("Login successful");
    expect(typeof result.body.token).toBe("string");
    expect(result.statusCode).toEqual(200);
  });
  it("fails to create user with an invalid input", async () => {
    const wrongLogin = new InvalidLogin();
    const result = await request(router)
      .post("/api/auths/login")
      .send(wrongLogin);
    expect(result.statusCode).toEqual(401);
  });
});
