import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import axios, { AxiosResponse } from 'axios'
import { PassThrough, Readable } from 'stream'
import { URL } from 'url'

const handler: Handler = async (
  event: HandlerEvent,
): Promise<HandlerResponse> => {
  const sourceUrl = event.queryStringParameters?.url

  if (!sourceUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL required.' }),
    }
  }

  try {
    const response: AxiosResponse<Readable> = await axios({
      method: 'get',
      url: sourceUrl,
      responseType: 'stream',
    })

    const contentType =
      response.headers['content-type'] || 'application/octet-stream'
    const isM3U8 = contentType.includes('application/vnd.apple.mpegurl')

    if (isM3U8) {
      let body = await streamToString(response.data)
      const baseUrl = new URL(sourceUrl)

      body = body.replace(
        /([^\s]+\.ts)/g,
        (match) => new URL(match, baseUrl).href,
      )

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        },
        body,
      }
    }

    const readableStream: Readable = response.data
    const passthroughStream = new PassThrough()

    readableStream.pipe(passthroughStream)

    const buffer = await streamToBuffer(passthroughStream)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      },
      isBase64Encoded: true,
      body: buffer.toString('base64'),
    }
  } catch (error) {
    console.error('Error when accessing URL:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error accessing source stream.' }),
    }
  }
}

async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    stream.on('error', reject)
  })
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export { handler }
