import TagData from './tagTypes';
import UserData from './userTypes';

export type ChannelData = {
    uniqueName: string;
    name: string;
    description?: string;
    Admins: Array[UserData];
    DiscussionsAggregate: {
        count: string;
    };
    EventsAggregate: {
        count: string;
    };
    Tags: Array[TagData];
}

export type CreateEditChannelFormValues = {
    uniqueName: string;
    description: string;
    selectedTags: Array[string]
    username: string;
}