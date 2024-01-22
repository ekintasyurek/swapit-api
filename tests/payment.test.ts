import request from "supertest";
import router from "../source/server";
import { AdminTestUser, JestTestUser, ValidUser } from "./mocks/user";
import { ValidProduct } from "./mocks/product";
import { ISwap, ValidSwap } from "./mocks/swap";
import { IShipping, ValidShipping } from "./mocks/shipping";
import {
  InValidPayment,
  IPayment,
  JestTestPayment,
  ValidPayment,
} from "./mocks/payment";

describe("Swap", () => {
  const validUser1 = new ValidUser();
  const validUser2 = new ValidUser();
  const validProduct1 = new ValidProduct();
  const validProduct2 = new ValidProduct();
  let validSwap: ISwap = new ValidSwap();
  let validShipping: IShipping = new ValidShipping();

  let user1Token: string;
  let user2Token: string;

  let validPayment: IPayment = new ValidPayment();
  const invalidPayment = new InValidPayment();

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

    const shippingResult = await request(router)
      .post("/api/shippings/createShipping")
      .send(validShipping)
      .set("Authorization", `Bearer ${user1Token}`);

    validPayment.shipping = shippingResult.body.shipping._id;
    validPayment.user = user1Result.body.user._id;
  });

  it("Create valid payment Successfully", async () => {
    const result = await request(router)
      .post("/api/payments/createPayment")
      .send(validPayment)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.body.payment.status).toEqual(validPayment.status);
    expect(result.body.payment.amount).toEqual(validPayment.amount);
    expect(result.body.payment.shipping).toEqual(validPayment.shipping);
    expect(result.body.payment.user).toEqual(validPayment.user);
    expect(result.statusCode).toEqual(201);
  });

  it("Fails to Create Invalid payment", async () => {
    const result = await request(router)
      .post("/api/payments/createPayment")
      .send(invalidPayment)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.statusCode).toEqual(500);
  });
});

describe("GET /api/payments", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(AdminTestUser);
    token = result.body.token;
  });

  it("should fetch all payments for a user", async () => {
    const response = await request(router)
      .get("/api/payments/getPayments")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.payments)).toBeTruthy();
    expect(response.body.count).toBeDefined();
  });
});

describe("GET /api/payments/user/:userId", () => {
  let token: string;
  let userId: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
    userId = result.body.user._id;
  });

  it("should fetch payments by user ID", async () => {
    const response = await request(router)
      .get(`/api/payments/getPaymentByUserId/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.payments)).toBeTruthy();
  });
});

describe("PATCH /api/payments/:paymentId", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(AdminTestUser);
    token = result.body.token;
  });

  it("should update a payment", async () => {
    const paymentId = JestTestPayment._id;
    const updateData = { status: "success" };
    const response = await request(router)
      .patch(`/api/payments/updatePayment/${paymentId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add more assertions as necessary
  });

  it("should return 404 for a non-existent payment ID", async () => {
    const nonExistentPaymentId = "nonExistentId";
    const updateData = { status: "success" };
    const response = await request(router)
      .patch(`/api/payments/updatePayment/${nonExistentPaymentId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});
