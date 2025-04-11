import { Router } from "express";
import { deleteUser } from "../controllers/admin.controller";
import { isUserAuthenticated } from "../middlewares/authentication";
import { authorizeRoleAdmin } from "../middlewares/admin-auth";

const adminRouter = Router();

adminRouter.delete(
  "/delete-user/:userId",
  isUserAuthenticated,
  authorizeRoleAdmin("admin"),
  deleteUser
);

export default adminRouter;
