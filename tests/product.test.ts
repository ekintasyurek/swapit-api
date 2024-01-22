import request from "supertest";
import router from "../source/server";
import {
  ValidProduct,
  InValidProduct,
  IProduct,
  JestTestProduct,
} from "./mocks/product";
import { JestTestUser } from "./mocks/user";

describe("Product", () => {
  let validProduct: IProduct = new ValidProduct();
  const invalidProduct = new InValidProduct();
  let token: string;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
    validProduct.user = result.body.user._id;
  });

  it("Create valid product Successfully", async () => {
    const result = await request(router)
      .post("/api/products/createProduct")
      .send(validProduct)
      .set("Authorization", `Bearer ${token}`);
    expect(result.body.product.name).toEqual(validProduct.name);
    expect(result.body.product.description).toEqual(validProduct.description);
    expect(result.body.product.category).toEqual(validProduct.category);
    expect(result.statusCode).toEqual(201);
  });

  it("Fails to Create Invalid product", async () => {
    const result = await request(router)
      .post("/api/products/createProduct")
      .send(invalidProduct)
      .set("Authorization", `Bearer ${token}`);
    expect(result.statusCode).toEqual(500);
  });
});

describe("GET /api/products", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should fetch all products", async () => {
    const response = await request(router)
      .get("/api/products/getProducts")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.products)).toBeTruthy();
    expect(response.body.count).toBeDefined();
  });
});

describe("GET /api/products/category", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should fetch products by category", async () => {
    const category = "furniture";
    const response = await request(router)
      .get(`/api/products/getProductByCategory`)
      .send({ category: category })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body.products)).toBeTruthy();
    // You can add more specific checks here if needed
  });
});

describe("GET /api/products/:productId", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should fetch a product by ID", async () => {
    const productId = JestTestProduct._id;
    const response = await request(router)
      .get(`/api/products/getProductById/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add assertions to validate the response body
  });

  it("should return 404 for a non-existent product ID", async () => {
    const nonExistentProductId = "nonExistentId";
    const response = await request(router)
      .get(`/api/products/getProductById/${nonExistentProductId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("PATCH /api/products/:productId", () => {
  let token: string;
  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
  });

  it("should update a product", async () => {
    const productId = JestTestProduct._id;
    const updateData = { name: "New Name", description: "New Description" };
    const response = await request(router)
      .patch(`/api/products/updateProduct/${productId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    // Add more assertions as necessary
  });

  it("should return 404 for a non-existent product ID", async () => {
    const nonExistentProductId = "nonExistentId";
    const updateData = { name: "New Name", description: "New Description" };
    const response = await request(router)
      .patch(`/api/products/${nonExistentProductId}`)
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("DELETE /api/products/:productId", () => {
  let token: string;
  let validProduct: IProduct = new ValidProduct();
  let createdProduct: any;

  beforeAll(async () => {
    const result = await request(router)
      .post("/api/auths/login")
      .send(JestTestUser);
    token = result.body.token;
    validProduct.user = result.body.user._id;

    createdProduct = await request(router)
      .post("/api/products/createProduct")
      .send(validProduct)
      .set("Authorization", `Bearer ${token}`);
    console.log(`ekin`, createdProduct.body);
  });

  it("should delete a product", async () => {
    const productId = createdProduct.body.product._id;
    const response = await request(router)
      .delete(`/api/products/deleteProduct/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });

  it("should return 404 for a non-existent product ID", async () => {
    const nonExistentProductId = "nonExistentId";
    const response = await request(router)
      .delete(`/api/products/deleteProduct/${nonExistentProductId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(404);
  });
});
