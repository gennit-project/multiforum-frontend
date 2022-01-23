<script lang="ts">
import { defineComponent, ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { useRoute } from "vue-router";
import { ChannelData } from "@/types/channelTypes";
import { TagData } from "@/types/tagTypes";
import CancelButton from "@/components/buttons/CancelButton.vue"
import SaveButton from "@/components/buttons/SaveButton.vue"
import TextEditor from "@/components/forms/TextEditor.vue";
import FormTitle from "@/components/forms/FormTitle.vue";
import FormRow from "@/components/forms/FormRow.vue";
import Form from "@/components/forms/Form.vue";
const { DateTime } = require("luxon");

const MINUTES_IN_A_DAY = 1440;

export default defineComponent({
  name: "CreateEditEvent",
  components: { TextEditor, Form, FormTitle, FormRow, CancelButton, SaveButton },
  setup() {
    const now = DateTime.now();

    const route = useRoute();

    const channelId = route.params.channelId;

    const username = "cluse";

    const title = ref("");
    const description = ref("");

    const defaultStartTimeObj = now.startOf("hour").plus({ hours: 1 });
    const defaultStartTimeISO = defaultStartTimeObj.toISO();
    const startTime = ref(defaultStartTimeISO);

    const getStartTimePieces = (defaultStartTimeObj: typeof DateTime) => {
      const { year, month, day, weekday, hour } = defaultStartTimeObj;

      return {
        startTimeYear: year.toString(),
        startTimeMonth: month.toString(),
        startTimeDayOfMonth: day.toString(),
        startTimeDayOfWeek: weekday.toString(),
        startTimeHourOfDay: hour,
      };
    };

    const startTimePieces = ref(getStartTimePieces(defaultStartTimeObj));

    const defaultEndTimeISO = defaultStartTimeObj.plus({ minutes: 30 }).toISO();
    const endTime = ref(defaultEndTimeISO);

    const locationName = ref("");
    const address = ref("");
    const placeId = ref("");

    // const howToFindLocation = ref("");
    const virtualEventUrl = ref("");

    const isInPrivateResidence = ref("false");

    const cost = ref("0");

    const latitude = ref("");
    const longitude = ref("");
    const selectedChannels = ref(channelId ? [channelId] : []);
    const selectedTags = ref([]);

    const channelList = ref([]);
    const tagList = ref([]);

    const GET_CHANNEL_NAMES = gql`
      query getChannelNames {
        queryChannel {
          uniqueName
        }
      }
    `;

    const {
      loading: channelLoading,
      error: channelError,
      result: channelData,
    } = useQuery(GET_CHANNEL_NAMES);

    if (channelData.value) {
      channelList.value = channelData.value.queryChannel.map(
        (channelData: ChannelData) => channelData.uniqueName
      );
    }

    const GET_TAGS = gql`
      query getTags {
        queryTag {
          text
        }
      }
    `;

    const {
      loading: tagsLoading,
      error: tagsError,
      result: tagsData,
    } = useQuery(GET_TAGS);

    if (tagsData.value) {
      const tagOptions = tagsData.value.queryTag.map(
        (tag: TagData) => tag.text
      );
      tagList.value = tagOptions;
    }

    const getCommentSectionObjects = (newEventId: string) => {
      return selectedChannels.value.map((c) => {
        return {
          id: newEventId + c,
          Event: {
            id: newEventId,
          },
          Channel: {
            uniqueName: c,
          },
        };
      });
    };

    // let touched = ref({
    //   title: false,
    //   startDate: false,
    //   startTime: false,
    //   endTime: false,
    //   virtualEventUrl: false,
    //   address: false,
    // });

    const variablesForAnyEvent = {
      poster: username,
      createdDate: DateTime.now().toISO(),
      title: title.value,
      description: description.value,
      startTime: startTime.value,
      endTime: endTime.value,
      startTimeYear: startTimePieces.value.startTimeYear,
      startTimeMonth: startTimePieces.value.startTimeMonth,
      startTimeDayOfMonth: startTimePieces.value.startTimeDayOfMonth,
      startTimeDayOfWeek: startTimePieces.value.startTimeDayOfWeek,
      startTimeHourOfDay: startTimePieces.value.startTimeHourOfDay,
      Channels: selectedChannels.value.map((c) => {
        return { uniqueName: c };
      }),
      Tags: selectedTags.value.map((t) => {
        return { text: t };
      }),
      cost,
      canceled: false,
      virtualEventUrl,
    };

    const variablesForEventWithLocation = {
      locationName,
      address,
      isInPrivateResidence,
      placeId,
      location: {
        latitude,
        longitude,
      },
    };

    const getVariablesForAddEvent = () => {
      if (latitude.value && longitude.value) {
        return {
          ...variablesForAnyEvent,
          ...variablesForEventWithLocation,
        };
      }
      return variablesForAnyEvent;
    };

    const ADD_COMMENT_SECTION = gql`
      mutation addCommentSection(
        $commentSectionObjects: [AddCommentSectionInput!]!
      ) {
        addCommentSection(input: $commentSectionObjects, upsert: true) {
          commentSection {
            id
            Channel {
              url
            }
            CommentsAggregate {
              count
            }
            Discussion {
              id
            }
            Event {
              id
            }
            Comments {
              id
              text
              UserAuthor {
                username
              }
              Channel {
                uniqueName
              }
              deleted
              createdDate
              editedDate
              Tags {
                text
              }
            }
          }
        }
      }
    `;

    const { mutate: addCommentSection } = useMutation(ADD_COMMENT_SECTION);

    const ADD_EVENT = gql`
      mutation addEvent(
        $title: String!
        $description: String
        $startTime: DateTime!
        $startTimeYear: String!
        $startTimeMonth: String!
        $startTimeDayOfMonth: String!
        $startTimeDayOfWeek: String!
        $startTimeHourOfDay: Int!
        $endTime: DateTime!
        $Communities: [CommunityRef!]
        $Tags: [TagRef!]
        $locationName: String
        $address: String
        $howToFindLocation: String
        $virtualEventUrl: String
        $organizer: String!
        $createdDate: DateTime!
        $isInPrivateResidence: Boolean
        $cost: String
        $placeId: String
        $location: PointRef
      ) {
        addEvent(
          input: [
            {
              title: $title
              description: $description
              startTime: $startTime
              startTimeYear: $startTimeYear
              startTimeMonth: $startTimeMonth
              startTimeDayOfMonth: $startTimeDayOfMonth
              startTimeDayOfWeek: $startTimeDayOfWeek
              startTimeHourOfDay: $startTimeHourOfDay
              endTime: $endTime
              Communities: $Communities
              Tags: $Tags
              locationName: $locationName
              address: $address
              howToFindLocation: $howToFindLocation
              virtualEventUrl: $virtualEventUrl
              Organizer: { username: $organizer }
              createdDate: $createdDate
              isInPrivateResidence: $isInPrivateResidence
              cost: $cost
              placeId: $placeId
              location: $location
              canceled: false
            }
          ]
        ) {
          event {
            id
            title
            description
            Communities {
              url
            }
            Organizer {
              username
            }
            locationName
            address
            howToFindLocation
            startTime
            startTimeYear
            startTimeMonth
            startTimeDayOfMonth
            startTimeDayOfWeek
            startTimeHourOfDay
            endTime
            virtualEventUrl
            createdDate
            isInPrivateResidence
            cost
            placeId
            location {
              latitude
              longitude
            }
            canceled
            Tags {
              text
            }
          }
        }
      }
    `;

    const { mutate: addEvent } = useMutation(ADD_EVENT, {
      errorPolicy: "all",
      update(cache, { data: { addEvent } }) {
        const newEventId = addEvent.event[0].id;

        // Add a new comment section for each selected community.
        addCommentSection({
          variables: {
            commentSectionObjects: getCommentSectionObjects(newEventId),
          },
        });

        // If the event was created in the context
        // of a community, redirect to the community.
        if (channelId) {
          this.$router.push(`/c/${channelId}/event/${newEventId}`);
        } else {
          // If the event was created in the context
          // of the server-wide events page,
          // redirect to the first community that the
          // event was submitted to.
          this.$router.push(
            `/c/${selectedChannels.value[0]}/event/${newEventId}`
          );
        }
        const newEvent = addEvent.event[0];
        cache.modify({
          fields: {
            queryEvent(existingEventRefs = [], { readField }) {
              const newEventRef = cache.writeFragment({
                data: newEvent,
                fragment: gql`
                  fragment NewEvent on Events {
                    url
                  }
                `,
              });

              // Quick safety check - if the new event is already
              // present in the cache, we don't need to add it again.
              if (
                existingEventRefs.some(
                  (ref: any) => readField("id", ref) === addEvent.id
                )
              ) {
                return existingEventRefs;
              }
              return [newEventRef, ...existingEventRefs];
            },
          },
        });
      },
    });

    return {
      addEvent,
      channelId,
      channelError,
      channelLoading,
      getVariablesForAddEvent,
      now,
      startTime,
      address,
      placeId,
      latitude,
      longitude,
      tagsError,
      tagsLoading,
      virtualEventUrl,
    };
  },
  props: {
    mode: {
      type: String,
      default: "create",
    },
  },
  computed: {
    changesRequired() {
      // We do these checks:
      // - At least one community is selected
      // - Title is included
      // - Start date and time are in the future
      // - Either a valid event URL or an address is included
      // console.log('Debug changes required', {
      //   title,
      //   startTime,
      //   address,
      //   virtualEventUrl,
      //   selectedCommunities
      // })
      let now = DateTime.now().toISO();
      const needsChanges = !(
        this.selectedChannels.length > 0 &&
        this.title.length > 0 &&
        this.startTime > now &&
        ((this.address.length > 0 &&
          this.placeId &&
          this.latitude &&
          this.longitude) ||
          this.urlIsValid(this.virtualEventUrl))
      );
      return needsChanges;
    },
    endTimeISOs() {
      let endTimeISOs = [];
      let startTimeObject = DateTime.fromISO(this.startTime);

      // We generate a list of end times
      // at fifteen-minute intervals, starting with fifteen
      // minutes after the start time.
      for (let i = 30; i < MINUTES_IN_A_DAY; i += 30) {
        let endTimeObject = startTimeObject.plus({ minutes: i });
        let endTimeISO = endTimeObject.toISO();
        endTimeISOs.push(endTimeISO);
      }
      return endTimeISOs;
    },
    startTimeISOs() {
      // The intent is to allow a user to select
      // a start time for an event by clicking
      // one option. This is more convenient
      // than typing and also helps us prevent
      // invalid inputs.

      // To make this possible, we generate a list of
      // start times at thirty-minute intervals.

      let startTimeISOs = [];
      let startOfToday = DateTime.now().startOf("day");
      let startTimeObj = DateTime.fromISO(this.startTime);

      // If the start date is today, the options
      // are only for later today.
      if (startTimeObj.startOf("day").toISO() === startOfToday.toISO()) {
        let endOfDay = startTimeObj.endOf("day");
        let currentOption = startTimeObj.plus({ minutes: 60 });
        while (currentOption < endOfDay) {
          let optionAsISO = currentOption.toISO();
          startTimeISOs.push(optionAsISO);
          currentOption = currentOption.plus({ minutes: 120 });
        }
        return startTimeISOs;
      }

      // If the start date is after today, the options
      // can be any time during the day.
      let beginningOfDay = startTimeObj.startOf("day");
      for (let i = 0; i < MINUTES_IN_A_DAY; i += 120) {
        let startTimeObject = beginningOfDay.plus({ minutes: i });
        let startTimeISO = startTimeObject.toISO();
        startTimeISOs.push(startTimeISO);
      }
      return startTimeISOs;
    },
    eventLength() {
      let humanReadableEndTime = this.getReadableTimeFromISO(this.endTimeISO);
      let lengthOfEvent = this.durationHoursAndMinutes(
        this.startTimeISO,
        this.endTimeISO
      );
      return `${humanReadableEndTime} (${lengthOfEvent})`;
    },
  },
  methods: {
    getRelativeTimeFromISO(timeISO: string) {
      let humanReadableStartTime = this.getReadableTimeFromISO(timeISO);
      let timeFromNow = this.relativeTimeHoursAndMinutes(timeISO);
      return `${humanReadableStartTime} (${timeFromNow})`;
    },
    urlIsValid(str: string) {
      // Valid URL checker from Devshed
      // Sources:
      // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
      // http://forums.devshed.com/javascript-development-115/regexp-to-match-url-pattern-493764.html
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      return !!pattern.test(str);
    },
    onSubmit() {
      const variables = this.getVariablesForAddEvent();
      this.addEvent(...variables);
    },
  },
});
</script>
<template>
<div>
  <Form>
   <div v-if="channelLoading || tagsLoading"></div>
      <div class="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <FormTitle> Create Event </FormTitle>

          <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
            <FormRow :section-title="'Title'">
              <div class="flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="username"
                  id="username"
                  class="
                    flex-1
                    block
                    w-full
                    focus:ring-indigo-500 focus:border-indigo-500
                    min-w-0
                    rounded-none rounded-r-md
                    sm:text-sm
                    border-gray-300
                  "
                />
              </div>
            </FormRow>

            <FormRow :section-title="'More Info'">
              <TextEditor />
            </FormRow>
          </div>
        </div>
      </div>

      <div class="pt-5">
        <div class="flex justify-end">
          <CancelButton/>
          <SaveButton @click="onSubmit"/>
        </div>
      </div>
    </Form>

    <div v-for="(error, i) of channelError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
    <div v-for="(error, i) of tagsError?.graphQLErrors" :key="i">
      {{ error.message }}
    </div>
  </div>
</template>