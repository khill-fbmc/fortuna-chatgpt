import {
  OPENAI_API_HOST,
  OPENAI_API_KEY,
  OPENAI_API_TYPE,
  OPENAI_API_VERSION,
  OPENAI_ORGANIZATION,
} from '@/utils/app/const';

import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const JsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

const handler = async () => {
  const url = `${OPENAI_API_HOST}/v1/models`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Organization': OPENAI_ORGANIZATION,
      },
    });

    if (response.status === 401) {
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
    } else if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${
          response.status
        }: ${await response.text()}`,
      );
      throw new Error('OpenAI API returned an error');
    }

    const json = await response.json();

    console.log(json);

    const models = json.data.reduce((acc: OpenAIModel[], model: any) => {
      const modelId = model.id as OpenAIModelID;
      if (Object.keys(OpenAIModels).includes(modelId)) {
        acc.push(OpenAIModels[modelId]);
      }
      return acc;
    }, [] as OpenAIModel[]);

    return JsonResponse(models);
  } catch (e) {
    console.error(e);

    return JsonResponse({ error: (e as Error).message }, 500);
  }
};

export default handler;
