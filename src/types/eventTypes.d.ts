export type EventData = {
    id: number;
    title: string;
    type: string;
    location: string;
    description: string;
    date: string;
    dateFull: string;
    channelId: string;
};

export type Point = {
    lat: number,
    lng: number
}