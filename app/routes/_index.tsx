import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, json,  Outlet, useActionData, useNavigation } from '@remix-run/react';
import React from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "mp4 Downloader" },
    { name: "description", content: "A simple mp4 downloader for internet nudes" },
  ];
};

export async function action ({ request }: ActionFunctionArgs) {

  const formData = await request.formData();
  const videoUrl = formData.get("videoUrl") as string;

  // split the videoURl get the information before the extension and after the last slash.  Remove spaces and slashes from the url string and shorten or abbreviate so that the string is no longer than 20 characters before the extension

  const videoId = videoUrl.split('/').pop()?.split('.')[0].replace(/\s/g, '').replace(/\//g, '').slice(0, 20);

  console.log("video stuff from action", videoId, videoUrl);

  try {
    // Fetch the video
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Remix",
      },
    });

    if (!response.ok) {
      throw new Response("Failed to fetch video", { status: response.status });
    }

    const text = await response.text();

    const mp4Urls = extractMp4Urls(text);
    console.log("mp4Urls", mp4Urls);

    return json({ mp4Urls, videoId });
  } catch (error) {
    return json({ error: (error as Error).message }, { status: 500 });
  }
}

export default function Index () {
   const actionData = useActionData<{ mp4Urls: string[] , videoId:string,error?:Error}>();
   const [videoId, setVideoId] = React.useState<string | null>(null);

  const navigation = useNavigation();

React.useEffect(() => {
    if (actionData?.videoId) {
      setVideoId(actionData.videoId);
    }
  }, [actionData]);


  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url: string) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${videoId}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download video:', error);
    }
  };


  return (
    <div className="flex flex-col gap-5 font-sans p-4">
      <h1 className="text-2xl font-bold">Welcome to xHamsterdownloader!</h1>
      <p>
        Copy the video URL from xHamster and paste it in the input field to download the video.
      </p>

      <Form
        method='POST'
        className='mt-4 flex flex-col gap-2'
      >
        <label htmlFor='videoUrl'>Video Url</label>
        <input
          type='url'
          name='videoUrl'
          required
          autoComplete='on'
          placeholder='enter the video URL'
        className=
          "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {videoId ? <p className="text-sm text-gray-500">Video ID: {videoId}</p>:        <p className="text-sm text-gray-500">Please ensure the video URL is correct</p>
}
        <button
          type='submit'
          disabled={navigation.state === 'submitting'}
          className='bg-blue-500 text-white ph-9 px-4 py-2 rounded-md'
        >
          Submit Video URL
        </button>
      </Form>
{actionData?.mp4Urls?.map((url: string, index: number) => {
              return (
                <div
                  key={ index }
                  className="flex flex-col gap-2"
                >

                    <a
              href={url}
              onClick={(e) => handleDownload(e, url)}
              className="bg-blue-500 text-white ph-9 px-4 py-2 rounded-md"
            >
              Download {videoId}.mp4
            </a>
                  <video
                    controls
                    width="320%"
                    height="240"
                    loop
                    muted
                    playsInline
                    preload="auto"
                  >
                    <source src={url} type="video/mp4" />
                  </video>



               </div>
              );
              })}
      <footer className="text-sm text-gray-500">
        GitHub and Links
                  </footer>

      <Outlet />
      {actionData?.error && (
        <p className="text-red-500">{actionData.error?.toString()}</p>
      )}
    </div>
  );
}

  function extractMp4Urls (text: string) {
    const mp4Urls = [];
    const regex = /https?:\/\/[^\s]+(?<!\.t)\.mp4/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      mp4Urls.push(match[0]);
    }
    const singleUrl = [...new Set(mp4Urls)].filter(url => !url.includes('_TPL_.av1')).map(callbackfn => callbackfn.replace(/\\/g, ''));

    return singleUrl;

  }

