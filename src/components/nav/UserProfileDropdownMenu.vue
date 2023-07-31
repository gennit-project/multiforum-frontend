<script>
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import Avatar from "../user/Avatar.vue";
import IconButtonDropdown from "../generic/IconButtonDropdown.vue";

export default defineComponent({
  components: {
    IconButtonDropdown,
    Avatar,
  },
  props: {
    modName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { isAuthenticated, logout } = useAuth0();

    let menuItems = [
      {
        label: "My Profile",
        value: `/u/${props.username}/comments`,
      },
      {
        label: "Sign out",
        value: "/logout",
      },
    ];

    if (props.modName) {
      menuItems = [
        {
          label: "My Profile",
          event: "goToUserProfile",
        },
        {
          label: "My Mod Profile",
          event: "goToModProfile",
        },
        {
          label: "Sign Out",
          event: "logout",
        },
      ];
    }

    return {
      isAuthenticated,
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      menuItems,
    };
  },
  methods: {
    goToModProfile(){
      this.$router.push(`/mod/${this.modName}`);
    },
    goToUserProfile(){
      this.$router.push(`/u/${this.username}/comments`);
    }
  }
});
</script>
<template>
  <IconButtonDropdown
    :items="menuItems"
    @logout="logout"
    @goToUserProfile="goToUserProfile"
    @goToModProfile="goToModProfile"
  >
    <Avatar :text="username"/>
  </IconButtonDropdown>
</template>
