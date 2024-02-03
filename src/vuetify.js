import {createVuetify} from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import {aliases, md} from "vuetify/iconsets/md";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
    },
  },
})

export default vuetify