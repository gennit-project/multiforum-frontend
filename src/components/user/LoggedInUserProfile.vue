
  <script>
import { useAuth0 } from "@auth0/auth0-vue";

export default {
  setup() {
    const { loginWithRedirect, user, isAuthenticated } = useAuth0();

    return {
      isAuthenticated,
      login: () => {
        loginWithRedirect();
      },
      user,
      tabs: [
        { name: "Profile", href: "/myProfile", current: true },
        // { name: 'Calendar', href: '#', current: false },
        // { name: 'Recognition', href: '#', current: false },
      ],
    };
  },
};
</script>
  <template>
  <div>
    <div v-if="!isAuthenticated" class="flex justify-center mx-auto m-8">
      <div class="block">
        <h1 class="text-lg my-2">To see your profile, you have to log in.</h1>
      </div>
    </div>
    <main
      v-if="isAuthenticated && user"
      class="
        relative
        z-0
        flex-1
        overflow-y-auto
        focus:outline-none
        xl:order-last
      "
    >
      <article>
        <!-- Profile header -->
        <div>
          <div>
            <div
              class="h-32 w-full object-cover lg:h-48 background"
              alt="background pattern"
            />
          </div>
          <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
              <div class="flex">
                <img
                  class="
                    h-24
                    w-24
                    rounded-full
                    ring-4 ring-white
                    sm:h-32 sm:w-32
                  "
                  :src="user.picture"
                  alt="User profile picture"
                />
              </div>
              <div
                class="
                  mt-6
                  sm:flex
                  sm:min-w-0
                  sm:flex-1
                  sm:items-center
                  sm:justify-end
                  sm:space-x-6
                  sm:pb-1
                "
              >
                <div class="mt-6 min-w-0 flex-1 sm:hidden 2xl:block">
                  <h1 class="truncate text-2xl font-bold text-gray-900">
                    {{
                      user["https://dgraph.io/jwt/claims"]?.username
                        ? user["https://dgraph.io/jwt/claims"]?.username
                        : user.name
                    }}
                  </h1>
                </div>
              </div>
            </div>
            <div class="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
              <h1 class="truncate text-2xl font-bold text-gray-900">
                {{
                  user["https://dgraph.io/jwt/claims"]?.username
                    ? user["https://dgraph.io/jwt/claims"]?.username
                    : user.name
                }}
              </h1>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-6 sm:mt-2 2xl:mt-5">
          <div class="border-b border-gray-200">
            <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <a
                  v-for="tab in tabs"
                  :key="tab.name"
                  :href="tab.href"
                  :class="[
                    tab.current
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  ]"
                  :aria-current="tab.current ? 'page' : undefined"
                  >{{ tab.name }}</a
                >
              </nav>
            </div>
          </div>
        </div>

        <!-- Description list -->
        <div class="mx-auto mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <!-- <div
              v-for="field in Object.keys(profile.fields)"
              :key="field"
              class="sm:col-span-1"
            >
              <dt class="text-sm font-medium text-gray-500">{{ field }}</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ profile.fields[field] }}
              </dd>
            </div> -->
            <div class="sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd
                class="mt-1 max-w-prose space-y-5 text-sm text-gray-900"
                v-html="user.email"
              />
              <p class="mt-1 text-xs">
                {{
                  user.email_verified ? "Verified Email" : "Email not verified"
                }}
              </p>
            </div>
          </dl>
        </div>
      </article>
    </main>
  </div>
</template>
<style>
.background {
  background-color: #4474c0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='152' height='152' viewBox='0 0 152 152'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='temple' fill='%23efefef' fill-opacity='0.4'%3E%3Cpath d='M152 150v2H0v-2h28v-8H8v-20H0v-2h8V80h42v20h20v42H30v8h90v-8H80v-42h20V80h42v40h8V30h-8v40h-42V50H80V8h40V0h2v8h20v20h8V0h2v150zm-2 0v-28h-8v20h-20v8h28zM82 30v18h18V30H82zm20 18h20v20h18V30h-20V10H82v18h20v20zm0 2v18h18V50h-18zm20-22h18V10h-18v18zm-54 92v-18H50v18h18zm-20-18H28V82H10v38h20v20h38v-18H48v-20zm0-2V82H30v18h18zm-20 22H10v18h18v-18zm54 0v18h38v-20h20V82h-18v20h-20v20H82zm18-20H82v18h18v-18zm2-2h18V82h-18v18zm20 40v-18h18v18h-18zM30 0h-2v8H8v20H0v2h8v40h42V50h20V8H30V0zm20 48h18V30H50v18zm18-20H48v20H28v20H10V30h20V10h38v18zM30 50h18v18H30V50zm-2-40H10v18h18V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>