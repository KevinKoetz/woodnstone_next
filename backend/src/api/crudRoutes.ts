import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { CloudinaryStorage, Options } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { authenticateBearer, determineUserAbility } from "../middlewares/auth";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";
import { ForbiddenError } from "@casl/ability";

//Setup CRUD Routes for all mongoose models.


const models = mongoose.models as {
  [modelName: string]: mongoose.Model<any, AccessibleRecordModel<any>>;
};

const storageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "woodnstone",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
} as Options);

const upload = multer({
  storage: storageCloudinary,
});

//Determine which multer middleware to use based on the inputType and type keys defined on the schema paths
const getMulterMiddleware = (schema: any) => {
  const pathsWithFileInput = getPathsWithFileInput(schema);
  if (
    pathsWithFileInput.length === 1 &&
    Array.isArray(schema[pathsWithFileInput[0]].type)
  )
    return upload.array(pathsWithFileInput[0]);
  if (
    pathsWithFileInput.length === 1 &&
    !Array.isArray(schema[pathsWithFileInput[0]].type)
  )
    return upload.single(pathsWithFileInput[0]);
  if (pathsWithFileInput.length > 1)
    return upload.fields(pathsWithFileInput.map((path) => ({ name: path })));
  return multer().none();
};

//Get all Paths where the API expects file input
const getPathsWithFileInput = (schema: any) => {
  const pathsWithFileInput: string[] = [];
  for (const key in schema) {
    if (schema[key]?.inputType !== "file") continue;

    pathsWithFileInput.push(key);
  }
  return pathsWithFileInput;
};

const crudRoutes = express.Router();

Object.entries(models).forEach(([name, model]) => {
  const schemaObject = model.schema.obj;
  const multer = getMulterMiddleware(schemaObject);
  const pathsWithFileInput = getPathsWithFileInput(schemaObject);

  crudRoutes.use(`/${name}`, authenticateBearer({ allowGuestAccess: true }));

  crudRoutes.use(`/${name}`, determineUserAbility);

  crudRoutes.get(`/${name}`, async (req, res) => {
    if (!req.user) throw new Error("req.user undefined.");
    if (!req.user.ability) throw new Error("req.user.ability undefined.");

    try {
      const documents = await model
        .find()
        .accessibleBy(req.user.ability)
        .exec();
      return res.json(documents);
    } catch (error) {
      if (error instanceof ForbiddenError) return res.sendStatus(403);
      return res.status(500).json(error);
    }
  });

  crudRoutes.get(`/${name}/:id`, async (req, res) => {
    if (!req.user) throw new Error("req.user undefined.");
    if (!req.user.ability) throw new Error("req.user.ability undefined.");
    try {
      const document = await model
        .findById(req.params.id)
        .accessibleBy(req.user.ability)
        .exec();
      if (!document) return res.sendStatus(404);
      res.json(document);
    } catch (error) {
      if (error instanceof ForbiddenError) return res.sendStatus(403);
      res.status(500).json(error);
    }
  });

  crudRoutes.post(`/${name}`, multer, async (req, res) => {
    if (!req.user) throw new Error("req.user undefined.");
    if (!req.user.ability) throw new Error("req.user.ability undefined.");

    try {
      const filePathToValue = pathsWithFileInput.reduce(
        (filePathToValue, path) => {
          //@ts-ignore
          if (Array.isArray(schemaObject[path]?.type)) {
            if (!Array.isArray(req.files)) return filePathToValue;
            filePathToValue[path] = req.files.map((file) => file.path);
            return filePathToValue;
          }
          if (!req.file) return filePathToValue;
          filePathToValue[path] = req.file.path;
          return filePathToValue;
        },
        {} as { [key: string]: string | string[] }
      );

      const document = new model({ ...req.body, ...filePathToValue });
      if (req.user.ability.cannot("create", document))
        return res.sendStatus(403);
      await document.save();
      return res.json(await model.findById(document._id));
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  crudRoutes.patch(`/${name}/:id`, multer, async (req, res) => {
    if (!req.user) throw new Error("req.user undefined.");
    if (!req.user.ability) throw new Error("req.user.ability undefined.");
    try {
      const document = await model
        .findById(req.params.id)
        .accessibleBy(req.user.ability)
        .exec();

      if (req.user.ability.cannot("update", document))
        return res.sendStatus(403);

      const filePathToValue = pathsWithFileInput.reduce(
        (filePathToValue, path) => {
          //@ts-ignore
          if (Array.isArray(schemaObject[path]?.type)) {
            if (!Array.isArray(req.files)) return filePathToValue;
            filePathToValue[path] = req.files.map((file) => file.path);
            return filePathToValue;
          }
          if (!req.file) return filePathToValue;
          filePathToValue[path] = req.file.path;
          return filePathToValue;
        },
        {} as { [key: string]: string | string[] }
      );

      const updateObject = { ...req.body, ...filePathToValue };
      for (const key in updateObject) {
        if (req.user.ability.cannot("update", document, key))
          return res.sendStatus(403);
      }

      document.set(updateObject);
      await document.save()
      res.json(document);
    } catch (error) {
      if (error instanceof ForbiddenError) return res.sendStatus(403);
      if (error instanceof mongoose.Error.ValidationError)
        return res.status(400).send(error.message);
      res.status(500).json(error);
    }
  });

  crudRoutes.delete(`/${name}/:id`, async (req, res) => {
    if (!req.user) throw new Error("req.user undefined.");
    if (!req.user.ability) throw new Error("req.user.ability undefined.");

    try {
      const document = await model
        .findById(req.params.id)
        .accessibleBy(req.user.ability)
        .exec();
      if (!document) return res.sendStatus(404);
      if (!req.user.ability.can("delete", document)) return res.sendStatus(403);
      await document.delete();
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof ForbiddenError) return res.sendStatus(403);
      res.status(500).json(error);
    }
  });
});

export default crudRoutes;
