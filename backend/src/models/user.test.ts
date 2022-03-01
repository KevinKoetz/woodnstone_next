import mongoose from "mongoose";
import User from "./user";
import { MongoMemoryServer } from "mongodb-memory-server";
import exp from "constants";

(async () => {
  let mongo: MongoMemoryServer;

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
    test("password", async () => {
      let err;
      try {
        await User.validate({});
      } catch (error: any) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(Object.keys(err.errors)).toContain("password");
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
    test("having a instance Method to set the password", () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      expect(user.setPassword).toBeInstanceOf(Function);
    });

    test("having a instance Method to verify the password", () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      expect(user.verifyPassword).toBeInstanceOf(Function);
    });

    test("storing it hashed", async () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      await user.setPassword("1234");
      const password = (user as any).password;
      expect(password).not.toBe("1234");
      expect(password).toBeInstanceOf(Buffer);
      expect(password.toString()).not.toBe("1234");
    });

    test("using a 16 byte salt and 64 byte hash", async () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      await user.setPassword("1234");
      const password = (user as any).password;
      expect(password.length).toBe(16 + 64);
      const salt = password.slice(0, 16);
      const hash = password.slice(16, 16 + 64);
      expect(salt.length).toBe(16);
      expect(hash.length).toBe(64);
    });

    test("letting the verify function return true for correct passwords", async () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      await user.setPassword("1234");
      expect(await user.verifyPassword("1234")).toBe(true);
    });

    test("letting the verify function return false for incorrect passwords", async () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      await user.setPassword("1234");
      expect(await user.verifyPassword("password")).toBe(false);
    });

    test("not selecting it when user is querried", async () => {
      const user = new User({ email: "kevin@example.com", role: "root" });
      await user.setPassword("1234");
      await user.save();
      const userFromDb = await User.find().byEmail("kevin@example.com").exec();
      expect((userFromDb as any).password).toBe(undefined);
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
})();
