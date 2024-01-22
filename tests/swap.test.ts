import request from "supertest";
import router from "../source/server";
import { AdminTestUser, JestTestUser, ValidUser } from "./mocks/user";
import { ValidProduct } from "./mocks/product";
import { ValidSwap, InValidSwap, ISwap, JestTestSwap } from "./mocks/swap";

describe("Swap", () => {
  const validUser1 = new ValidUser();
  const validUser2 = new ValidUser();
  const validProduct1 = new ValidProduct();
  const validProduct2 = new ValidProduct();

  let user1Token: string;
  let user2Token: string;

  let validSwap: ISwap = new ValidSwap();
  const invalidSwap = new InValidSwap();

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
  });

  it("Create valid swap Successfully", async () => {
    const result = await request(router)
      .post("/api/swaps/createSwap")
      .send(validSwap)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.body.swap.status).toEqual(validSwap.status);
    expect(result.body.swap.product1).toEqual(validSwap.product1);
    expect(result.body.swap.product2).toEqual(validSwap.product2);
    expect(result.body.swap.user1).toEqual(validSwap.user1);
    expect(result.body.swap.user2).toEqual(validSwap.user2);
    expect(result.statusCode).toEqual(201);
  });

  it("Fails to Create Invalid swap", async () => {
    const result = await request(router)
      .post("/api/swaps/createSwap")
      .send(invalidSwap)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(result.statusCode).toEqual(500);
  });
});

describe("GET /api/swaps/get", () => {
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(AdminTestUser);
    token = result.body.token;
  });

  it("should fetch all swaps", async () => {
    const response = await request(router)
      .get("/api/swaps/getSwaps")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.swaps)).toBeTruthy();
    expect(response.body.count).toBeDefined();
  });
});

describe("GET /api/swaps/status/:status", () => {
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should fetch swaps by status", async () => {
    const status = "pending";
    const response = await request(router)
      .get(`/api/swaps/getSwapByStatus`)
      .send({ status: status })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.swaps)).toBeTruthy();
  });
});

describe("GET /api/swaps/:swapId", () => {
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should fetch a swap by ID", async () => {
    const swapId = JestTestSwap._id;
    const response = await request(router)
      .get(`/api/swaps/getSwapById/${swapId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add assertions to validate the response body
  });

  it("should return 404 for a non-existent swap ID", async () => {
    const nonExistentSwapId = "nonExistentId";
    const response = await request(router)
      .get(`/api/swaps/getSwapById/${nonExistentSwapId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("PATCH /api/swaps/:swapId", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should update a swap", async () => {
    const swapId = JestTestSwap._id;
    const updateData = { status: "accepted" };
    const response = await request(router)
      .patch(`/api/swaps/updateSwap/${swapId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add more assertions as necessary
  });

  it("should return 404 for a non-existent swap ID", async () => {
    const nonExistentSwapId = "nonExistentId";
    const updateData = { status: "accepted" };
    const response = await request(router)
      .patch(`/api/swaps/updateSwap/${nonExistentSwapId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});
