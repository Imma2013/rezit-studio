import type { VectorPath } from "@hc/schema";
import type { Point } from "./types";
export type ConnectorRoute = "straight" | "elbow" | "curved";
export declare function routeConnector(start: Point, end: Point, route: ConnectorRoute): VectorPath;
