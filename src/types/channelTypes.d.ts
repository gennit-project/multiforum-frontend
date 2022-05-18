import TagData from './tagTypes';
import UserData from './userTypes';

export type ChannelData = {
    uniqueName: string;
    name: string;
    description: string?;
    Admins: [UserData];
    DiscussionsAggregate: {
        count: string;
    };
    EventsAggregate: {
        count: string;
    };
    Tags: [TagData];
}
