import { WildsScene } from "./WildsScene";
import { WEST_WILDS_LEVEL } from "../data/levels";
import { WILDS_THEME_3D } from "../three/themes3D";

export class WestWildsScene extends WildsScene {
  constructor() {
    super("WestWilds", WEST_WILDS_LEVEL, WILDS_THEME_3D);
  }
}
