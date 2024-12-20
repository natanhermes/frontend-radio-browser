import { Handler } from '@netlify/functions'
import fetch from 'node-fetch'

const handler: Handler = async (event) => {
  const { url } = event.queryStringParameters || {}

  if (!url) {
    return {
      statusCode: 400,
      body: 'URL parameter is required',
    }
  }

  try {
    const response = await fetch(url)
    const body = await response.text()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/x-mpegURL',
      },
      body,
    }
  } catch (error) {
    const e = error as Error
    return {
      statusCode: 500,
      body: 'Error fetching the URL: ' + e.message,
    }
  }
}

export { handler }
