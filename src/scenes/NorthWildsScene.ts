import { WildsScene } from "./WildsScene";
import { NORTH_WILDS_LEVEL } from "../data/levels";
import { WILDS_THEME_3D } from "../three/themes3D";

export class NorthWildsScene extends WildsScene {
  constructor() {
    super("NorthWilds", NORTH_WILDS_LEVEL, WILDS_THEME_3D);
  }
}
