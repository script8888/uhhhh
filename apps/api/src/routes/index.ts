import { Router } from "express";
import listRoutes from "@kamalyb/express-list-routes";
import { router as RoomRouter } from "../modules/room/room.route";
import { useGlobalErrorHandler } from "../middlewares/error";
import { NotFoundError } from "@kamalyb/errors";
import * as Sentry from "@sentry/node";

export const router = Router();

router.use("/api/rooms", RoomRouter);

router.use(Sentry.Handlers.errorHandler());

router.use((_, __, ___) => {
  throw new NotFoundError("no route found");
});

router.use(useGlobalErrorHandler);

listRoutes(router);
