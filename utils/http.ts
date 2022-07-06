import fetch from 'isomorphic-unfetch';

export async function fetchHttp<JSON = any>(input: RequestInfo, init?: RequestInit): Promise<JSON> {
  const res = await fetch(input, init);

  try {
    return res.json();
  } catch (err) {
    console.error(`Error while fetching ${input}, ${err}`);
    // @ts-ignore
    return err;
  }
}

export async function fetchHttpRaw(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return fetch(input, init);
}
