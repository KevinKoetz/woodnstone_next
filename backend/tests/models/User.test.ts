import mongoose from "mongoose";
import User from "../../src/models/User";
import { MongoMemoryServer } from "mongodb-memory-server";
import { performance } from "perf_hooks";

let mongo: MongoMemoryServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const url = mongo.getUri();
  await mongoose.connect(url);
});

beforeEach(async () => {
  if (mongo) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongoose.disconnect();
    await mongo.stop();
  }
});

describe("User Model should", () => {
  test("not throw when supplied with valid input.", async () => {
    let err;
    try {
      const user = await new User({
        email: "kevin@example.com",
        role: "root",
      });
      await user.setPassword("1234");
      await user.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBe(undefined);
  });

  test("provide a query helper to get by mail", async () => {
    let err;
    let id;
    try {
      const user = await new User({
        email: "kevin@example.com",
        role: "root",
      });
      id = user._id;
      await user.setPassword("1234");
      await user.save();
    } catch (error: any) {
      err = error;
    }
    User.findOne();
    const user = await User.find().byEmail("kevin@example.com").exec();
    expect(user).not.toBe(null);
    expect(user?.email).toBe("kevin@example.com");

    const user2 = await User.find().byEmail("awdwa@dwadwa.com").exec();
    expect(user2).toBe(null);
  });
});

describe("User Model should check uniqueness for", () => {
  test("email", async () => {
    let err;
    try {
      const user1 = await new User({
        email: "kevin@example.com",
        role: "root",
      });
      await user1.setPassword("1234");
      await user1.save();

      const user2 = await new User({
        email: "kevin@example.com",
        role: "root",
      });
      await user2.setPassword("1234");
      await user2.save();
    } catch (error: any) {
      err = error;
    }
    expect(err.message).toBe(
      'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "kevin@example.com" }'
    );
  });
});

describe("User Model should require a", () => {
  test("password.hash", async () => {
    let err;
    try {
      await User.validate({});
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("password.hash");
  });

  test("password.salt", async () => {
    let err;
    try {
      await User.validate({});
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("password.salt");
  });

  test("email", async () => {
    let err;
    try {
      await User.validate({});
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });

  test("role", async () => {
    let err;
    try {
      await User.validate({});
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("role");
  });
});

describe("User Models role should accept a", () => {
  test("root role", async () => {
    let err;
    try {
      const user = new User({
        email: "kevin.koetz@example.com",
        role: "root",
      });
      await user.setPassword("1234");
      await user.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBe(undefined);
  });

  test("admin role", async () => {
    let err;
    try {
      const user = new User({
        email: "kevin.koetz@example.com",
        role: "admin",
      });
      await user.setPassword("1234");
      await user.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBe(undefined);
  });

  test("customer role", async () => {
    let err;
    try {
      const user = new User({
        email: "kevin.koetz@example.com",
        role: "customer",
      });
      await user.setPassword("1234");
      await user.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBe(undefined);
  });

  test("no other role", async () => {
    let err;
    try {
      const user = new User({
        email: "kevin.koetz@example.com",
        role: (Math.random() * 9999).toString(),
      });
      await user.setPassword("1234");
      await user.validate();
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("role");
  });
});

describe("User Model should secure the password by", () => {
  async function verifyPasswordApi(email: string, password: string) {
    return User.verifyPassword(email, password);
  }

  test("having a instance Method to set the password", () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    expect(user.setPassword).toBeInstanceOf(Function);
  });

  test("having a static Method to verify the password", () => {
    expect((User as any).verifyPassword).toBeInstanceOf(Function);
  });

  test("making sure that the verify password API takes the same time no matter if the user exists or not", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("123456");
    await user.save();

    const startAvailable = performance.now();
    for (let iteration = 0; iteration < 20; iteration++) {
      await verifyPasswordApi("kevin@example.com", "123456");
    }
    const endAvailable = performance.now();
    const startUnavailable = performance.now();
    for (let iteration = 0; iteration < 20; iteration++) {
      await verifyPasswordApi("notthere@example.com", "123456");
    }
    const endUnavailable = performance.now();

    const availableTime = endAvailable - startAvailable;
    const unavailableTime = endUnavailable - startUnavailable;

    const midPoint = (availableTime + unavailableTime) / 2;
    const minDeviation = midPoint - midPoint * 0.1;
    const maxDeviation = midPoint + midPoint * 0.1;
    console.log(availableTime);
    console.log(unavailableTime);
    
    expect(availableTime <= maxDeviation && availableTime >= minDeviation).toBe(
      true
    );
    expect(
      unavailableTime <= maxDeviation && unavailableTime >= minDeviation
    ).toBe(true);
  });

  test("storing it hashed", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("1234");
    const password = (user as any).password;
    expect(password).not.toBe("1234");
    expect(password.toString()).not.toBe("1234");
    expect(password).toBeInstanceOf(Object);
    expect(password.salt).toBeInstanceOf(Buffer);
    expect(password.hash).toBeInstanceOf(Buffer);
    expect(password.salt.toString()).not.toBe("1234");
    expect(password.hash.toString()).not.toBe("1234");
  });

  test("using a 16 byte salt and 64 byte hash", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("1234");
    const password = (user as any).password;
    const { salt, hash } = password;
    expect(salt.length).toBe(16);
    expect(hash.length).toBe(64);
  });

  test("letting the verify function return the User without the password key for correct passwords", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("1234");
    await user.save()
    const verifiedUser = await User.verifyPassword("kevin@example.com","1234")
    expect(verifiedUser).toMatchObject({email: "kevin@example.com", role: "root"})
    expect((verifiedUser as any).password).toBe(undefined)
    
  });

  test("letting the verify function return null for incorrect passwords", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("1234");
    await user.save()
    expect(await User.verifyPassword("kevin@example.com","password")).toBe(null);
  });

  test("not selecting it when user is querried", async () => {
    const user = new User({ email: "kevin@example.com", role: "root" });
    await user.setPassword("1234");
    await user.save();
    const userFromDb = await User.find().byEmail("kevin@example.com").exec();
    expect((userFromDb as any).password.hash).toBe(undefined);
    expect((userFromDb as any).password.salt).toBe(undefined);
  });
});

describe("User Model should validate the email by rejecting when", () => {
  test("@ is missing", async () => {
    let err;
    try {
      await User.validate({
        email: "kevin.koetzexample.com",
        password: "123",
        role: "root",
      });
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });

  test("domain is missing", async () => {
    let err;
    try {
      await User.validate({
        email: "kevin.koetz@",
        password: "123",
        role: "root",
      });
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });

  test("dot is at domain end", async () => {
    let err;
    try {
      await User.validate({
        email: "kevin.koetz@a.",
        password: "123",
        role: "root",
      });
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });

  test("name is missing", async () => {
    let err;
    try {
      await User.validate({
        email: "@example.com",
        password: "123",
        role: "root",
      });
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });

  test("dot is after @", async () => {
    let err;
    try {
      await User.validate({
        email: "a@.example",
        password: "123",
        role: "root",
      });
    } catch (error: any) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(Object.keys(err.errors)).toContain("email");
  });
});
