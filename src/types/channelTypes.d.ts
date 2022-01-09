import TagData from './tagTypes';

export type ChannelData = {
    url: string;
    name: string;
    description: string?;
    Organizers: [object];
    DiscussionsAggregate: {
        count: string;
    };
    EventsAggregate: {
        count: string;
    };
    Tags: [TagData];
}
