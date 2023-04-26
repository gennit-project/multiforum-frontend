
  
  <script lang="ts">
  import { VueShowdown } from 'vue-showdown';
  import 'github-markdown-css';
  
  export default {
    components: {
      VueShowdown,
    },
    props: {
        text: {
            type: String,
            default: '',
        },
    },
  };
  </script>
  
  <template>
    <div class="github-readme github-markdown-light dark:github-markdown-dark">
      <VueShowdown :markdown="text" />
    </div>
  </template>
  