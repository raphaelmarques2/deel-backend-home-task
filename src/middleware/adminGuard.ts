import { NextFunction, Request, Response } from "express";
import { Profile } from "../model";

export const adminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.get("profile_id");
  const isAdmin = id === "999";

  if (!isAdmin) return res.status(401).end();

  next();
};
