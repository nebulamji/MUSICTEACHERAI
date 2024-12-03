declare module 'ytdl-core' {
    interface VideoInfo {
        formats: any[];
        videoDetails: {
            title: string;
            lengthSeconds: string;
        };
    }

    interface Options {
        quality?: string | number;
        filter?: string | ((format: any) => boolean);
        format?: any;
    }

    function getInfo(url: string): Promise<VideoInfo>;
    function getBasicInfo(url: string): Promise<VideoInfo>;
    function downloadFromInfo(info: VideoInfo, options?: Options): NodeJS.ReadableStream;
    
    function validateURL(url: string): boolean;
    function validateID(id: string): boolean;
    
    export default function ytdl(url: string, options?: Options): NodeJS.ReadableStream;
    export { getInfo, getBasicInfo, downloadFromInfo, validateURL, validateID };
}
