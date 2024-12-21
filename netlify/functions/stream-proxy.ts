import { Handler } from '@netlify/functions'
import axios from 'axios'
import { Readable } from 'stream'
import { URL } from 'url'

const handler: Handler = async (event) => {
  const sourceUrl = event.queryStringParameters?.url

  if (!sourceUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL is required.' }),
    }
  }

  try {
    const response = await axios({
      method: 'get',
      url: sourceUrl,
      responseType: 'stream',
    })

    const contentType =
      response.headers['content-type'] || 'application/octet-stream'

    if (contentType.includes('application/vnd.apple.mpegurl')) {
      const body = await streamToString(response.data)
      const baseUrl = new URL(sourceUrl)

      const adjustedBody = body.replace(/(https?:\/\/[^\s]+)/g, (match) => {
        const absoluteUrl = new URL(match, baseUrl)
        return `https://${event.headers.host}/.netlify/functions/stream-proxy?url=${encodeURIComponent(
          absoluteUrl.href,
        )}`
      })

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
        },
        body: adjustedBody,
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      },
      body: (await streamToBuffer(response.data)).toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('Error fetching the URL:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch the source stream.' }),
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
