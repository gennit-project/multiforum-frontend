<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import { useQuery, useResult } from "@vue/apollo-composable";
import { GET_DISCUSSION } from "@/graphQLData/discussion/queries";
const Markdown = require("vue3-markdown-it").default;


export default defineComponent({
  components: {
    Markdown
  },
  setup() {
    const route = useRoute();
    const discussionId = computed(() => {
      return route.params.discussionId;
    });
    const { result, loading } = useQuery(GET_DISCUSSION, { id: discussionId });

    const body = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.body || ""
    );
    const title = useResult(
      result,
      null,
      (data: any) => data.discussions[0]?.title || ""
    );
    return {
      body,
      title,
      discussionId,
      loading,
      result,
    };
  },
});
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="pb-5 border-b border-gray-200">
      <h1 class="text-lg leading-6 font-medium text-gray-900">{{ title }}</h1>
    </div>

    <div v-if="loading">Loading...</div>
    
    <div class="mt-6 prose prose-indigo prose-lg text-gray-500">
      <Markdown
        v-if="body"
        :source="body"
        linkify
        html
      />
    </div>
      <!-- <div>
        <p>
          Faucibus commodo massa rhoncus, volutpat.
          <strong>Dignissim</strong> sed <strong>eget risus enim</strong>.
          Mattis mauris semper sed amet vitae sed turpis id. Id dolor praesent
          donec est. Odio penatibus risus viverra tellus varius sit neque erat
          velit. Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget
          risus enim. <a href="#">Mattis mauris semper</a> sed amet vitae sed
          turpis id.
        </p>
        <ul role="list">
          <li>Quis elit egestas venenatis mattis dignissim.</li>
          <li>Cras cras lobortis vitae vivamus ultricies facilisis tempus.</li>
          <li>Orci in sit morbi dignissim metus diam arcu pretium.</li>
        </ul>
        <p>
          Quis semper vulputate aliquam venenatis egestas sagittis quisque orci.
          Donec commodo sit viverra aliquam porttitor ultrices gravida eu.
          Tincidunt leo, elementum mattis elementum ut nisl, justo, amet,
          mattis. Nunc purus, diam commodo tincidunt turpis. Amet, duis sed elit
          interdum dignissim.
        </p>
        <h2>From beginner to expert in 30 days</h2>
        <p>
          Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam consequat
          in. Convallis arcu ipsum urna nibh. Pharetra, euismod vitae interdum
          mauris enim, consequat vulputate nibh. Maecenas pellentesque id sed
          tellus mauris, ultrices mauris. Tincidunt enim cursus ridiculus mi.
          Pellentesque nam sed nullam sed diam turpis ipsum eu a sed convallis
          diam.
        </p>
        <blockquote>
          <p>
            Sagittis scelerisque nulla cursus in enim consectetur quam. Dictum
            urna sed consectetur neque tristique pellentesque. Blandit amet, sed
            aenean erat arcu morbi.
          </p>
        </blockquote>
        <p>
          Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus
          enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor
          praesent donec est. Odio penatibus risus viverra tellus varius sit
          neque erat velit.
        </p>
        <figure>
          <img
            class="w-full rounded-lg"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1310&h=873&q=80&facepad=3"
            alt=""
            width="1310"
            height="873"
          />
          <figcaption>
            Sagittis scelerisque nulla cursus in enim consectetur quam.
          </figcaption>
        </figure>
        <h2>Everything you need to get up and running</h2>
        <p>
          Purus morbi dignissim senectus mattis <a href="#">adipiscing</a>.
          Amet, massa quam varius orci dapibus volutpat cras. In amet eu
          ridiculus leo sodales cursus tristique. Tincidunt sed tempus ut
          viverra ridiculus non molestie. Gravida quis fringilla amet eget dui
          tempor dignissim. Facilisis auctor venenatis varius nunc, congue erat
          ac. Cras fermentum convallis quam.
        </p>
        <p>
          Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus
          enim. Mattis mauris semper sed amet vitae sed turpis id. Id dolor
          praesent donec est. Odio penatibus risus viverra tellus varius sit
          neque erat velit.
        </p>
      </div>
    </div> -->
  </div>
</template>