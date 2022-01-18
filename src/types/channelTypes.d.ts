import TagData from './tagTypes';

export type ChannelData = {
    uniqueName: string;
    name: string;
    description: string?;
    Posters: [object];
    DiscussionsAggregate: {
        count: string;
    };
    EventsAggregate: {
        count: string;
    };
    Tags: [TagData];
}
