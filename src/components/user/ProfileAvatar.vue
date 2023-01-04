<script lang="ts">
import { defineComponent } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import UserCircle from '@/components/icons/UserCircle.vue'

export default defineComponent({
  components: {
    UserCircle
  },
  setup(){
    const { isAuthenticated, user } = useAuth0()

    return {
      isAuthenticated, user
    }
  }
})
</script>
<template>

  <UserCircle v-if="!isAuthenticated || !user || !user.picture" class="h-8 w-8"/>
    <img
      v-else-if="user && user.picture"
      class="h-8 w-8 rounded-full"
      :src="user.picture"
      alt=""
    />
</template>