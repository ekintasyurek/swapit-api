import request from "supertest";
import router from "../source/server";
import { AdminTestUser, JestTestUser, ValidUser } from "./mocks/user";
import { ValidProduct } from "./mocks/product";
import { ISwap, ValidSwap } from "./mocks/swap";
import {
  ValidShipping,
  InValidShipping,
  IShipping,
  JestTestShipping,
} from "./mocks/shipping";

describe("Shipping", () => {
  const validUser1 = new ValidUser();
  const validUser2 = new ValidUser();
  const validProduct1 = new ValidProduct();
  const validProduct2 = new ValidProduct();
  let validSwap: ISwap = new ValidSwap();

  let user1Token: string;
  let user2Token: string;

  let validShipping: IShipping = new ValidShipping();
  const invalidShipping = new InValidShipping();

  beforeAll(async () => {
    await request(router).post("/api/auths/register").send(validUser1);
    await request(router).post("/api/auths/register").send(validUser2);

    const user1Result = await request(router).post("/api/auths/login").send({
      email: validUser1.email,
      password: validUser1.password,
    });
    user1Token = user1Result.body.token;

    const user2Result = await request(router).post("/api/auths/login").send({
      email: validUser2.email,
      password: validUser2.password,
    });
    user2Token = user2Result.body.token;

    const product1Result = await request(router)
      .post("/api/products/createProduct")
      .send({ ...validProduct1, user: user1Result.body.user._id })
      .set("Authorization", `Bearer ${user1Token}`);

    const product2Result = await request(router)
      .post("/api/products/createProduct")
      .send({ ...validProduct2, user: user2Result.body.user._id })
      .set("Authorization", `Bearer ${user2Token}`);

    validSwap.user1 = user1Result.body.user._id;
    validSwap.user2 = user2Result.body.user._id;
    validSwap.product1 = product1Result.body.product._id;
    validSwap.product2 = product2Result.body.product._id;

    const swapResult = await request(router)
      .post("/api/swaps/createSwap")
      .send(validSwap)
      .set("Authorization", `Bearer ${user1Token}`);

    validShipping.user = user1Result.body.user._id;
    validShipping.swap = swapResult.body.swap._id;
  });

  it("Create valid shipping Successfully", async () => {
    const result = await request(router)
      .post("/api/shippings/createShipping")
      .send(validShipping)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.body.shipping.customerShippingId).toEqual(
      validShipping.customerShippingId
    );
    expect(result.body.shipping.status).toEqual(validShipping.status);
    expect(result.body.shipping.swap).toEqual(validShipping.swap);
    expect(result.body.shipping.user).toEqual(validShipping.user);
    expect(result.statusCode).toEqual(201);
  });

  it("Fails to Create Invalid shipping", async () => {
    const result = await request(router)
      .post("/api/shippings/createShipping")
      .send(invalidShipping)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.statusCode).toEqual(500);
  });
});

describe("GET /api/shippings", () => {
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(AdminTestUser);
    token = result.body.token;
  });

  it("should fetch all shippings", async () => {
    const response = await request(router)
      .get("/api/shippings/getShippings")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.shippings)).toBeTruthy();
    expect(response.body.count).toBeDefined();
  });
});

describe("GET /api/shippings/getShippingByUserId/:userId", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
    userId = result.body.user._id;
  });

  it("should fetch shippings by user ID", async () => {
    const response = await request(router)
      .get(`/api/shippings/getShippingByUserId/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.shippings)).toBeTruthy();
  });
});

describe("PATCH /api/shippings/:shippingId", () => {
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(AdminTestUser);
    token = result.body.token;
  });

  it("should update a shipping", async () => {
    const shippingId = JestTestShipping._id;
    const updateData = { status: "delivered" }; // Replace with actual update data
    const response = await request(router)
      .patch(`/api/shippings/updateShipping/${shippingId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add more assertions as necessary
  });

  it("should return 404 for a non-existent shipping ID", async () => {
    const nonExistentShippingId = "nonExistentId";
    const updateData = { status: "delivered" };
    const response = await request(router)
      .patch(`/api/shippings/updateShipping/${nonExistentShippingId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});
