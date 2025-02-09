import { whoj } from '@whoj/eslint-config';
import _defaults from "../../eslint.config.js";

export default whoj({
  isInEditor: true
}).append(_defaults);
