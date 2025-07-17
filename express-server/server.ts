import cors from 'cors'
import express from 'express'
import * as PyMuPDFNode from "pymupdf-node"

const app = express()
const PORT = 8080
const HOST = 'http://localhost'

// cache fetched documents in memory for at least 5 minutes
const FETCH_CACHE_EXPIRES = 5 * 60 * 1000

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const pymupdf = await PyMuPDFNode.loadPyMuPDF("node_modules/pymupdf-node/pymupdf/pymupdf-1.26.0-cp312-abi3-pyodide_2024_0_wasm32.whl");
const pymupdf4LLM = await PyMuPDFNode.loadPyMuPDF4LLM("node_modules/pymupdf-node/pymupdf/pymupdf4llm-0.0.24-py3-none-any.whl");


const fetchCache: Map<string, { promise: Promise<Response>; expires: number }> =
  new Map()
function cachedFetch(url: string): Promise<Response> {
  let item = fetchCache.get(url)
  if (!item)
    fetchCache.set(
      url,
      (item = {
        promise: fetch(url),
        expires: Date.now() + FETCH_CACHE_EXPIRES,
      })
    )
  return item.promise
}

const responseCache: Map<
  string,
  { promise: Promise<ArrayBuffer>; expires: number }
> = new Map()
function cachedResponseArrayBuffer(
  url: string,
  res: Response
): Promise<ArrayBuffer> {
  let item = responseCache.get(url)
  if (!item)
    responseCache.set(
      url,
      (item = {
        promise: res.arrayBuffer(),
        expires: Date.now() + FETCH_CACHE_EXPIRES,
      })
    )
  return item.promise
}

setInterval(function () {
  const now = Date.now()
  fetchCache.forEach((value, key, map) => {
    if (value.expires < now) map.delete(key)
  })
  responseCache.forEach((value, key, map) => {
    if (value.expires < now) map.delete(key)
  })
}, FETCH_CACHE_EXPIRES)


// Helper function to load document from URL
async function loadDocumentFromUrl(url: string): Promise<any> {
  try {
    const response = await cachedFetch(url)
    const buffer = await cachedResponseArrayBuffer(url, response)
    let doc = new pymupdf.Document(null, buffer)
    return doc
  } catch (error) {
    throw new Error(`Failed to load document from URL: ${url}`)
  }
}

// Helper function to validate page number
function validatePageNumber(
  pageNumber: number,
  document: any
): number {
  if (
    isNaN(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > document.page_count
  ) {
    throw new Error('Invalid page number')
  }

  return pageNumber - 1
}

app.get(
  '/document/get-metadata',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ error: 'URL is required' })
      }

      const document = await loadDocumentFromUrl(url as string)
      const result = document.metadata
      res.json({ result })
    } catch (error) {
      next(error)
    }
  }
)

app.get(
  '/document/count-pages',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ error: 'URL is required' })
      }

      const document = await loadDocumentFromUrl(url as string)
      const result = document.page_count
      res.json({ result })
    } catch (error) {
      next(error)
    }
  }
)

app.get(
  '/document/to-markdown',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { url } = req.query
      if (!url) {
        return res.status(400).json({ error: 'URL is required' })
      }

      const document = await loadDocumentFromUrl(url as string)
      const md = pymupdf4LLM.to_markdown(document, {
        page_chunks: false,
        write_images: false,
        ignore_images: true,
        image_path: "",
        extract_words: false,
        show_progress: true,
      });
      res.json({ md })
    } catch (error) {
      next(error)
    }
  }
)

/********/

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`)
})

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Internal Server Error' })
    }
    next()
  }
)
