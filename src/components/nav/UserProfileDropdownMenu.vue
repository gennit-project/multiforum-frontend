<script>
import { defineComponent } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import MenuButton from "../generic/MenuButton.vue";
import ProfileAvatar from "../user/ProfileAvatar.vue";

export default defineComponent({
  components: {
    MenuButton,
    ProfileAvatar
},
  props: {
    modName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
    }
  },
  setup(props) {
    const { isAuthenticated, logout } = useAuth0();

    let menuItems = [
      {
        label: 'My Profile',
        value: `/u/${props.username}`,
      },
      {
        label: 'Sign out',
        value: '/logout',
      },
    ]

    if (props.modName) {
      menuItems = [
        {
          label: 'My Profile',
          value: `/u/${props.username}`,
        },
        {
          label: 'My Mod Profile',
          value: `/mod/${props.modName}`,
        },
        {
          label: 'Sign Out',
          value: '/logout',
        },
      ]
    }

    return {
      isAuthenticated,
      logout: () => {
        logout({ returnTo: "http://localhost:5173/logout" });
      },
      menuItems
    };
  },
});
</script>
<template>
  <MenuButton
    :items="menuItems"
  >
<ProfileAvatar />
</MenuButton>
</template>
