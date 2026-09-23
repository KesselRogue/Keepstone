import { WildsScene } from "./WildsScene";
import { EAST_WILDS_LEVEL } from "../data/levels";
import { WILDS_THEME_3D } from "../three/themes3D";

export class EastWildsScene extends WildsScene {
  constructor() {
    super("EastWilds", EAST_WILDS_LEVEL, WILDS_THEME_3D);
  }
}
